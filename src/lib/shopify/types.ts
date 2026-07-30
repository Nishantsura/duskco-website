export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ProductVariant }[] };
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  options: { id: string; name: string; values: string[] }[];
  sizeChart?: SizeChart | null;
}

export interface SizeChart {
  unit: string;
  columns: string[];
  rows: { size: string; values: number[] }[];
}

/**
 * One scroll-stage of a collection's story. Sourced from a Shopify
 * `story_stage` metaobject (see getCollectionByHandle), with a baked-in
 * fallback so the page is never empty.
 */
export interface StoryStage {
  /** "01", "02"… — the chapter marker. */
  stageNumber: string;
  /** Short kicker, e.g. "The Signal". */
  label: string;
  /** Big display headline. Use "\n" to force line breaks. */
  headline: string;
  /** Supporting copy. */
  body: string;
  /** Background / feature media. */
  media: { type: "image" | "video"; url: string; alt?: string } | null;
  /** "statement" = full-bleed centered; "split" = media beside text. */
  layout: "statement" | "split";
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
  /** Editable in Shopify via the `custom.story` metaobject list; may be empty. */
  story: StoryStage[];
  products: {
    edges: { node: Product }[];
    pageInfo: PageInfo;
  };
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string | null;
  startCursor: string | null;
}

export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image: ShopifyImage | null;
    price: MoneyV2;
    product: {
      title: string;
      handle: string;
      vendor: string;
    };
    selectedOptions: { name: string; value: string }[];
  };
  cost: {
    totalAmount: MoneyV2;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: MoneyV2;
    totalAmount: MoneyV2;
    totalTaxAmount: MoneyV2 | null;
  };
  lines: {
    edges: { node: CartLineItem }[];
  };
}
