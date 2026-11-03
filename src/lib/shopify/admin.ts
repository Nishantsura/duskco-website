// Admin API auth for the new Shopify store (Dev Dashboard app).
//
// Unlike legacy custom apps, Dev Dashboard apps don't issue a permanent offline
// Admin API token. Instead we mint a short-lived (~24h) token on demand with the
// OAuth client-credentials grant (client ID + secret) and cache it in module scope
// until it nears expiry. Set SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET in env.
//
// If SHOPIFY_ADMIN_TOKEN is set (e.g. a legacy long-lived custom-app token), it
// wins and no minting happens.

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

let cached: { token: string; expiresAt: number } | null = null;

export async function getAdminAccessToken(): Promise<string> {
  const staticToken = process.env.SHOPIFY_ADMIN_TOKEN;
  if (staticToken) return staticToken;

  if (!domain || !clientId || !clientSecret) {
    const missing = [
      !domain && "SHOPIFY_STORE_DOMAIN",
      !clientId && "SHOPIFY_CLIENT_ID",
      !clientSecret && "SHOPIFY_CLIENT_SECRET",
    ].filter(Boolean);
    throw new Error(
      `Shopify Admin API not configured: ${missing.join(", ")} missing (or set a static SHOPIFY_ADMIN_TOKEN).`
    );
  }

  // Reuse the cached token until 5 minutes before it expires.
  if (cached && Date.now() < cached.expiresAt - 5 * 60_000) {
    return cached.token;
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Shopify admin token mint failed ${res.status}: ${await res.text()}`
    );
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cached = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cached.token;
}
