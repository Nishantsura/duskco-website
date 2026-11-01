"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "@/components/cart/cart-provider";
import { SizeGuide } from "@/components/shop/size-guide";
import {
  DEFAULT_WASH_CARE,
  DEFAULT_SHIPPING,
  DEFAULT_SIZE_CHART,
} from "@/lib/product-copy";
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
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
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
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between py-4 text-left"
      >
        <span className="t-label">{title}</span>
        <span className="text-ink-muted">
          <PlusMinus open={open} />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="t-body pb-5 text-ink-muted">
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
  const [openSection, setOpenSection] = useState<string | null>("washcare");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  // Editable copy — metafield content when present, house defaults otherwise.
  // (Garment specs render as the gallery's spec card, not here.)
  const washCare = product.washCare ?? DEFAULT_WASH_CARE;
  const shipping = product.shippingInfo ?? DEFAULT_SHIPPING;
  const sizeChart = product.sizeChart ?? DEFAULT_SIZE_CHART;
  const longDesc = (product.description?.length ?? 0) > 150;

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

  // Discounts are rare on the drop — only surface compare-at when it's actually
  // higher than the price, and keep it quiet otherwise.
  const compareAt = selectedVariant?.compareAtPrice ?? variants[0]?.compareAtPrice ?? null;
  const hasDiscount =
    !!compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(price.amount) / parseFloat(compareAt!.amount)) * 100)
    : 0;

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
      notify("One per person. That's the drop.");
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
      <p className="t-label text-ink-muted">Stage 01 · Limited</p>

      {/* Title + price */}
      <h1 className="t-title mt-3 uppercase">{displayName}</h1>
      <div className="t-body mt-2 flex items-baseline gap-3">
        <span>{formatPrice(price.amount, price.currencyCode)}</span>
        {hasDiscount && compareAt && (
          <>
            <span className="text-ink-faint line-through">
              {formatPrice(compareAt.amount, compareAt.currencyCode)}
            </span>
            <span className="text-ink-muted">{discountPct}% off</span>
          </>
        )}
      </div>

      {/* Description — three lines, expandable */}
      {product.description && (
        <div className="mt-6">
          <p className={`t-body text-ink-muted ${descOpen ? "" : "line-clamp-3"}`}>
            {product.description}
          </p>
          {longDesc && (
            <button
              onClick={() => setDescOpen((v) => !v)}
              className="t-label link mt-2 text-ink-muted"
              aria-expanded={descOpen}
            >
              {descOpen ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Accordions — all copy editable via custom.* metafields */}
      <div className="mt-8 border-t border-line lg:flex-1 lg:overflow-y-auto">
        <Accordion
          title="Wash Care"
          open={openSection === "washcare"}
          onToggle={() => toggleSection("washcare")}
        >
          <ul className="space-y-1">
            {washCare.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Accordion>

        <Accordion
          title="Shipping"
          open={openSection === "shipping"}
          onToggle={() => toggleSection("shipping")}
        >
          <ul className="space-y-1">
            {shipping.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Accordion>
      </div>

      {/* Hidden marker so the mobile gallery dock can read the selected size */}
      {selectedSize && (
        <span data-size-btn="active" className="hidden">
          {selectedSize}
        </span>
      )}

      {/* Size + add to bag */}
      <div className="mt-8 lg:mt-6">
        {sizes.length > 0 && (
          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="t-label">Size{selectedSize ? ` · ${selectedSize}` : ""}</span>
              <button
                onClick={() => {
                  capture("size_guide_opened", {
                    product_id: product.id,
                    product_name: product.title,
                  });
                  setSizeGuideOpen(true);
                }}
                className="t-label link text-ink-muted"
              >
                Size guide
              </button>
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
                    data-active={active}
                    data-available={available}
                    className="size-cell"
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
          disabled={soldOut || isPending}
          className={`btn h-12 w-full ${needsSize ? "btn-outline" : "btn-primary"}`}
        >
          {soldOut
            ? "Sold out"
            : isPending
              ? "Adding"
              : needsSize
                ? "Select a size"
                : "Add to bag"}
        </button>
      </div>

      <SizeGuide
        chart={sizeChart}
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}
