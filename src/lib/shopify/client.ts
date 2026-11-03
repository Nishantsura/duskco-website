const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";

export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  // Fail loudly on missing config. Without this the template below interpolates
  // `undefined` into the hostname and the request dies as an opaque DNS error
  // ("fetch failed" / ENOTFOUND) several frames away from the real cause.
  if (!domain || !token) {
    const missing = [
      !domain && "SHOPIFY_STORE_DOMAIN",
      !token && "SHOPIFY_STOREFRONT_TOKEN",
    ].filter(Boolean);
    throw new Error(
      `Shopify is not configured: ${missing.join(", ")} missing. Add it to .env.local (see docs/) or pull it with \`vercel env pull .env.local\`.`
    );
  }

  const url = `https://${domain}/api/${apiVersion}/graphql.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
