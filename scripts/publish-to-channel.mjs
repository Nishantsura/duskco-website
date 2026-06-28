#!/usr/bin/env node

const STORE_DOMAIN = "duskco-brqicsmo.myshopify.com";
const API_VERSION = "2025-04";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const BASE = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}`;

async function adminFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
      ...opts.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, JSON.stringify(json));
    return null;
  }
  return json;
}

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const OUR_PRODUCT_IDS = [
  15122856738927,
  15122856771695,
  15122856804463,
  15122856837231,
  15122856902767,
  15122856968303,
  15122857001071,
  15122857033839,
  15122857066607,
  15122857099375,
  15122857132143,
  15122857197679,
  15122857230447,
  15122857263215,
  15122857295983,
];

async function main() {
  const publishedAt = new Date().toISOString();
  console.log(`Publishing ${OUR_PRODUCT_IDS.length} products to Online Store...\n`);

  for (let i = 0; i < OUR_PRODUCT_IDS.length; i++) {
    const id = OUR_PRODUCT_IDS[i];
    const result = await adminFetch(`/products/${id}.json`, {
      method: "PUT",
      body: JSON.stringify({
        product: { id, published_at: publishedAt, published_scope: "global" },
      }),
    });
    const p = result?.product;
    if (p?.published_at) {
      console.log(`[${i + 1}/15] ✓ "${p.title}" — published`);
    } else {
      console.log(`[${i + 1}/15] ✗ ID ${id} — failed`);
    }
    await delay(400);
  }

  console.log("\nDone. Products should now appear via Storefront API.");
}

main().catch(console.error);
