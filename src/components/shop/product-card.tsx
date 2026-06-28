"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import { useQuickView } from "./quick-view-provider";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f5f5f5",
  cream: "#f5f0e8",
  olive: "#5c6b4f",
  charcoal: "#3a3a3a",
  grey: "#8a8a8a",
  "slate grey": "#6b7d8a",
  "off white": "#f0ece4",
  "black/white": "#1a1a1a",
  stone: "#b8ad9e",
  sand: "#c9b99a",
  navy: "#1c2841",
  "washed black": "#2d2d2d",
};

const MULTI_COLOR_PRODUCTS: Record<string, string[]> = {
  "street shorts": ["black", "olive", "grey"],
  "relaxed shorts": ["off white", "black"],
  "ribbed tank": ["white", "black", "sand"],
  "oversized graphic tee": ["black", "white"],
  "cargo joggers": ["charcoal", "olive"],
};

function extractColorFromTitle(title: string): string | null {
  const parts = title.split("—").map((s) => s.trim());
  if (parts.length < 2) return null;
  return parts[parts.length - 1].toLowerCase();
}

function getColorsForProduct(title: string): { name: string; hex: string }[] {
  const displayName = getDisplayName(title).toLowerCase();
  const multiColors = Object.entries(MULTI_COLOR_PRODUCTS).find(([key]) =>
    displayName.toLowerCase().includes(key)
  );
  if (multiColors) {
    return multiColors[1].map((c) => ({ name: c, hex: COLOR_MAP[c] || "#999" }));
  }
  return [];
}

function getDisplayName(title: string): string {
  const parts = title.split("—").map((s) => s.trim());
  return parts[0];
}

function getCategoryLabel(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("hoodie") || lower.includes("pullover")) return "CORE FLEECE";
  if (lower.includes("sweatpant") || lower.includes("jogger")) return "COMFORT STREET";
  if (lower.includes("cargo")) return "URBAN UTILITY";
  if (lower.includes("jacket") || lower.includes("windbreaker") || lower.includes("puffer") || lower.includes("vest")) return "OUTERWEAR";
  if (lower.includes("tank") || lower.includes("tee") || lower.includes("t-shirt")) return "ESSENTIAL";
  if (lower.includes("long sleeve") || lower.includes("thermal")) return "LAYERING";
  if (lower.includes("shorts")) return "EVERYDAY";
  return "ESSENTIAL";
}

export function ProductCard({ product }: { product: Product }) {
  const { open: openQuickView } = useQuickView();
  const price = product.priceRange.minVariantPrice;
  const images = product.images?.edges?.map((e) => e.node) ?? [];
  const [idx, setIdx] = useState(0);
  const [activeColor, setActiveColor] = useState(0);

  const hasMultiple = images.length > 1;
  const current = images[idx] ?? product.featuredImage;

  const displayName = getDisplayName(product.title);
  const category = getCategoryLabel(product.title);
  const colors = getColorsForProduct(product.title);
  const hasColors = colors.length > 1;

  function prev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i - 1 + images.length) % images.length);
  }

  function next(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
  }

  return (
    <div className="group">
      {/* Image */}
      <Link
        href={`/products/${product.handle}`}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-[#f0f0f0]"
      >
        {current ? (
          <Image
            src={current.url}
            alt={current.altText || product.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-primary text-[10px] font-light tracking-[0.1em] text-neutral-400 uppercase">
              No image
            </span>
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-300 bg-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-white group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-300 bg-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-white group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`block h-[5px] w-[5px] rounded-full transition-colors ${
                    i === idx ? "bg-neutral-800" : "bg-neutral-400/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </Link>

      {/* Product info */}
      <div className="pt-3">
        {/* Color swatches — only when multiple colors */}
        {hasColors && (
          <div className="mb-2 flex gap-1.5">
            {colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setActiveColor(i)}
                className={`block h-[22px] w-[22px] rounded-[4px] border transition-all ${
                  i === activeColor
                    ? "border-neutral-800 ring-1 ring-neutral-800 ring-offset-1"
                    : "border-neutral-300 hover:border-neutral-500"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Category label */}
        <p className="font-primary text-[11px] font-light tracking-[0.1em] text-neutral-400 uppercase">
          {category}
        </p>

        {/* Product name + Cart icon */}
        <div className="mt-1 flex items-center justify-between">
          <Link href={`/products/${product.handle}`}>
            <h3 className="font-primary text-[13px] font-bold tracking-[0.02em] text-neutral-900 uppercase">
              {displayName}
            </h3>
          </Link>
          <button
            onClick={() => openQuickView(product)}
            aria-label="Quick view"
            className="text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Price */}
        <p className="mt-1 font-primary text-[13px] font-light text-neutral-600">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
    </div>
  );
}
