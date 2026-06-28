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

async function main() {
  // Get all products
  const data = await adminFetch("/products.json?limit=250&fields=id,title,status");
  const products = data?.products ?? [];
  const drafts = products.filter((p) => p.status === "draft");

  console.log(`Found ${drafts.length} draft products to publish.\n`);

  for (let i = 0; i < drafts.length; i++) {
    const p = drafts[i];
    console.log(`[${i + 1}/${drafts.length}] Publishing "${p.title}"...`);
    const result = await adminFetch(`/products/${p.id}.json`, {
      method: "PUT",
      body: JSON.stringify({ product: { id: p.id, status: "active" } }),
    });
    if (result?.product?.status === "active") {
      console.log(`  ✓ Published`);
    } else {
      console.log(`  ✗ Failed`);
    }
    await delay(400);
  }

  console.log("\nAll products published and active.");
}

main().catch(console.error);
