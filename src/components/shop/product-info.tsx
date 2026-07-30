"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "@/components/cart/cart-provider";
import { SizeGuide } from "@/components/shop/size-guide";
import { HoldToAddButton } from "@/components/shop/hold-to-add-button";
import { capture, productProps } from "@/lib/analytics";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

function PlusMinus({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="flex-shrink-0"
    >
      <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
      {!open && <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />}
    </svg>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-primary text-[12px] font-bold tracking-[0.08em] text-neutral-900 uppercase">
          {title}
        </span>
        <PlusMinus open={open} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 font-primary text-[13px] font-light leading-[1.7] text-neutral-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductInfo({ product }: { product: Product }) {
  const variants = product.variants.edges.map((e) => e.node);
  const price = product.priceRange.minVariantPrice;

  const sizeOption = product.options.find(
    (o) => o.name.toLowerCase() === "size"
  );
  const sizes = sizeOption?.values ?? [];

  const { addItem, isPending, isInCart, notify } = useCart();

  useEffect(() => {
    capture("product_viewed", { ...productProps(product), source: "pdp" });
  }, [product]);

  const [selectedSize, setSelectedSize] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key));
  }

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

  const selectedVariant = selectedSize
    ? getVariantForSize(selectedSize)
    : variants[0];

  const displayName = product.title.split("—")[0].trim();

  const needsSize = sizes.length > 0 && !selectedSize;
  const soldOut = !product.availableForSale;
  const alreadyInBag = isInCart(product.handle);

  function handleAddToCart() {
    if (soldOut) return;
    if (needsSize) {
      notify("Select a size");
      return;
    }
    // One unit per product — a second add just reminds the shopper.
    if (alreadyInBag) {
      notify("Already in your bag");
      return;
    }
    if (selectedVariant) {
      capture("product_added_to_cart", {
        ...productProps(product),
        variant_id: selectedVariant.id,
        size: selectedSize || null,
        quantity: 1,
        source: "pdp",
      });
      addItem(selectedVariant.id, 1, product.id);
    }
  }

  return (
    <div className="flex flex-col lg:h-full">
      {/* ── Header: title + price ── */}
      <div className="flex items-start justify-between gap-6">
        <h1 className="font-heading text-[19px] font-bold leading-tight tracking-[0.02em] text-neutral-900 uppercase">
          {displayName}
        </h1>
        <p className="whitespace-nowrap font-primary text-[16px] font-medium text-neutral-900">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>

      {/* ── Description ── */}
      {product.description && (
        <p className="mt-5 font-primary text-[13px] font-light leading-[1.7] text-neutral-500">
          {product.description}
        </p>
      )}

      {/* ── Accordions ── */}
      <div className="mt-6 border-t border-neutral-200 lg:flex-1 lg:overflow-y-auto">
        <Accordion
          title="Garment Details"
          open={openSection === "details"}
          onToggle={() => toggleSection("details")}
        >
          {product.productType && (
            <p className="mb-3 text-[12px] font-medium text-neutral-500">
              {product.productType}
            </p>
          )}
          <ul className="space-y-1">
            <li>100% Premium Cotton</li>
            <li>Weight — 220 gsm</li>
            <li>Relaxed Fit</li>
          </ul>
        </Accordion>

        <Accordion
          title="Wash Care"
          open={openSection === "washcare"}
          onToggle={() => toggleSection("washcare")}
        >
          <ul className="space-y-1.5">
            <li>Machine wash cold with similar colours</li>
            <li>Do not bleach</li>
            <li>Tumble dry low</li>
            <li>Iron on low heat if needed</li>
            <li>Do not dry clean</li>
          </ul>
        </Accordion>

        <Accordion
          title="Shipping"
          open={openSection === "shipping"}
          onToggle={() => toggleSection("shipping")}
        >
          <ul className="space-y-1.5">
            <li>Free shipping on orders above ₹2,999</li>
            <li>Standard delivery: 5–7 business days</li>
            <li>Express delivery: 2–3 business days</li>
            <li>Cash on Delivery available</li>
            <li>Easy returns within 7 days of delivery</li>
          </ul>
        </Accordion>
      </div>

      {/* Hidden marker so the mobile gallery dock can read the selected size */}
      {selectedSize && (
        <span data-size-btn="active" className="hidden">
          {selectedSize}
        </span>
      )}

      {/* ── Bottom: size selector + add to cart ── */}
      <div className="mt-6 lg:mt-4">
        {/* Size selector — inline buttons */}
        {sizes.length > 0 && (
          <div className="mb-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-primary text-[12px] font-bold tracking-[0.08em] text-neutral-900 uppercase">
                Size{selectedSize ? `: ${selectedSize}` : ""}
              </span>
              {product.sizeChart && (
                <button
                  onClick={() => {
                    capture("size_guide_opened", {
                      product_id: product.id,
                      product_name: product.title,
                    });
                    setSizeGuideOpen(true);
                  }}
                  className="font-primary text-[11px] font-medium tracking-[0.04em] text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
                >
                  Size Guide
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const available = isSizeAvailable(size);
                const active = selectedSize === size;
                return (
                  <button
                    key={size}
                    disabled={!available}
                    aria-pressed={active}
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-11 min-w-[3.25rem] items-center justify-center px-3.5 font-primary text-[12px] font-medium tracking-[0.04em] uppercase transition-all ${
                      active
                        ? "border border-neutral-900 bg-neutral-900 text-white"
                        : available
                          ? "border border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
                          : "cursor-not-allowed border border-neutral-200 bg-neutral-50 text-neutral-300 line-through"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add to cart — tap adds instantly, press-and-hold on any device */}
        <div className="flex items-stretch border-t border-neutral-200">
          <HoldToAddButton
            onAdd={handleAddToCart}
            disabled={soldOut || isPending}
            canHold={!soldOut && !isPending && !needsSize && !alreadyInBag}
            holdLabel="Hold to Add"
            fillClassName="bg-accent-orange"
            className={`flex w-full items-center justify-center px-8 py-5 font-primary text-[11px] font-normal tracking-[0.1em] uppercase transition-all disabled:cursor-not-allowed ${
              soldOut
                ? "bg-neutral-200 text-neutral-400"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
            idleLabel={
              soldOut
                ? "Sold Out"
                : isPending
                  ? "Adding..."
                  : needsSize
                    ? "Select a Size"
                    : "Add to Cart"
            }
          />
        </div>
      </div>

      {product.sizeChart && (
        <SizeGuide
          chart={product.sizeChart}
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
        />
      )}
    </div>
  );
}
