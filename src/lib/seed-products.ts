import type { Product } from "@/lib/shopify/types";

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

function makeVariants(
  price: string,
  compareAt: string | null,
  sizes: string[] = SIZES
) {
  return {
    edges: sizes.map((size, i) => ({
      node: {
        id: `seed-variant-${size}-${i}-${price}`,
        title: size,
        availableForSale: true,
        price: { amount: price, currencyCode: "INR" },
        compareAtPrice: compareAt
          ? { amount: compareAt, currencyCode: "INR" }
          : null,
        selectedOptions: [{ name: "Size", value: size }],
        image: null,
      },
    })),
  };
}

function makeImages(urls: string[], alt: string) {
  return {
    edges: urls.map((url) => ({
      node: { url, altText: alt, width: 1946, height: 2594 },
    })),
  };
}

export const SEED_PRODUCTS: Product[] = [
  // ─── T-SHIRTS ───
  {
    id: "seed-1",
    title: "Puyma T-Shirt — Red",
    handle: "puyma-t-shirt-red",
    description:
      "Striped puma artwork in fiery red tones with raised DUSK&CO script branding across front. Speed, instinct, and raw energy in a statement silhouette.",
    descriptionHtml:
      "<p>Striped puma artwork in fiery red tones with raised DUSK&CO script branding across front. Speed, instinct, and raw energy in a statement silhouette.</p>",
    vendor: "DUSK&CO",
    productType: "T-Shirts",
    tags: ["t-shirts", "oversized", "screen-print"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/adcsxesad.jpg?v=1782113672&width=1946",
      altText: "Puyma T-Shirt Red",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/adcsxesad.jpg?v=1782113672&width=1946",
        "https://bluorng.com/cdn/shop/files/adxweasxq2.jpg?v=1782113676&width=1946",
        "https://bluorng.com/cdn/shop/files/wrcrwdeacx.jpg?v=1782113702&width=1946",
        "https://bluorng.com/cdn/shop/files/aqexewasdx.jpg?v=1782113679&width=1946",
        "https://bluorng.com/cdn/shop/files/dgbetbet.jpg?v=1782113684&width=1946",
        "https://bluorng.com/cdn/shop/files/wedxwesa.jpg?v=1782113693&width=1946",
      ],
      "Puyma T-Shirt Red"
    ),
    variants: makeVariants("4500", null),
    priceRange: {
      minVariantPrice: { amount: "4500", currencyCode: "INR" },
      maxVariantPrice: { amount: "4500", currencyCode: "INR" },
    },
    options: [{ id: "size-1", name: "Size", values: SIZES }],
  },
  {
    id: "seed-2",
    title: "Tiger Fury T-Shirt — Orange",
    handle: "tiger-fury-t-shirt-orange",
    description:
      "Vibrant orange tee featuring a fierce tiger graphic with puff and screen print details. Textured raised elements combined with smooth printing create a dimensional aesthetic.",
    descriptionHtml:
      "<p>Vibrant orange tee featuring a fierce tiger graphic with puff and screen print details. Textured raised elements combined with smooth printing create a dimensional aesthetic.</p>",
    vendor: "DUSK&CO",
    productType: "T-Shirts",
    tags: ["t-shirts", "oversized", "puff-print"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/ersfesd.jpg?v=1779114955&width=1946",
      altText: "Tiger Fury T-Shirt Orange",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/ersfesd.jpg?v=1779114955&width=1946",
        "https://bluorng.com/cdn/shop/files/ersgveds.jpg?v=1779114955&width=1946",
        "https://bluorng.com/cdn/shop/files/3rgvfcer.jpg?v=1779115036&width=1946",
        "https://bluorng.com/cdn/shop/files/y5gv5t34.jpg?v=1779114980&width=1946",
        "https://bluorng.com/cdn/shop/files/e2wdcfewsa.jpg?v=1779115011&width=1946",
        "https://bluorng.com/cdn/shop/files/5trfcew.jpg?v=1779115027&width=1946",
        "https://bluorng.com/cdn/shop/files/5trgevc5rd.jpg?v=1779115022&width=1946",
      ],
      "Tiger Fury T-Shirt Orange"
    ),
    variants: makeVariants("4900", null),
    priceRange: {
      minVariantPrice: { amount: "4900", currencyCode: "INR" },
      maxVariantPrice: { amount: "4900", currencyCode: "INR" },
    },
    options: [{ id: "size-2", name: "Size", values: SIZES }],
  },
  {
    id: "seed-3",
    title: "Swan T-Shirt — Pink",
    handle: "swan-t-shirt-pink",
    description:
      "Graceful silhouette of a swan flowing across the garment through layered pink tones and fluid shapes. Discharge print with puff screen-printed branding and ribbed neckline.",
    descriptionHtml:
      "<p>Graceful silhouette of a swan flowing across the garment through layered pink tones and fluid shapes. Discharge print with puff screen-printed branding and ribbed neckline.</p>",
    vendor: "DUSK&CO",
    productType: "T-Shirts",
    tags: ["t-shirts", "oversized", "discharge-print"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/rgv5rgfcrd.jpg?v=1779367146&width=1946",
      altText: "Swan T-Shirt Pink",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/rgv5rgfcrd.jpg?v=1779367146&width=1946",
        "https://bluorng.com/cdn/shop/files/efsc4efcds.jpg?v=1779367154&width=1946",
        "https://bluorng.com/cdn/shop/files/t4bv5tgrvtr.jpg?v=1779367174&width=1946",
      ],
      "Swan T-Shirt Pink"
    ),
    variants: makeVariants("4200", null),
    priceRange: {
      minVariantPrice: { amount: "4200", currencyCode: "INR" },
      maxVariantPrice: { amount: "4200", currencyCode: "INR" },
    },
    options: [{ id: "size-3", name: "Size", values: SIZES }],
  },
  {
    id: "seed-4",
    title: "Fade Flora Ombre T-Shirt",
    handle: "fade-flora-ombre-t-shirt",
    description:
      "Heavyweight waffle construction offers a structured feel while maintaining breathability. An easy statement piece for year-round wear with a relaxed silhouette.",
    descriptionHtml:
      "<p>Heavyweight waffle construction offers a structured feel while maintaining breathability. An easy statement piece for year-round wear with a relaxed silhouette.</p>",
    vendor: "DUSK&CO",
    productType: "T-Shirts",
    tags: ["t-shirts", "oversized", "ombre", "waffle"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/wecweadsx.jpg?v=1782114211&width=1946",
      altText: "Fade Flora Ombre T-Shirt",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/wecweadsx.jpg?v=1782114211&width=1946",
        "https://bluorng.com/cdn/shop/files/wdacxwda.jpg?v=1782114208&width=1946",
        "https://bluorng.com/cdn/shop/files/efasefds.jpg?v=1782466437&width=1946",
        "https://bluorng.com/cdn/shop/files/adzcsdz.jpg?v=1782114195&width=1946",
        "https://bluorng.com/cdn/shop/files/wdcweasxsa.jpg?v=1782466408&width=1946",
        "https://bluorng.com/cdn/shop/files/rtegv4etg3.jpg?v=1782114203&width=1946",
        "https://bluorng.com/cdn/shop/files/wrcf3ws2.jpg?v=1782114215&width=1946",
      ],
      "Fade Flora Ombre T-Shirt"
    ),
    variants: makeVariants("5900", null),
    priceRange: {
      minVariantPrice: { amount: "5900", currencyCode: "INR" },
      maxVariantPrice: { amount: "5900", currencyCode: "INR" },
    },
    options: [{ id: "size-4", name: "Size", values: SIZES }],
  },
  {
    id: "seed-5",
    title: "Iced T-Shirt — Black",
    handle: "iced-t-shirt-black",
    description:
      "Premium cotton tee with 400+ sparkling studs embroidered on the front. Loose fit, round neck, short sleeves. A statement piece that catches light from every angle.",
    descriptionHtml:
      "<p>Premium cotton tee with 400+ sparkling studs embroidered on the front. Loose fit, round neck, short sleeves. A statement piece that catches light from every angle.</p>",
    vendor: "DUSK&CO",
    productType: "T-Shirts",
    tags: ["t-shirts", "oversized", "embroidered", "studs"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/jiohyigb.jpg?v=1758906255&width=1946",
      altText: "Iced T-Shirt Black",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/jiohyigb.jpg?v=1758906255&width=1946",
        "https://bluorng.com/cdn/shop/files/exwedwea.jpg?v=1758906255&width=1946",
      ],
      "Iced T-Shirt Black"
    ),
    variants: makeVariants("7500", null),
    priceRange: {
      minVariantPrice: { amount: "7500", currencyCode: "INR" },
      maxVariantPrice: { amount: "7500", currencyCode: "INR" },
    },
    options: [{ id: "size-5", name: "Size", values: SIZES }],
  },

  // ─── HOODIES ───
  {
    id: "seed-6",
    title: "Serpent Bloom Zipper Hoodie — Red",
    handle: "serpent-bloom-zipper-hoodie-red",
    description:
      "Intricate serpent and floral composition on the back with vibrant blues and greens contrasting the red base. Features ribbed cuffs and a discreet thumb hole for premium comfort and winter layering versatility.",
    descriptionHtml:
      "<p>Intricate serpent and floral composition on the back with vibrant blues and greens contrasting the red base. Features ribbed cuffs and a discreet thumb hole for premium comfort and winter layering versatility.</p>",
    vendor: "DUSK&CO",
    productType: "Hoodies",
    tags: ["hoodies", "zipper", "oversized", "screen-print"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/BLUORNG00631.jpg?v=1764338031&width=1946",
      altText: "Serpent Bloom Zipper Hoodie Red",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/BLUORNG00631.jpg?v=1764338031&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG00512.jpg?v=1764338031&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG00572.jpg?v=1764338031&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG00597.jpg?v=1764338031&width=1946",
        "https://bluorng.com/cdn/shop/files/hbkjlb_28b26771-2ea2-45e4-a824-c2ac5bc5fd84.jpg?v=1764338100&width=1946",
      ],
      "Serpent Bloom Zipper Hoodie Red"
    ),
    variants: makeVariants("9995", "14000"),
    priceRange: {
      minVariantPrice: { amount: "9995", currencyCode: "INR" },
      maxVariantPrice: { amount: "9995", currencyCode: "INR" },
    },
    options: [{ id: "size-6", name: "Size", values: SIZES }],
  },
  {
    id: "seed-7",
    title: "Meadow Blue Hoodie",
    handle: "meadow-blue-hoodie",
    description:
      "Florals and butterflies via detailed screen-printing across front, back, and sleeves. A vivid base that heightens the contrast of the yellow florals.",
    descriptionHtml:
      "<p>Florals and butterflies via detailed screen-printing across front, back, and sleeves. A vivid base that heightens the contrast of the yellow florals.</p>",
    vendor: "DUSK&CO",
    productType: "Hoodies",
    tags: ["hoodies", "oversized", "screen-print", "floral"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/BLUORNG01323.jpg?v=1764337851&width=1946",
      altText: "Meadow Blue Hoodie",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/BLUORNG01323.jpg?v=1764337851&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG01248.jpg?v=1764337856&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG01277.jpg?v=1764337861&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG01312.jpg?v=1764337868&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG01333.jpg?v=1764337873&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG01292.jpg?v=1764337881&width=1946",
      ],
      "Meadow Blue Hoodie"
    ),
    variants: makeVariants("9995", "14500"),
    priceRange: {
      minVariantPrice: { amount: "9995", currencyCode: "INR" },
      maxVariantPrice: { amount: "9995", currencyCode: "INR" },
    },
    options: [{ id: "size-7", name: "Size", values: SIZES }],
  },
  {
    id: "seed-8",
    title: "Favourite Child Hoodie — Brown",
    handle: "favourite-child-hoodie-brown",
    description:
      "The iconic Favourite Child motif on heavyweight 500 GSM cotton fleece. Oversized fit with hood. Built for comfort, designed for the street.",
    descriptionHtml:
      "<p>The iconic Favourite Child motif on heavyweight 500 GSM cotton fleece. Oversized fit with hood. Built for comfort, designed for the street.</p>",
    vendor: "DUSK&CO",
    productType: "Hoodies",
    tags: ["hoodies", "oversized", "heavyweight", "screen-print"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/D1.jpg?v=1741167824&width=1946",
      altText: "Favourite Child Hoodie Brown",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/D1.jpg?v=1741167824&width=1946",
        "https://bluorng.com/cdn/shop/files/esdca.jpg?v=1741167892&width=1946",
        "https://bluorng.com/cdn/shop/files/erscdsa.jpg?v=1741167892&width=1946",
        "https://bluorng.com/cdn/shop/files/dazCaSD.jpg?v=1741167892&width=1946",
      ],
      "Favourite Child Hoodie Brown"
    ),
    variants: makeVariants("8995", null),
    priceRange: {
      minVariantPrice: { amount: "8995", currencyCode: "INR" },
      maxVariantPrice: { amount: "8995", currencyCode: "INR" },
    },
    options: [{ id: "size-8", name: "Size", values: SIZES }],
  },
  {
    id: "seed-9",
    title: "Nocturnal Hoodie — Black",
    handle: "nocturnal-hoodie-black",
    description:
      "Premium oversized unisex fit with 750,000 individual embroidery stitches on the front and back. 450 GSM brushed cotton fleece blending comfort and style.",
    descriptionHtml:
      "<p>Premium oversized unisex fit with 750,000 individual embroidery stitches on the front and back. 450 GSM brushed cotton fleece blending comfort and style.</p>",
    vendor: "DUSK&CO",
    productType: "Hoodies",
    tags: ["hoodies", "oversized", "embroidered", "premium"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/rwfdeccsx.jpg?v=1732202045&width=1946",
      altText: "Nocturnal Hoodie Black",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/rwfdeccsx.jpg?v=1732202045&width=1946",
        "https://bluorng.com/cdn/shop/files/DSC04959copy11.jpg?v=1732201862&width=1946",
        "https://bluorng.com/cdn/shop/files/DSC05035copy.jpg?v=1732201872&width=1946",
        "https://bluorng.com/cdn/shop/files/ybg87yhu.jpg?v=1732201979&width=1946",
        "https://bluorng.com/cdn/shop/files/DSC05037copy.jpg?v=1732201872&width=1946",
        "https://bluorng.com/cdn/shop/files/bhnu898.jpg?v=1732201984&width=1946",
      ],
      "Nocturnal Hoodie Black"
    ),
    variants: makeVariants("9995", "13995"),
    priceRange: {
      minVariantPrice: { amount: "9995", currencyCode: "INR" },
      maxVariantPrice: { amount: "9995", currencyCode: "INR" },
    },
    options: [{ id: "size-9", name: "Size", values: SIZES }],
  },

  // ─── JACKETS ───
  {
    id: "seed-10",
    title: "Boxy Utility Jacket — Brown",
    handle: "boxy-utility-jacket-brown",
    description:
      "Lightweight winter layering piece with minimal aesthetic. 60% cotton / 40% nylon blend providing structured feel. Zip opening with vertical back wordmark and oversized silhouette.",
    descriptionHtml:
      "<p>Lightweight winter layering piece with minimal aesthetic. 60% cotton / 40% nylon blend providing structured feel. Zip opening with vertical back wordmark and oversized silhouette.</p>",
    vendor: "DUSK&CO",
    productType: "Jackets",
    tags: ["jackets", "utility", "oversized", "layering"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/BLUORNG04249.jpg?v=1764336524&width=1946",
      altText: "Boxy Utility Jacket Brown",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/BLUORNG04249.jpg?v=1764336524&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG04278.jpg?v=1764336534&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG04179.jpg?v=1764336547&width=1946",
      ],
      "Boxy Utility Jacket Brown"
    ),
    variants: makeVariants("11000", null, ["XS", "S", "M", "L", "XL"]),
    priceRange: {
      minVariantPrice: { amount: "11000", currencyCode: "INR" },
      maxVariantPrice: { amount: "11000", currencyCode: "INR" },
    },
    options: [
      { id: "size-10", name: "Size", values: ["XS", "S", "M", "L", "XL"] },
    ],
  },
  {
    id: "seed-11",
    title: "Techwear Over-Jacket — Black",
    handle: "techwear-over-jacket-black",
    description:
      "Full-scale technical outer layer with a lightweight-but-armoured feel. Six functional pockets, parachute-style bungee cords at hood and hem. Fully lined with invisible stitching. 60% cotton / 40% nylon.",
    descriptionHtml:
      "<p>Full-scale technical outer layer with a lightweight-but-armoured feel. Six functional pockets, parachute-style bungee cords at hood and hem. Fully lined with invisible stitching. 60% cotton / 40% nylon.</p>",
    vendor: "DUSK&CO",
    productType: "Jackets",
    tags: ["jackets", "techwear", "oversized", "utility"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/BLUORNG03003.jpg?v=1764336298&width=1946",
      altText: "Techwear Over-Jacket Black",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/BLUORNG03003.jpg?v=1764336298&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG03057.jpg?v=1764336302&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG02965.jpg?v=1764336314&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG02954.jpg?v=1764336322&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG02981.jpg?v=1764336346&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG03027.jpg?v=1764336364&width=1946",
      ],
      "Techwear Over-Jacket Black"
    ),
    variants: makeVariants("18000", null, ["XS", "S", "M", "L", "XL"]),
    priceRange: {
      minVariantPrice: { amount: "18000", currencyCode: "INR" },
      maxVariantPrice: { amount: "18000", currencyCode: "INR" },
    },
    options: [
      { id: "size-11", name: "Size", values: ["XS", "S", "M", "L", "XL"] },
    ],
  },
  {
    id: "seed-12",
    title: "Indigo Bloom Denim Jacket",
    handle: "indigo-bloom-denim-jacket",
    description:
      "Custom-woven denim base enriched with corduroy-texture floral motifs. Hand-stitched rhinestone logo, full front metal zipper, and exclusive printed interior lining. 34% cotton / 66% polyester.",
    descriptionHtml:
      "<p>Custom-woven denim base enriched with corduroy-texture floral motifs. Hand-stitched rhinestone logo, full front metal zipper, and exclusive printed interior lining. 34% cotton / 66% polyester.</p>",
    vendor: "DUSK&CO",
    productType: "Jackets",
    tags: ["jackets", "denim", "rhinestone", "floral"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/BLUORNG02345_b78ba8d1-c22a-4323-8d0e-ae06f322a7fe.jpg?v=1764335705",
      altText: "Indigo Bloom Denim Jacket",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/BLUORNG02345_b78ba8d1-c22a-4323-8d0e-ae06f322a7fe.jpg?v=1764335705",
        "https://bluorng.com/cdn/shop/files/98989.jpg?v=1764335705",
        "https://bluorng.com/cdn/shop/files/BLUORNG02334_8f069100-0a96-4d8c-a833-6e1c0d79ae2c.jpg?v=1764335705",
        "https://bluorng.com/cdn/shop/files/BLUORNG02413_4b96112f-fa94-49a5-9bd3-23ff52065bb3.jpg?v=1764335690",
        "https://bluorng.com/cdn/shop/files/BLUORNG02371_cf543f90-0beb-4b4e-9578-acf28986bf6e.jpg?v=1764335701",
      ],
      "Indigo Bloom Denim Jacket"
    ),
    variants: makeVariants("17000", null, ["S", "M", "L", "XL"]),
    priceRange: {
      minVariantPrice: { amount: "17000", currencyCode: "INR" },
      maxVariantPrice: { amount: "17000", currencyCode: "INR" },
    },
    options: [
      { id: "size-12", name: "Size", values: ["S", "M", "L", "XL"] },
    ],
  },

  // ─── CARGOS ───
  {
    id: "seed-13",
    title: "Ripstop Cargos — Black",
    handle: "ripstop-cargos-black",
    description:
      "Premium ripstop cargo with 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.",
    descriptionHtml:
      "<p>Premium ripstop cargo with 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.</p>",
    vendor: "DUSK&CO",
    productType: "Cargos",
    tags: ["cargos", "ripstop", "convertible", "utility"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/wedwe.jpg?v=1764343637&width=2000",
      altText: "Ripstop Cargos Black",
      width: 2000,
      height: 2666,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/wedwe.jpg?v=1764343637&width=2000",
      ],
      "Ripstop Cargos Black"
    ),
    variants: makeVariants("15000", null, ["W28", "W30", "W32", "W34", "W36"]),
    priceRange: {
      minVariantPrice: { amount: "15000", currencyCode: "INR" },
      maxVariantPrice: { amount: "15000", currencyCode: "INR" },
    },
    options: [
      {
        id: "size-13",
        name: "Size",
        values: ["W28", "W30", "W32", "W34", "W36"],
      },
    ],
  },
  {
    id: "seed-14",
    title: "Ripstop Cargos — Olive",
    handle: "ripstop-cargos-olive",
    description:
      "Premium ripstop cargo in olive. 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.",
    descriptionHtml:
      "<p>Premium ripstop cargo in olive. 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.</p>",
    vendor: "DUSK&CO",
    productType: "Cargos",
    tags: ["cargos", "ripstop", "convertible", "utility"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/BLUORNG04375.jpg?v=1764343365&width=1946",
      altText: "Ripstop Cargos Olive",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/BLUORNG04375.jpg?v=1764343365&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG04426.jpg?v=1764343393&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG04429.jpg?v=1764343393&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG04313_c836613c-bb39-4c13-9a09-a00332f5ee02.jpg?v=1764343393&width=1946",
        "https://bluorng.com/cdn/shop/files/BLUORNG04333_7b2e77ff-87c6-42dd-bc57-e5703c3e16d4.jpg?v=1764343393&width=1946",
      ],
      "Ripstop Cargos Olive"
    ),
    variants: makeVariants("15000", null, ["W28", "W30", "W32", "W34", "W36"]),
    priceRange: {
      minVariantPrice: { amount: "15000", currencyCode: "INR" },
      maxVariantPrice: { amount: "15000", currencyCode: "INR" },
    },
    options: [
      {
        id: "size-14",
        name: "Size",
        values: ["W28", "W30", "W32", "W34", "W36"],
      },
    ],
  },
  {
    id: "seed-15",
    title: "Ripstop Cargos — Brown",
    handle: "ripstop-cargos-brown",
    description:
      "Premium ripstop cargo in brown. 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.",
    descriptionHtml:
      "<p>Premium ripstop cargo in brown. 2 detachable pockets, low-hanging suspenders on each side, and 12 multipurpose pockets. Convertible into shorts. Baggy flared fit.</p>",
    vendor: "DUSK&CO",
    productType: "Cargos",
    tags: ["cargos", "ripstop", "convertible", "utility"],
    availableForSale: true,
    featuredImage: {
      url: "https://bluorng.com/cdn/shop/files/wefdcwas.jpg",
      altText: "Ripstop Cargos Brown",
      width: 1946,
      height: 2594,
    },
    images: makeImages(
      [
        "https://bluorng.com/cdn/shop/files/wefdcwas.jpg",
        "https://bluorng.com/cdn/shop/files/BLUORNG02795_b8cf2d2a-6262-4577-ab56-156412a3fb89.jpg",
        "https://bluorng.com/cdn/shop/files/BLUORNG02863_a7d84af2-e469-44ba-95c8-517f56953c6d.jpg",
      ],
      "Ripstop Cargos Brown"
    ),
    variants: makeVariants("15000", null, ["W28", "W30", "W32", "W34", "W36"]),
    priceRange: {
      minVariantPrice: { amount: "15000", currencyCode: "INR" },
      maxVariantPrice: { amount: "15000", currencyCode: "INR" },
    },
    options: [
      {
        id: "size-15",
        name: "Size",
        values: ["W28", "W30", "W32", "W34", "W36"],
      },
    ],
  },
];
