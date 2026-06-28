"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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

export function QuickViewDrawer() {
  const { product, isOpen, close } = useQuickView();
  const { addItem, isPending } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const images = product?.images?.edges?.map((e) => e.node) ?? [];
  const variants = product?.variants?.edges?.map((e) => e.node) ?? [];

  const sizeOption = product?.options?.find(
    (o) => o.name.toLowerCase() === "size"
  );
  const sizes = sizeOption?.values ?? [];

  const minPrice = product?.priceRange?.minVariantPrice;
  const maxPrice = product?.priceRange?.maxVariantPrice;
  const compareAt = variants[0]?.compareAtPrice;
  const hasDiscount =
    compareAt && parseFloat(compareAt.amount) > parseFloat(minPrice?.amount ?? "0");
  const discountPct = hasDiscount
    ? Math.round(
        ((parseFloat(compareAt.amount) - parseFloat(minPrice!.amount)) /
          parseFloat(compareAt.amount)) *
          100
      )
    : 0;

  useEffect(() => {
    setImgIdx(0);
    setSelectedSize(null);
    setAdding(false);
  }, [product]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function getVariantForSize(size: string) {
    return variants.find((v) =>
      v.selectedOptions.some(
        (o) => o.name.toLowerCase() === "size" && o.value === size
      )
    );
  }

  function isSizeAvailable(size: string) {
    const variant = getVariantForSize(size);
    return variant?.availableForSale ?? false;
  }

  async function handleAddToCart() {
    if (!selectedSize || !product) return;
    const variant = getVariantForSize(selectedSize);
    if (!variant) return;

    setAdding(true);
    await addItem(variant.id);
    setAdding(false);
    close();
  }

  const displayName = product?.title?.split("—")[0]?.trim() ?? "";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={close}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {product && (
            <>
              {/* Image carousel */}
              <div className="relative aspect-[4/5] w-full bg-[#f0f0f0]">
                {images[imgIdx] ? (
                  <Image
                    src={images[imgIdx].url}
                    alt={images[imgIdx].altText || product.title}
                    fill
                    sizes="420px"
                    className="object-cover"
                  />
                ) : product.featuredImage ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.title}
                    fill
                    sizes="420px"
                    className="object-cover"
                  />
                ) : null}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImgIdx((i) => (i - 1 + images.length) % images.length)
                      }
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 backdrop-blur-sm transition-opacity hover:bg-white"
                      aria-label="Previous"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setImgIdx((i) => (i + 1) % images.length)
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 backdrop-blur-sm transition-opacity hover:bg-white"
                      aria-label="Next"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`block h-[6px] w-[6px] rounded-full transition-colors ${
                            i === imgIdx ? "bg-neutral-800" : "bg-neutral-400/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Product info */}
              <div className="px-5 py-5">
                {/* Name */}
                <h2 className="font-primary text-[18px] font-bold tracking-[0.01em] text-neutral-900">
                  {displayName}
                </h2>

                {/* Price */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-primary text-[16px] font-medium text-neutral-900">
                    {minPrice && formatPrice(minPrice.amount, minPrice.currencyCode)}
                  </span>
                  {hasDiscount && compareAt && (
                    <>
                      <span className="font-primary text-[14px] text-neutral-400 line-through">
                        {formatPrice(compareAt.amount, compareAt.currencyCode)}
                      </span>
                      <span className="font-primary text-[13px] font-medium text-red-500">
                        -{discountPct}%
                      </span>
                    </>
                  )}
                </div>

                {/* Size selector */}
                {sizes.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2.5 font-primary text-[12px] font-medium tracking-[0.06em] text-neutral-600 uppercase">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const available = isSizeAvailable(size);
                        const active = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => available && setSelectedSize(size)}
                            disabled={!available}
                            className={`flex h-[36px] min-w-[48px] items-center justify-center rounded-full border px-4 font-primary text-[10px] transition-all ${
                              active
                                ? "border-neutral-900 bg-[#1C1C1C] text-white"
                                : available
                                  ? "border-[#DCDCDC] bg-white text-neutral-800 hover:border-neutral-600"
                                  : "border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || adding || isPending}
                  className={`mt-6 flex h-[43px] w-full items-center justify-center rounded-full font-primary text-[11px] font-normal tracking-[0.08em] uppercase transition-all ${
                    selectedSize
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {adding || isPending
                    ? "Adding..."
                    : selectedSize
                      ? "Add to Cart"
                      : "Select a Size"}
                </button>

                {/* Benefits */}
                <div className="mt-5 space-y-2.5 border-t border-neutral-100 pt-5">
                  {[
                    "Cash on Delivery",
                    "Free Shipping",
                    "Dispatch within 5 to 7 working days",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2.5">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-neutral-700">
                        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-primary text-[13px] text-neutral-600">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* View full details */}
                <Link
                  href={`/products/${product.handle}`}
                  onClick={close}
                  className="mt-5 block w-full border-t border-neutral-100 pt-5 text-center font-primary text-[13px] font-bold tracking-[0.06em] text-neutral-900 uppercase transition-colors hover:text-neutral-500"
                >
                  View Full Details
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
