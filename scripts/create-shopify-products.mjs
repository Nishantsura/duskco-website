#!/usr/bin/env node

const STORE_DOMAIN = "duskco-brqicsmo.myshopify.com";
const API_VERSION = "2025-04";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error("Missing SHOPIFY_ADMIN_TOKEN env var. Run with:");
  console.error(
    "  SHOPIFY_ADMIN_TOKEN=shpat_xxx node scripts/create-shopify-products.mjs"
  );
  process.exit(1);
}

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
    console.error(`Error ${res.status} on ${path}:`, JSON.stringify(json, null, 2));
    return null;
  }
  return json;
}

const PRODUCTS = [
  {
    title: "Puyma T-Shirt — Red",
    body_html:
      "<p>Striped puma artwork in fiery red tones with raised DUSK&CO script branding across front. Speed, instinct, and raw energy in a statement silhouette.</p>",
    vendor: "DUSK&CO",
    product_type: "T-Shirts",
    tags: "t-shirts, oversized, screen-print",
    status: "draft",
    variants: [
      { option1: "XXS", price: "4500.00" },
      { option1: "XS", price: "4500.00" },
      { option1: "S", price: "4500.00" },
      { option1: "M", price: "4500.00" },
      { option1: "L", price: "4500.00" },
      { option1: "XL", price: "4500.00" },
      { option1: "XXL", price: "4500.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/adcsxesad.jpg?v=1782113672&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/adxweasxq2.jpg?v=1782113676&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/wrcrwdeacx.jpg?v=1782113702&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/aqexewasdx.jpg?v=1782113679&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/dgbetbet.jpg?v=1782113684&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/wedxwesa.jpg?v=1782113693&width=1946" },
    ],
  },
  {
    title: "Tiger Fury T-Shirt — Orange",
    body_html:
      "<p>Vibrant orange tee featuring a fierce tiger graphic with puff and screen print details. Textured raised elements combined with smooth printing create a dimensional aesthetic.</p>",
    vendor: "DUSK&CO",
    product_type: "T-Shirts",
    tags: "t-shirts, oversized, puff-print",
    status: "draft",
    variants: [
      { option1: "XXS", price: "4900.00" },
      { option1: "XS", price: "4900.00" },
      { option1: "S", price: "4900.00" },
      { option1: "M", price: "4900.00" },
      { option1: "L", price: "4900.00" },
      { option1: "XL", price: "4900.00" },
      { option1: "XXL", price: "4900.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/ersfesd.jpg?v=1779114955&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/ersgveds.jpg?v=1779114955&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/3rgvfcer.jpg?v=1779115036&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/y5gv5t34.jpg?v=1779114980&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/e2wdcfewsa.jpg?v=1779115011&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/5trfcew.jpg?v=1779115027&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/5trgevc5rd.jpg?v=1779115022&width=1946" },
    ],
  },
  {
    title: "Swan T-Shirt — Pink",
    body_html:
      "<p>Graceful silhouette of a swan flowing across the garment through layered pink tones and fluid shapes. Discharge print with puff screen-printed branding and ribbed neckline.</p>",
    vendor: "DUSK&CO",
    product_type: "T-Shirts",
    tags: "t-shirts, oversized, discharge-print",
    status: "draft",
    variants: [
      { option1: "XXS", price: "4200.00" },
      { option1: "XS", price: "4200.00" },
      { option1: "S", price: "4200.00" },
      { option1: "M", price: "4200.00" },
      { option1: "L", price: "4200.00" },
      { option1: "XL", price: "4200.00" },
      { option1: "XXL", price: "4200.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/rgv5rgfcrd.jpg?v=1779367146&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/efsc4efcds.jpg?v=1779367154&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/t4bv5tgrvtr.jpg?v=1779367174&width=1946" },
    ],
  },
  {
    title: "Fade Flora Ombre T-Shirt",
    body_html:
      "<p>Heavyweight waffle construction offers a structured feel while maintaining breathability. An easy statement piece for year-round wear with a relaxed silhouette.</p>",
    vendor: "DUSK&CO",
    product_type: "T-Shirts",
    tags: "t-shirts, oversized, ombre, waffle",
    status: "draft",
    variants: [
      { option1: "XXS", price: "5900.00" },
      { option1: "XS", price: "5900.00" },
      { option1: "S", price: "5900.00" },
      { option1: "M", price: "5900.00" },
      { option1: "L", price: "5900.00" },
      { option1: "XL", price: "5900.00" },
      { option1: "XXL", price: "5900.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/wecweadsx.jpg?v=1782114211&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/wdacxwda.jpg?v=1782114208&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/efasefds.jpg?v=1782466437&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/adzcsdz.jpg?v=1782114195&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/wdcweasxsa.jpg?v=1782466408&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/rtegv4etg3.jpg?v=1782114203&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/wrcf3ws2.jpg?v=1782114215&width=1946" },
    ],
  },
  {
    title: "Iced T-Shirt — Black",
    body_html:
      "<p>Premium cotton tee with 400+ sparkling studs embroidered on the front. Loose fit, round neck, short sleeves. A statement piece that catches light from every angle.</p>",
    vendor: "DUSK&CO",
    product_type: "T-Shirts",
    tags: "t-shirts, oversized, embroidered, studs",
    status: "draft",
    variants: [
      { option1: "XXS", price: "7500.00" },
      { option1: "XS", price: "7500.00" },
      { option1: "S", price: "7500.00" },
      { option1: "M", price: "7500.00" },
      { option1: "L", price: "7500.00" },
      { option1: "XL", price: "7500.00" },
      { option1: "XXL", price: "7500.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/jiohyigb.jpg?v=1758906255&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/exwedwea.jpg?v=1758906255&width=1946" },
    ],
  },
  {
    title: "Serpent Bloom Zipper Hoodie — Red",
    body_html:
      "<p>Intricate serpent and floral composition on the back with vibrant blues and greens contrasting the red base. Features ribbed cuffs and a discreet thumb hole for premium comfort and winter layering versatility.</p>",
    vendor: "DUSK&CO",
    product_type: "Hoodies",
    tags: "hoodies, zipper, oversized, screen-print",
    status: "draft",
    variants: [
      { option1: "XXS", price: "9995.00", compare_at_price: "14000.00" },
      { option1: "XS", price: "9995.00", compare_at_price: "14000.00" },
      { option1: "S", price: "9995.00", compare_at_price: "14000.00" },
      { option1: "M", price: "9995.00", compare_at_price: "14000.00" },
      { option1: "L", price: "9995.00", compare_at_price: "14000.00" },
      { option1: "XL", price: "9995.00", compare_at_price: "14000.00" },
      { option1: "XXL", price: "9995.00", compare_at_price: "14000.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG00631.jpg?v=1764338031&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG00512.jpg?v=1764338031&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG00572.jpg?v=1764338031&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG00597.jpg?v=1764338031&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/hbkjlb_28b26771-2ea2-45e4-a824-c2ac5bc5fd84.jpg?v=1764338100&width=1946" },
    ],
  },
  {
    title: "Meadow Blue Hoodie",
    body_html:
      "<p>Florals and butterflies via detailed screen-printing across front, back, and sleeves. A vivid base that heightens the contrast of the yellow florals.</p>",
    vendor: "DUSK&CO",
    product_type: "Hoodies",
    tags: "hoodies, oversized, screen-print, floral",
    status: "draft",
    variants: [
      { option1: "XXS", price: "9995.00", compare_at_price: "14500.00" },
      { option1: "XS", price: "9995.00", compare_at_price: "14500.00" },
      { option1: "S", price: "9995.00", compare_at_price: "14500.00" },
      { option1: "M", price: "9995.00", compare_at_price: "14500.00" },
      { option1: "L", price: "9995.00", compare_at_price: "14500.00" },
      { option1: "XL", price: "9995.00", compare_at_price: "14500.00" },
      { option1: "XXL", price: "9995.00", compare_at_price: "14500.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG01323.jpg?v=1764337851&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG01248.jpg?v=1764337856&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG01277.jpg?v=1764337861&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG01312.jpg?v=1764337868&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG01333.jpg?v=1764337873&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG01292.jpg?v=1764337881&width=1946" },
    ],
  },
  {
    title: "Favourite Child Hoodie — Brown",
    body_html:
      "<p>The iconic Favourite Child motif on heavyweight 500 GSM cotton fleece. Oversized fit with hood. Built for comfort, designed for the street.</p>",
    vendor: "DUSK&CO",
    product_type: "Hoodies",
    tags: "hoodies, oversized, heavyweight, screen-print",
    status: "draft",
    variants: [
      { option1: "XXS", price: "8995.00" },
      { option1: "XS", price: "8995.00" },
      { option1: "S", price: "8995.00" },
      { option1: "M", price: "8995.00" },
      { option1: "L", price: "8995.00" },
      { option1: "XL", price: "8995.00" },
      { option1: "XXL", price: "8995.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/D1.jpg?v=1741167824&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/esdca.jpg?v=1741167892&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/erscdsa.jpg?v=1741167892&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/dazCaSD.jpg?v=1741167892&width=1946" },
    ],
  },
  {
    title: "Nocturnal Hoodie — Black",
    body_html:
      "<p>Premium oversized unisex fit with 750,000 individual embroidery stitches on the front and back. 450 GSM brushed cotton fleece blending comfort and style.</p>",
    vendor: "DUSK&CO",
    product_type: "Hoodies",
    tags: "hoodies, oversized, embroidered, premium",
    status: "draft",
    variants: [
      { option1: "XXS", price: "9995.00", compare_at_price: "13995.00" },
      { option1: "XS", price: "9995.00", compare_at_price: "13995.00" },
      { option1: "S", price: "9995.00", compare_at_price: "13995.00" },
      { option1: "M", price: "9995.00", compare_at_price: "13995.00" },
      { option1: "L", price: "9995.00", compare_at_price: "13995.00" },
      { option1: "XL", price: "9995.00", compare_at_price: "13995.00" },
      { option1: "XXL", price: "9995.00", compare_at_price: "13995.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/rwfdeccsx.jpg?v=1732202045&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/DSC04959copy11.jpg?v=1732201862&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/DSC05035copy.jpg?v=1732201872&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/ybg87yhu.jpg?v=1732201979&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/DSC05037copy.jpg?v=1732201872&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/bhnu898.jpg?v=1732201984&width=1946" },
    ],
  },
  {
    title: "Boxy Utility Jacket — Brown",
    body_html:
      "<p>Lightweight winter layering piece with minimal aesthetic. 60% cotton / 40% nylon blend providing structured feel. Zip opening with vertical back wordmark and oversized silhouette.</p>",
    vendor: "DUSK&CO",
    product_type: "Jackets",
    tags: "jackets, utility, oversized, layering",
    status: "draft",
    variants: [
      { option1: "XS", price: "11000.00" },
      { option1: "S", price: "11000.00" },
      { option1: "M", price: "11000.00" },
      { option1: "L", price: "11000.00" },
      { option1: "XL", price: "11000.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG04249.jpg?v=1764336524&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG04278.jpg?v=1764336534&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG04179.jpg?v=1764336547&width=1946" },
    ],
  },
  {
    title: "Techwear Over-Jacket — Black",
    body_html:
      "<p>Full-scale technical outer layer with a lightweight-but-armoured feel. Six functional pockets, parachute-style bungee cords at hood and hem. Fully lined with invisible stitching. 60% cotton / 40% nylon.</p>",
    vendor: "DUSK&CO",
    product_type: "Jackets",
    tags: "jackets, techwear, oversized, utility",
    status: "draft",
    variants: [
      { option1: "XS", price: "18000.00" },
      { option1: "S", price: "18000.00" },
      { option1: "M", price: "18000.00" },
      { option1: "L", price: "18000.00" },
      { option1: "XL", price: "18000.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG03003.jpg?v=1764336298&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG03057.jpg?v=1764336302&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02965.jpg?v=1764336314&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02954.jpg?v=1764336322&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02981.jpg?v=1764336346&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG03027.jpg?v=1764336364&width=1946" },
    ],
  },
  {
    title: "Indigo Bloom Denim Jacket",
    body_html:
      "<p>Custom-woven denim base enriched with corduroy-texture floral motifs. Hand-stitched rhinestone logo, full front metal zipper, and exclusive printed interior lining. 34% cotton / 66% polyester.</p>",
    vendor: "DUSK&CO",
    product_type: "Jackets",
    tags: "jackets, denim, rhinestone, floral",
    status: "draft",
    variants: [
      { option1: "S", price: "17000.00" },
      { option1: "M", price: "17000.00" },
      { option1: "L", price: "17000.00" },
      { option1: "XL", price: "17000.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02345_b78ba8d1-c22a-4323-8d0e-ae06f322a7fe.jpg?v=1764335705" },
      { src: "https://bluorng.com/cdn/shop/files/98989.jpg?v=1764335705" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02334_8f069100-0a96-4d8c-a833-6e1c0d79ae2c.jpg?v=1764335705" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02413_4b96112f-fa94-49a5-9bd3-23ff52065bb3.jpg?v=1764335690" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02371_cf543f90-0beb-4b4e-9578-acf28986bf6e.jpg?v=1764335701" },
    ],
  },
  {
    title: "Ripstop Cargos — Black",
    body_html:
      "<p>Premium ripstop cargo with 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.</p>",
    vendor: "DUSK&CO",
    product_type: "Cargos",
    tags: "cargos, ripstop, convertible, utility",
    status: "draft",
    variants: [
      { option1: "W28", price: "15000.00" },
      { option1: "W30", price: "15000.00" },
      { option1: "W32", price: "15000.00" },
      { option1: "W34", price: "15000.00" },
      { option1: "W36", price: "15000.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/wedwe.jpg?v=1764343637&width=2000" },
    ],
  },
  {
    title: "Ripstop Cargos — Olive",
    body_html:
      "<p>Premium ripstop cargo in olive. 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.</p>",
    vendor: "DUSK&CO",
    product_type: "Cargos",
    tags: "cargos, ripstop, convertible, utility",
    status: "draft",
    variants: [
      { option1: "W28", price: "15000.00" },
      { option1: "W30", price: "15000.00" },
      { option1: "W32", price: "15000.00" },
      { option1: "W34", price: "15000.00" },
      { option1: "W36", price: "15000.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG04375.jpg?v=1764343365&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG04426.jpg?v=1764343393&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG04429.jpg?v=1764343393&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG04313_c836613c-bb39-4c13-9a09-a00332f5ee02.jpg?v=1764343393&width=1946" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG04333_7b2e77ff-87c6-42dd-bc57-e5703c3e16d4.jpg?v=1764343393&width=1946" },
    ],
  },
  {
    title: "Ripstop Cargos — Brown",
    body_html:
      "<p>Premium ripstop cargo in brown. 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.</p>",
    vendor: "DUSK&CO",
    product_type: "Cargos",
    tags: "cargos, ripstop, convertible, utility",
    status: "draft",
    variants: [
      { option1: "W28", price: "15000.00" },
      { option1: "W30", price: "15000.00" },
      { option1: "W32", price: "15000.00" },
      { option1: "W34", price: "15000.00" },
      { option1: "W36", price: "15000.00" },
    ],
    options: [{ name: "Size" }],
    images: [
      { src: "https://bluorng.com/cdn/shop/files/wefdcwas.jpg" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02795_b8cf2d2a-6262-4577-ab56-156412a3fb89.jpg" },
      { src: "https://bluorng.com/cdn/shop/files/BLUORNG02863_a7d84af2-e469-44ba-95c8-517f56953c6d.jpg" },
    ],
  },
];

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`Creating ${PRODUCTS.length} products in Shopify...\n`);

  const created = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    console.log(`[${i + 1}/${PRODUCTS.length}] Creating "${product.title}"...`);

    const result = await adminFetch("/products.json", {
      method: "POST",
      body: JSON.stringify({ product }),
    });

    if (result?.product) {
      console.log(`  ✓ Created (ID: ${result.product.id})`);
      created.push(result.product);
    } else {
      console.log(`  ✗ Failed`);
    }

    // Shopify rate limit: 2 requests/second for basic plans
    await delay(600);
  }

  console.log(`\nDone! Created ${created.length}/${PRODUCTS.length} products.`);
  console.log(
    "Products are in DRAFT mode — visible via Storefront API but not on public storefront."
  );
  console.log(
    "\nIMPORTANT: For draft products to appear via the Storefront API,"
  );
  console.log(
    "make sure your Storefront API token has the 'unauthenticated_read_product_listings' scope,"
  );
  console.log(
    "OR set each product to 'active' status in Shopify Admin."
  );
}

main().catch(console.error);
