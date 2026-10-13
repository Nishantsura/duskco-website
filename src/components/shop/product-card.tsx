"use client";

import { useCallback, useRef, useState } from "react";
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

export function ProductCard({ product }: { product: Product }) {
  const { open: openQuickView } = useQuickView();
  const { lastAddedProductId } = useCart();
  const justAdded = lastAddedProductId === product.id;
  const price = product.priceRange.minVariantPrice;
  const images = product.images?.edges?.map((e) => e.node) ?? [];
  const first = images[0] ?? product.featuredImage;
  const second = images[1];
  const displayName = product.title.split("—")[0].trim();

  // Which slide the mobile swipe carousel rests on (for the indicator).
  const [swipeIdx, setSwipeIdx] = useState(0);
  const swipeRef = useRef<HTMLDivElement>(null);
  const onSwipeScroll = useCallback(() => {
    const el = swipeRef.current;
    if (el?.offsetWidth) setSwipeIdx(Math.round(el.scrollLeft / el.offsetWidth));
  }, []);

  return (
    <div className="group">
      <Link
        href={`/products/${product.handle}`}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-surface"
      >
        {/* Mobile — swipe through every image */}
        {images.length > 0 && (
          <div
            ref={swipeRef}
            onScroll={onSwipeScroll}
            className="no-scrollbar absolute inset-0 flex snap-x snap-mandatory overflow-x-auto md:hidden"
            style={{ touchAction: "pan-x pan-y" }}
          >
            {images.map((img) => (
              <div key={img.url} className="relative h-full w-full flex-shrink-0 snap-center">
                <Image
                  src={img.url}
                  alt={img.altText || product.title}
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Desktop — cover, with the second view fading in on hover */}
        {first ? (
          <>
            <Image
              src={first.url}
              alt={first.altText || product.title}
              fill
              sizes="25vw"
              className="hidden object-cover md:block"
            />
            {second && (
              <Image
                src={second.url}
                alt=""
                fill
                sizes="25vw"
                className="hidden object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 md:block"
              />
            )}
          </>
        ) : (
          <div className="t-label flex h-full items-center justify-center text-ink-faint">
            No image
          </div>
        )}

        {/* Mobile swipe indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 md:hidden">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-px w-3 ${i === swipeIdx ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/products/${product.handle}`} className="hover:opacity-60 transition-opacity">
            <h3 className="t-label truncate">{displayName}</h3>
          </Link>
          <p className="t-body mt-0.5 text-ink-muted">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        </div>
        <button
          onClick={() => openQuickView(product)}
          className="t-label shrink-0 text-ink-muted transition-colors hover:text-ink"
        >
          {justAdded ? "Added" : "Add"}
        </button>
      </div>
    </div>
  );
}
