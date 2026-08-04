import type { SizeChart } from "./shopify/types";

/**
 * House-default product copy, shared by the PDP info panel and the gallery spec
 * card. Every one of these is overridden per-product by a `custom.*` metafield
 * in the Shopify admin (see product-info.tsx / queries.ts). Garment lines use a
 * "Label — Value" shape so they render cleanly as a spec table.
 */
export const DEFAULT_GARMENT = [
  "Material — 100% Premium Cotton",
  "Weight — 320–420 GSM",
  "Fit — Relaxed / Oversized",
  "Cut — Unisex",
];

export const DEFAULT_WASH_CARE = [
  "Machine wash cold with similar colours",
  "Do not bleach",
  "Tumble dry low",
  "Iron on low heat if needed",
  "Do not dry clean",
];

export const DEFAULT_SHIPPING = [
  "Free shipping on orders above ₹2,999",
  "Standard delivery: 5–7 business days",
  "Express delivery: 2–3 business days",
  "Cash on Delivery available",
  "Easy returns within 7 days of delivery",
];

// Sensible unisex-tee chart so the size guide is always there; overridden by the
// product's `custom.size_chart` JSON metafield when set.
export const DEFAULT_SIZE_CHART: SizeChart = {
  unit: "in",
  columns: ["Chest", "Length", "Shoulder"],
  rows: [
    { size: "S", values: [38, 27, 17] },
    { size: "M", values: [40, 28, 17.5] },
    { size: "L", values: [42, 29, 18] },
    { size: "XL", values: [44, 30, 18.5] },
    { size: "XXL", values: [46, 31, 19] },
  ],
};

/**
 * Splits a garment line into label/value for the spec card. Only a dash
 * surrounded by spaces separates them, so ranges like "320–420 GSM" stay whole.
 * A line without a labelled dash returns just a value.
 */
export function parseSpec(line: string): { label?: string; value: string } {
  const parts = line.split(/\s[—–-]\s/);
  if (parts.length >= 2) {
    return { label: parts[0].trim(), value: parts.slice(1).join(" — ").trim() };
  }
  return { value: line.trim() };
}
