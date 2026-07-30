// Access-gate configuration. Kept dependency-free and edge-safe so it can be
// imported from `src/proxy.ts` (runs on the edge) as well as server routes.
//
// The drop is invite-only: the ONLY way to see or shop the pieces is with an
// access code emailed to waitlist members. This module centralises the shared
// settings for that gate.

export const ACCESS_COOKIE = "dusk-access";

// Paths that require a valid access session. Everything else (home/waitlist,
// policies, about, contact, the /access page itself) stays public.
export const PROTECTED_PREFIXES = ["/shop", "/collections", "/products"];

// Dev fallback code — active only outside production, so we can exercise the
// full gate in the local preview before Upstash + real codes exist.
export function devCode(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  return process.env.ACCESS_DEV_CODE || "DUSK-DEV";
}

// Signing secret for the session cookie. MUST be set in production; a stable
// dev default keeps local sessions working without configuration.
export function sessionSecret(): string {
  return (
    process.env.ACCESS_SESSION_SECRET ||
    "dev-only-insecure-secret-change-in-production"
  );
}

export interface DropWindow {
  opensAt: number; // epoch ms
  closesAt: number; // epoch ms
}

// The fixed, global drop window. If the env vars are unset (e.g. local dev),
// default to "always open" so testing isn't blocked. In production, set both
// DROP_OPENS_AT and DROP_CLOSES_AT to ISO datetimes.
export function dropWindow(): DropWindow {
  const open = process.env.DROP_OPENS_AT;
  const close = process.env.DROP_CLOSES_AT;
  return {
    opensAt: open ? Date.parse(open) : 0,
    closesAt: close ? Date.parse(close) : Number.MAX_SAFE_INTEGER,
  };
}

export function isDropOpen(now: number, w: DropWindow = dropWindow()): boolean {
  return now >= w.opensAt && now < w.closesAt;
}
