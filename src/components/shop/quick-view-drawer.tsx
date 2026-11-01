"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuickView } from "./quick-view-provider";
import { useCart } from "@/components/cart/cart-provider";
import { capture, productProps } from "@/lib/analytics";

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
      notify("One per person. That's the drop.");
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
  const shown = images[imgIdx] ?? product?.featuredImage;
  const addActive = !!selectedSize || alreadyInBag;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      <div
        className={`gate-scope fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-bg text-ink transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isOpen ? "translate-x-0 border-l border-line" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-11 shrink-0 items-center justify-end px-5">
          <button onClick={close} className="t-label transition-opacity hover:opacity-60">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {product && (
            <>
              {/* Image — tap the left or right half to step through */}
              <div className="relative aspect-[4/5] w-full bg-surface">
                {shown && (
                  <Image
                    src={shown.url}
                    alt={shown.altText || product.title}
                    fill
                    sizes="420px"
                    className="object-cover"
                  />
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                      className="absolute inset-y-0 left-0 w-1/2 cursor-w-resize"
                      aria-label="Previous image"
                    />
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute inset-y-0 right-0 w-1/2 cursor-e-resize"
                      aria-label="Next image"
                    />
                    <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                      {images.map((_, i) => (
                        <span
                          key={i}
                          className={`h-px w-4 ${i === imgIdx ? "bg-white" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="px-5 pb-10 pt-6">
                <p className="t-label text-ink-muted">Stage One · Limited</p>
                <h2 className="t-title mt-3 uppercase">{displayName}</h2>

                <div className="t-body mt-2 flex items-baseline gap-3">
                  <span>{minPrice && formatPrice(minPrice.amount, minPrice.currencyCode)}</span>
                  {hasDiscount && compareAt && (
                    <>
                      <span className="text-ink-faint line-through">
                        {formatPrice(compareAt.amount, compareAt.currencyCode)}
                      </span>
                      <span className="text-ink-muted">{discountPct}% off</span>
                    </>
                  )}
                </div>

                {sizes.length > 0 && (
                  <div className="mt-8">
                    <p className="t-label mb-3">
                      Size{selectedSize ? ` · ${selectedSize}` : ""}
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
                            aria-pressed={active}
                            className="size-cell"
                            data-active={active}
                            data-available={available}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={!addActive || adding || isPending}
                  className={`btn mt-6 h-12 w-full ${addActive ? "btn-primary" : "btn-outline"}`}
                >
                  {adding || isPending ? "Adding" : addActive ? "Add to bag" : "Select a size"}
                </button>

                <Link
                  href={`/products/${product.handle}`}
                  onClick={close}
                  className="btn btn-outline mt-3 h-12 w-full"
                >
                  View details
                </Link>

                <ul className="t-body mt-8 space-y-1 border-t border-line pt-6 text-ink-muted">
                  <li>Cash on delivery</li>
                  <li>Free shipping</li>
                  <li>Dispatched within 5 to 7 working days</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
