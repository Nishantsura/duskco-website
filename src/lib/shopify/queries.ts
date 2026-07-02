import { shopifyFetch } from "./client";
import type { Product, Collection, SizeChart } from "./types";
import { SEED_PRODUCTS } from "@/lib/seed-products";

const USE_SEED_DATA = false;

// Only show Bluorang-scraped catalogue; hide default/test Shopify products.
const BLUORANG_HANDLES = new Set([
  "puyma-t-shirt-red",
  "tiger-fury-t-shirt-orange",
  "swan-t-shirt-pink",
  "fade-flora-ombre-t-shirt",
  "iced-t-shirt-black",
  "serpent-bloom-zipper-hoodie-red",
  "meadow-blue-hoodie",
  "favourite-child-hoodie-brown",
  "nocturnal-hoodie-black",
  "boxy-utility-jacket-brown",
  "techwear-over-jacket-black",
  "indigo-bloom-denim-jacket",
  "ripstop-cargos-black",
  "ripstop-cargos-olive",
  "ripstop-cargos-brown",
]);

function isAllowed(p: { handle: string }) {
  return BLUORANG_HANDLES.has(p.handle);
}

interface RawProduct extends Omit<Product, "sizeChart"> {
  metafield?: { value: string; type: string } | null;
}

function parseSizeChart(raw: RawProduct): Product {
  let sizeChart: SizeChart | null = null;
  if (raw.metafield?.value) {
    try {
      sizeChart = JSON.parse(raw.metafield.value);
    } catch {}
  }
  const { metafield: _, ...rest } = raw;
  return { ...rest, sizeChart };
}

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      id
      name
      values
    }
    metafield(namespace: "custom", key: "size_chart") {
      value
      type
    }
  }
`;

export async function getProducts(first = 20) {
  if (USE_SEED_DATA) {
    return SEED_PRODUCTS.slice(0, first);
  }

  // Fetch a wider window so filtering leaves enough Bluorang items.
  const fetchCount = Math.max(first, 100);

  const data = await shopifyFetch<{
    products: { edges: { node: RawProduct }[] };
  }>({
    query: `
      ${PRODUCT_FRAGMENT}
      query GetProducts($first: Int!) {
        products(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              ...ProductFields
            }
          }
        }
      }
    `,
    variables: { first: fetchCount },
  });

  return data.products.edges
    .map((e) => parseSizeChart(e.node))
    .filter(isAllowed)
    .slice(0, first);
}

export async function getProductByHandle(handle: string) {
  if (USE_SEED_DATA) {
    return SEED_PRODUCTS.find((p) => p.handle === handle) ?? null;
  }

  const data = await shopifyFetch<{
    productByHandle: RawProduct | null;
  }>({
    query: `
      ${PRODUCT_FRAGMENT}
      query GetProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          ...ProductFields
        }
      }
    `,
    variables: { handle },
  });

  return data.productByHandle ? parseSizeChart(data.productByHandle) : null;
}

export async function getCollections(first = 20) {
  const data = await shopifyFetch<{
    collections: { edges: { node: Collection }[] };
  }>({
    query: `
      query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    `,
    variables: { first },
  });

  return data.collections.edges.map((e) => e.node);
}

export async function getCollectionByHandle(handle: string, first = 50) {
  const data = await shopifyFetch<{
    collectionByHandle: Collection | null;
  }>({
    query: `
      ${PRODUCT_FRAGMENT}
      query GetCollectionByHandle($handle: String!, $first: Int!) {
        collectionByHandle(handle: $handle) {
          id
          title
          handle
          description
          image {
            url
            altText
            width
            height
          }
          products(first: $first) {
            edges {
              node {
                ...ProductFields
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              endCursor
              startCursor
            }
          }
        }
      }
    `,
    variables: { handle, first },
  });

  return data.collectionByHandle;
}

export async function searchProducts(query: string, first = 20) {
  const data = await shopifyFetch<{
    products: { edges: { node: RawProduct }[] };
  }>({
    query: `
      ${PRODUCT_FRAGMENT}
      query SearchProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          edges {
            node {
              ...ProductFields
            }
          }
        }
      }
    `,
    variables: { query, first },
  });

  return data.products.edges.map((e) => parseSizeChart(e.node));
}
