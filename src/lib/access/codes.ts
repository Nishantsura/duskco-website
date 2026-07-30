// Access-code validation. Talks to Upstash Redis over its REST API (no SDK, so
// no new dependency). Each minted code is stored as:
//     key:  access:code:<CODE>
//     val:  JSON { email }
// Codes are per-person and reusable for the duration of the drop window — we do
// not burn them on use — so validation is a simple existence check. The drop
// window (checked by the caller) is what bounds their lifetime.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export function codeStoreConfigured(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

export function codeKey(code: string): string {
  return `access:code:${code.trim().toUpperCase()}`;
}

async function upstash(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(UPSTASH_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (json.error) throw new Error(`Upstash error: ${json.error}`);
  return json.result;
}

export interface CodeCheck {
  valid: boolean;
  email?: string;
}

// Validates that a code exists (in Upstash, or matches the dev fallback).
// Does NOT check the drop window — the caller composes that in.
export async function lookupCode(code: string): Promise<CodeCheck> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false };

  // Dev fallback so the gate is testable before Upstash exists.
  const { devCode } = await import("./config");
  const dev = devCode();
  if (dev && normalized === dev.toUpperCase()) {
    return { valid: true, email: "dev@dusk.co" };
  }

  if (!codeStoreConfigured()) return { valid: false };

  try {
    const raw = (await upstash(["GET", codeKey(normalized)])) as string | null;
    if (!raw) return { valid: false };
    try {
      const parsed = JSON.parse(raw) as { email?: string };
      return { valid: true, email: parsed.email };
    } catch {
      return { valid: true };
    }
  } catch {
    return { valid: false };
  }
}
