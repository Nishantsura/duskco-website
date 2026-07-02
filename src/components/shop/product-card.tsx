"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import { useQuickView } from "./quick-view-provider";
import { useCart } from "@/components/cart/cart-provider";

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
  const { lastAddedProductId } = useCart();
  const justAdded = lastAddedProductId === product.id;
  const price = product.priceRange.minVariantPrice;
  const images = product.images?.edges?.map((e) => e.node) ?? [];
  const [idx, setIdx] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasMultiple = images.length > 1;
  const current = images[idx] ?? product.featuredImage;

  const displayName = getDisplayName(product.title);
  const category = getCategoryLabel(product.title);
  const colors = getColorsForProduct(product.title);
  const hasColors = colors.length > 1;

  useEffect(() => {
    if (!isHover || !hasMultiple) return;
    intervalRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, 800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHover, hasMultiple, images.length]);

  useEffect(() => {
    if (!isHover) setIdx(0);
  }, [isHover]);

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Image */}
      <Link
        href={`/products/${product.handle}`}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-[0.2rem] bg-white"
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
            aria-label={justAdded ? "Added" : "Quick view"}
            className={`transition-colors ${justAdded ? "text-green-600" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`transition-transform duration-300 ${justAdded ? "scale-110" : "scale-100"}`}
            >
              {justAdded ? (
                <path
                  d="M5 12l5 5L20 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M12 5v14M5 12h14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
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
