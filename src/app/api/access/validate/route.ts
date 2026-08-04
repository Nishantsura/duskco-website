import { NextResponse } from "next/server";
import { ACCESS_COOKIE, dropWindow, isDropOpen } from "@/lib/access/config";
import { lookupCode } from "@/lib/access/codes";
import { signSession } from "@/lib/access/session";
import { rateLimit, clientIp } from "@/lib/access/rate-limit";

// Cap a session at 12h even if the drop window is open-ended (dev), so cookies
// don't live indefinitely.
const MAX_SESSION_MS = 12 * 60 * 60 * 1000;

export async function POST(request: Request) {
  // Throttle guessing: 12 attempts per minute per IP.
  const limit = await rateLimit(`access:validate:${clientIp(request)}`, 12, 60);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let code = "";
  try {
    ({ code = "" } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!code.trim()) {
    return NextResponse.json({ error: "Enter your access code." }, { status: 400 });
  }

  const now = Date.now();
  const window = dropWindow();

  if (now < window.opensAt) {
    return NextResponse.json(
      { error: "The drop hasn't opened yet." },
      { status: 403 }
    );
  }
  if (!isDropOpen(now, window)) {
    return NextResponse.json({ error: "The drop has closed." }, { status: 403 });
  }

  const check = await lookupCode(code);
  if (!check.valid) {
    return NextResponse.json(
      { error: "That code isn't valid." },
      { status: 401 }
    );
  }

  const exp = Math.min(window.closesAt, now + MAX_SESSION_MS);
  const token = await signSession({ email: check.email, exp });

  const res = NextResponse.json({ success: true });
  res.cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(1, Math.floor((exp - now) / 1000)),
  });
  return res;
}
