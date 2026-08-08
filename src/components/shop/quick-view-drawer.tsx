"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { useQuickView } from "./quick-view-provider";
import { useCart } from "@/components/cart/cart-provider";
import { HoldToAddButton } from "./hold-to-add-button";
import { capture, productProps } from "@/lib/analytics";

/* Dark "After Hours" system — mirrors the drop story so the add-to-bag flow
   lives in the same world. Mint is the single accent. */
const MINT = "var(--accent)";

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
  const { addItem, isPending, isInCart, notify } = useCart();
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

  const alreadyInBag = product ? isInCart(product.handle) : false;

  async function handleAddToCart() {
    if (!product) return;
    // One unit per product — a second add just reminds the shopper.
    if (alreadyInBag) {
      notify("One per person — that's the drop");
      close();
      return;
    }
    if (!selectedSize) return;
    const variant = getVariantForSize(selectedSize);
    if (!variant) return;

    capture("product_added_to_cart", {
      ...productProps(product),
      variant_id: variant.id,
      size: selectedSize,
      quantity: 1,
      source: "quick_view",
    });

    setAdding(true);
    await addItem(variant.id, 1, product.id);
    setAdding(false);
    close();
  }

  const displayName = product?.title?.split("—")[0]?.trim() ?? "";
  const addActive = !!selectedSize || alreadyInBag;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] transition-opacity"
          onClick={close}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[430px] flex-col text-ink transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "var(--bg)",
          // Only while open — closed at translate-x-full the leftward shadow
          // spilled a faint vertical band onto the right edge of every page.
          boxShadow: isOpen ? "-30px 0 80px -40px rgba(0,0,0,0.9)" : "none",
        }}
      >
        {/* mint hairline down the leading edge — only while open, otherwise the
            closed drawer's edge bleeds a faint 1px line at the viewport's right */}
        {isOpen && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-px"
            style={{ background: `linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent) 33%, transparent), transparent)` }}
          />
        )}

        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/60 backdrop-blur-md transition-all hover:border-white/25 hover:text-white"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {product && (
            <>
              {/* Image carousel */}
              <div className="relative aspect-[4/5] w-full" style={{ background: "var(--surface)" }}>
                {images[imgIdx] ? (
                  <Image
                    src={images[imgIdx].url}
                    alt={images[imgIdx].altText || product.title}
                    fill
                    sizes="430px"
                    className="object-cover"
                  />
                ) : product.featuredImage ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.title}
                    fill
                    sizes="430px"
                    className="object-cover"
                  />
                ) : null}

                {/* bottom fade so the image melts into the dark panel */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                  style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImgIdx((i) => (i - 1 + images.length) % images.length)
                      }
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 backdrop-blur-md transition-all hover:border-white/30 hover:text-white"
                      aria-label="Previous"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 backdrop-blur-md transition-all hover:border-white/30 hover:text-white"
                      aria-label="Next"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          aria-label={`Image ${i + 1}`}
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: i === imgIdx ? 18 : 6,
                            background: i === imgIdx ? MINT : "rgba(255,255,255,0.4)",
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Product info */}
              <div className="px-6 pb-8 pt-2">
                {/* kicker */}
                <p
                  className="flex items-center gap-2 font-primary text-[10px] font-semibold tracking-[0.24em] uppercase"
                  style={{ color: "var(--ink-faint)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: MINT, boxShadow: `0 0 6px ${MINT}` }} />
                  Stage One · Limited
                </p>

                {/* Name */}
                <h2 className="mt-3 font-street text-[clamp(30px,8vw,44px)] leading-[0.92] tracking-[0.01em] uppercase">
                  {displayName}
                </h2>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-street text-[30px] leading-none tracking-[0.01em]">
                    {minPrice && formatPrice(minPrice.amount, minPrice.currencyCode)}
                  </span>
                  {hasDiscount && compareAt && (
                    <>
                      <span className="font-primary text-[14px] text-ink-faint line-through">
                        {formatPrice(compareAt.amount, compareAt.currencyCode)}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 font-primary text-[11px] font-bold"
                        style={{ background: `var(--accent-soft)`, color: MINT }}
                      >
                        −{discountPct}%
                      </span>
                    </>
                  )}
                </div>

                {/* Size selector */}
                {sizes.length > 0 && (
                  <div className="mt-7">
                    <p className="mb-3 font-primary text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: "var(--ink-faint)" }}>
                      Select size
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
                            className="dusk-size flex h-[42px] min-w-[52px] items-center justify-center rounded-full border px-4 font-primary text-[12px] font-bold uppercase tracking-[0.06em] transition-all duration-200"
                            data-active={active}
                            data-available={available}
                            style={{ "--mint": MINT } as React.CSSProperties}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add to cart — hold-to-add on mobile, click on desktop */}
                <HoldToAddButton
                  onAdd={handleAddToCart}
                  disabled={!addActive || adding || isPending}
                  canHold={!!selectedSize && !alreadyInBag && !adding && !isPending}
                  holdLabel="Keep holding"
                  fillClassName="bg-accent"
                  className={`dusk-add mt-7 flex h-[52px] w-full items-center justify-center gap-2 rounded-full border font-primary text-[12px] font-bold tracking-[0.18em] uppercase transition-all ${
                    addActive ? "dusk-add--on text-ink" : "text-ink-faint"
                  }`}
                  idleLabel={
                    adding || isPending
                      ? "Adding…"
                      : addActive
                        ? "Add to bag"
                        : "Select a size"
                  }
                />

                {/* Benefits */}
                <div className="mt-6 space-y-3 border-t pt-6" style={{ borderColor: "var(--line)" }}>
                  {[
                    "Cash on Delivery",
                    "Free Shipping",
                    "Dispatch within 5–7 working days",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2.5">
                      <span
                        className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: `var(--accent-soft)`, color: MINT }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span className="font-primary text-[13px]" style={{ color: "var(--ink-muted)" }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* View full details */}
                <Link
                  href={`/products/${product.handle}`}
                  onClick={close}
                  className="dusk-details mt-6 flex w-full items-center justify-center gap-2 rounded-full border py-3.5 font-primary text-[11px] font-bold tracking-[0.16em] uppercase"
                  style={
                    {
                      borderColor: "var(--line)",
                      color: "var(--ink-muted)",
                    } as React.CSSProperties
                  }
                >
                  <ArrowUpRight size={14} strokeWidth={2} />
                  View full details
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
