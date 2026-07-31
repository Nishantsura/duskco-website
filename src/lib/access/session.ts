// Signed access-session token. Uses Web Crypto (HMAC-SHA256), which is available
// in both the edge (proxy) and Node (route handlers) runtimes, so we add no
// dependency and the same code verifies sessions everywhere.
//
// Token format:  base64url(payloadJSON) + "." + base64url(hmac)

import { sessionSecret } from "./config";

export interface AccessSession {
  email?: string; // waitlist email the code belongs to (if known)
  exp: number; // epoch ms — session expiry (set to the drop close time)
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  const bin = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(session: AccessSession): Promise<string> {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(session)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifySession(token: string | undefined): Promise<AccessSession | null> {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      fromBase64Url(sig),
      new TextEncoder().encode(payload)
    );
    if (!ok) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as AccessSession;
    if (typeof session.exp !== "number" || Date.now() >= session.exp) return null;
    return session;
  } catch {
    return null;
  }
}
