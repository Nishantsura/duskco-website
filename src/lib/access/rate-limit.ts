// Fixed-window rate limiting over Upstash Redis (same REST API the code store
// uses, no new dependency). One INCR per hit; the first hit in a window sets the
// TTL. If Upstash is unreachable we FAIL OPEN — a limiter outage must never lock
// real customers out of the drop; the access-code check is the real gate.

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

async function pipeline(commands: (string | number)[][]): Promise<{ result: unknown }[]> {
  const res = await fetch(`${URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * @param id       stable caller identity (e.g. "access:validate:<ip>")
 * @param limit    max hits allowed per window
 * @param windowSec window length in seconds
 */
export async function rateLimit(
  id: string,
  limit: number,
  windowSec: number
): Promise<RateResult> {
  if (!URL || !TOKEN) return { ok: true, remaining: limit, retryAfter: 0 };
  const key = `rl:${id}`;
  try {
    // INCR the counter, and set the window TTL only if one isn't already set.
    const [incr] = await pipeline([
      ["INCR", key],
      ["EXPIRE", key, windowSec, "NX"],
    ]);
    const count = Number(incr.result) || 0;
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfter: count <= limit ? 0 : windowSec,
    };
  } catch {
    // Limiter unavailable → don't block; the code check still protects the gate.
    return { ok: true, remaining: limit, retryAfter: 0 };
  }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
