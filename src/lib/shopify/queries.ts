import { shopifyFetch } from "./client";
import type { Product, Collection } from "./types";
import { SEED_PRODUCTS } from "@/lib/seed-products";

const USE_SEED_DATA = true;

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
  }
`;

export async function getProducts(first = 20) {
  if (USE_SEED_DATA) {
    return SEED_PRODUCTS.slice(0, first);
  }

  const data = await shopifyFetch<{
    products: { edges: { node: Product }[] };
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
    variables: { first },
  });

  return data.products.edges.map((e) => e.node);
}

export async function getProductByHandle(handle: string) {
  if (USE_SEED_DATA) {
    return SEED_PRODUCTS.find((p) => p.handle === handle) ?? null;
  }

  const data = await shopifyFetch<{
    productByHandle: Product | null;
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

  return data.productByHandle;
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
    products: { edges: { node: Product }[] };
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

  return data.products.edges.map((e) => e.node);
}
