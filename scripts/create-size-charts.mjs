#!/usr/bin/env node

const STORE_DOMAIN = "duskco-brqicsmo.myshopify.com";
const API_VERSION = "2025-04";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const BASE = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}`;

async function gql(query, variables = {}) {
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
    console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Size chart data by category ──

const TSHIRT_CHART = {
  unit: "IN",
  columns: ["Chest", "Length", "Shoulder", "Sleeve"],
  rows: [
    { size: "XXS", values: [40, 26, 19, 8.5] },
    { size: "XS", values: [42, 27, 20, 9] },
    { size: "S", values: [44, 28, 21, 9.5] },
    { size: "M", values: [46, 29, 22, 10] },
    { size: "L", values: [48, 30, 23, 10.5] },
    { size: "XL", values: [50, 31, 24, 11] },
    { size: "XXL", values: [52, 32, 25, 11.5] },
  ],
};

const HOODIE_CHART = {
  unit: "IN",
  columns: ["Chest", "Length", "Shoulder", "Sleeve"],
  rows: [
    { size: "XXS", values: [42, 27, 20, 24] },
    { size: "XS", values: [44, 28, 21, 24.5] },
    { size: "S", values: [46, 29, 22, 25] },
    { size: "M", values: [48, 30, 23, 25.5] },
    { size: "L", values: [50, 31, 24, 26] },
    { size: "XL", values: [52, 32, 25, 26.5] },
    { size: "XXL", values: [54, 33, 26, 27] },
  ],
};

const JACKET_CHART = {
  unit: "IN",
  columns: ["Chest", "Length", "Shoulder", "Sleeve"],
  rows: [
    { size: "XS", values: [44, 28, 21, 25] },
    { size: "S", values: [46, 29, 22, 25.5] },
    { size: "M", values: [48, 30, 23, 26] },
    { size: "L", values: [50, 31, 24, 26.5] },
    { size: "XL", values: [52, 32, 25, 27] },
  ],
};

const DENIM_JACKET_CHART = {
  unit: "IN",
  columns: ["Chest", "Length", "Shoulder", "Sleeve"],
  rows: [
    { size: "S", values: [46, 27, 22, 25] },
    { size: "M", values: [48, 28, 23, 25.5] },
    { size: "L", values: [50, 29, 24, 26] },
    { size: "XL", values: [52, 30, 25, 26.5] },
  ],
};

const CARGO_CHART = {
  unit: "IN",
  columns: ["Waist", "Length", "Bottom", "Round", "Thigh", "Shorts"],
  rows: [
    { size: "W28", values: [28, 42, 24.5, 25.5, 25, 21.5] },
    { size: "W30", values: [30, 42.5, 25, 27, 26, 22] },
    { size: "W32", values: [32, 43, 26, 28, 26.5, 22.25] },
    { size: "W34", values: [34, 44, 26.5, 28.5, 27, 22.5] },
    { size: "W36", values: [36, 44, 27, 29.5, 27, 22.5] },
  ],
};

// Map product handles to their size chart
const PRODUCT_CHARTS = {
  "puyma-t-shirt-red": TSHIRT_CHART,
  "tiger-fury-t-shirt-orange": TSHIRT_CHART,
  "swan-t-shirt-pink": TSHIRT_CHART,
  "fade-flora-ombre-t-shirt": TSHIRT_CHART,
  "iced-t-shirt-black": TSHIRT_CHART,
  "serpent-bloom-zipper-hoodie-red": HOODIE_CHART,
  "meadow-blue-hoodie": HOODIE_CHART,
  "favourite-child-hoodie-brown": HOODIE_CHART,
  "nocturnal-hoodie-black": HOODIE_CHART,
  "boxy-utility-jacket-brown": JACKET_CHART,
  "techwear-over-jacket-black": JACKET_CHART,
  "indigo-bloom-denim-jacket": DENIM_JACKET_CHART,
  "ripstop-cargos-black": CARGO_CHART,
  "ripstop-cargos-olive": CARGO_CHART,
  "ripstop-cargos-brown": CARGO_CHART,
};

async function main() {
  // Step 1: Create metafield definition
  console.log("Creating metafield definition for size_chart...");
  const defResult = await gql(`
    mutation {
      metafieldDefinitionCreate(definition: {
        name: "Size Chart"
        namespace: "custom"
        key: "size_chart"
        type: "json"
        ownerType: PRODUCT
        access: {
          storefront: PUBLIC_READ
        }
      }) {
        createdDefinition { id name }
        userErrors { field message }
      }
    }
  `);

  const defErrors = defResult?.metafieldDefinitionCreate?.userErrors ?? [];
  if (defErrors.length > 0) {
    if (defErrors[0].message.includes("already exists")) {
      console.log("  Definition already exists, continuing.\n");
    } else {
      console.log("  Errors:", JSON.stringify(defErrors));
    }
  } else {
    console.log("  ✓ Created:", defResult?.metafieldDefinitionCreate?.createdDefinition?.name);
  }

  // Step 2: Fetch all our products
  console.log("\nFetching products...");
  const prodData = await gql(`
    {
      products(first: 50, query: "vendor:DUSK&CO") {
        edges {
          node {
            id
            handle
          }
        }
      }
    }
  `);

  const products = prodData?.products?.edges?.map((e) => e.node) ?? [];
  console.log(`  Found ${products.length} products.\n`);

  // Step 3: Set size chart metafield on each product
  let updated = 0;
  for (const product of products) {
    const chart = PRODUCT_CHARTS[product.handle];
    if (!chart) {
      console.log(`  Skipping "${product.handle}" — no chart defined`);
      continue;
    }

    console.log(`  Setting size chart on "${product.handle}"...`);
    const result = await gql(`
      mutation SetMetafield($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id }
          userErrors { field message }
        }
      }
    `, {
      input: {
        id: product.id,
        metafields: [{
          namespace: "custom",
          key: "size_chart",
          type: "json",
          value: JSON.stringify(chart),
        }],
      },
    });

    const errors = result?.productUpdate?.userErrors ?? [];
    if (errors.length > 0) {
      console.log(`    ✗ ${errors[0].message}`);
    } else {
      console.log(`    ✓ Done`);
      updated++;
    }
    await delay(300);
  }

  console.log(`\nFinished. Updated ${updated} products with size charts.`);
  console.log("Size charts are editable in Shopify Admin → Products → [product] → Metafields.");
}

main().catch(console.error);
