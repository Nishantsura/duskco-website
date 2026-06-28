#!/usr/bin/env node

const STORE_DOMAIN = "duskco-brqicsmo.myshopify.com";
const API_VERSION = "2025-04";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const BASE = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}`;

// "storefront" publication ID from the store
const PUBLICATION_ID = "gid://shopify/Publication/184328519791";

const OUR_PRODUCT_IDS = [
  "gid://shopify/Product/15122856738927",
  "gid://shopify/Product/15122856771695",
  "gid://shopify/Product/15122856804463",
  "gid://shopify/Product/15122856837231",
  "gid://shopify/Product/15122856902767",
  "gid://shopify/Product/15122856968303",
  "gid://shopify/Product/15122857001071",
  "gid://shopify/Product/15122857033839",
  "gid://shopify/Product/15122857066607",
  "gid://shopify/Product/15122857099375",
  "gid://shopify/Product/15122857132143",
  "gid://shopify/Product/15122857197679",
  "gid://shopify/Product/15122857230447",
  "gid://shopify/Product/15122857263215",
  "gid://shopify/Product/15122857295983",
];

async function adminGraphql(query, variables = {}) {
  const res = await fetch(`${BASE}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", JSON.stringify(json.errors));
    return null;
  }
  return json.data;
}

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`Publishing ${OUR_PRODUCT_IDS.length} products to "storefront" channel...\n`);

  for (let i = 0; i < OUR_PRODUCT_IDS.length; i++) {
    const productId = OUR_PRODUCT_IDS[i];

    const data = await adminGraphql(`
      mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          publishable {
            ... on Product {
              title
              id
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      id: productId,
      input: [{ publicationId: PUBLICATION_ID }],
    });

    const result = data?.publishablePublish;
    const errors = result?.userErrors ?? [];
    const title = result?.publishable?.title ?? productId;

    if (errors.length > 0) {
      console.log(`[${i + 1}/15] ✗ "${title}" — ${errors[0].message}`);
    } else {
      console.log(`[${i + 1}/15] ✓ "${title}" — published to storefront channel`);
    }

    await delay(300);
  }

  console.log("\nDone! Products should now be accessible via Storefront API.");
}

main().catch(console.error);
