import { shopifyFetch } from "./client";
import type { Product, Collection, SizeChart, StoryStage } from "./types";
import { SEED_PRODUCTS } from "@/lib/seed-products";
import { getFallbackStory } from "@/lib/collection-story";

const USE_SEED_DATA = false;

interface RawProduct
  extends Omit<Product, "sizeChart" | "garmentDetails" | "washCare" | "shippingInfo"> {
  sizeChartMeta?: { value: string; type: string } | null;
  // metafields(identifiers:) returns a list aligned to the requested order,
  // with null holes for keys the merchant hasn't set.
  copyMeta?: ({ key: string; value: string | null } | null)[] | null;
}

// One bullet per line — the shape merchants get from a multi_line_text_field.
function splitLines(value: string | null | undefined): string[] | null {
  if (!value) return null;
  const lines = value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : null;
}

function parseProduct(raw: RawProduct): Product {
  let sizeChart: SizeChart | null = null;
  if (raw.sizeChartMeta?.value) {
    try {
      sizeChart = JSON.parse(raw.sizeChartMeta.value);
    } catch {}
  }

  const byKey = new Map(
    (raw.copyMeta ?? []).filter(Boolean).map((m) => [m!.key, m!.value])
  );

  const { sizeChartMeta: _s, copyMeta: _c, ...rest } = raw;
  return {
    ...rest,
    sizeChart,
    garmentDetails: splitLines(byKey.get("garment_details")),
    washCare: splitLines(byKey.get("wash_care")),
    shippingInfo: splitLines(byKey.get("shipping_info")),
  };
}

/* ── Collection story (metaobject-driven) ──
 * The story lives in Shopify as a list of `story_stage` metaobjects, referenced
 * from the collection's `custom.story` metafield. Each metaobject exposes the
 * fields: stage_number, label, headline, body, media (file ref), layout. */
interface RawMetaobjectField {
  key: string;
  value: string | null;
  reference?: {
    image?: { url: string; altText: string | null } | null;
    sources?: { url: string; mimeType: string }[] | null;
  } | null;
}
interface RawStoryMetafield {
  references?: {
    edges: { node: { fields: RawMetaobjectField[] } }[];
  } | null;
}

const STORY_METAFIELD_FRAGMENT = `
  story: metafield(namespace: "custom", key: "story") {
    references(first: 3) {
      edges {
        node {
          ... on Metaobject {
            fields {
              key
              value
              reference {
                ... on MediaImage { image { url altText width height } }
                ... on Video { sources { url mimeType } }
              }
            }
          }
        }
      }
    }
  }
`;

function parseStory(story: RawStoryMetafield | null | undefined): StoryStage[] {
  const edges = story?.references?.edges ?? [];
  return edges
    .map(({ node }): StoryStage => {
      const f: Record<string, RawMetaobjectField> = {};
      for (const field of node.fields) f[field.key] = field;

      const ref = f.media?.reference;
      let media: StoryStage["media"] = null;
      if (ref?.image?.url) {
        media = { type: "image", url: ref.image.url, alt: ref.image.altText ?? undefined };
      } else if (ref?.sources?.length) {
        media = { type: "video", url: ref.sources[0].url };
      }

      return {
        stageNumber: f.stage_number?.value ?? "",
        label: f.label?.value ?? "",
        headline: f.headline?.value ?? "",
        body: f.body?.value ?? "",
        media,
        layout: f.layout?.value === "split" ? "split" : "statement",
      };
    })
    .filter((s) => s.headline.trim().length > 0)
    .slice(0, 3);
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
    sizeChartMeta: metafield(namespace: "custom", key: "size_chart") {
      value
      type
    }
    copyMeta: metafields(identifiers: [
      { namespace: "custom", key: "garment_details" }
      { namespace: "custom", key: "wash_care" }
      { namespace: "custom", key: "shipping_info" }
    ]) {
      key
      value
    }
  }
`;

export async function getProducts(first = 20) {
  if (USE_SEED_DATA) {
    return SEED_PRODUCTS.slice(0, first);
  }

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
    variables: { first },
  });

  return data.products.edges.map((e) => parseProduct(e.node));
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

  return data.productByHandle ? parseProduct(data.productByHandle) : null;
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
    collectionByHandle:
      | (Omit<Collection, "story"> & { story: RawStoryMetafield | null })
      | null;
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
          ${STORY_METAFIELD_FRAGMENT}
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

  if (!data.collectionByHandle) return null;

  const raw = data.collectionByHandle;

  // Prefer the Shopify-authored story; fall back to a baked-in Dusk story so
  // the page is never empty (and stays fully editable once metaobjects exist).
  const authored = parseStory(raw.story);
  const story = authored.length > 0 ? authored : getFallbackStory(raw.title);

  const collection: Collection = {
    ...raw,
    story,
  };

  return collection;
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

  return data.products.edges.map((e) => parseProduct(e.node));
}
