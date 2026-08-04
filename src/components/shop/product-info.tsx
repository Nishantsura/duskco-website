"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "@/components/cart/cart-provider";
import { SizeGuide } from "@/components/shop/size-guide";
import { HoldToAddButton } from "@/components/shop/hold-to-add-button";
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
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-primary text-[12px] font-bold tracking-[0.08em] text-ink uppercase transition-colors group-hover:text-ink">
          {title}
        </span>
        <span className={open ? "text-accent" : "text-ink-faint"}>
          <PlusMinus open={open} />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 font-primary text-[13px] font-light leading-[1.7] text-ink-muted">
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
      notify("One per person — that's the drop");
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
      {/* ── Kicker ── */}
      <p className="flex items-center gap-2 font-primary text-[10px] font-semibold tracking-[0.24em] text-ink-faint uppercase">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }}
        />
        Stage One · Limited
      </p>

      {/* ── Header: title + price ── */}
      <div className="mt-3 flex items-end justify-between gap-6">
        <h1 className="font-street text-[clamp(30px,3.4vw,46px)] font-normal leading-[0.9] tracking-[0.01em] text-ink uppercase">
          {displayName}
        </h1>
        <div className="flex flex-col items-end gap-1">
          <p className="whitespace-nowrap font-street text-[26px] leading-none tracking-[0.01em] text-ink">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
          {hasDiscount && compareAt && (
            <div className="flex items-center gap-2">
              <span className="font-primary text-[13px] text-ink-faint line-through">
                {formatPrice(compareAt.amount, compareAt.currencyCode)}
              </span>
              <span
                className="rounded-full px-2 py-0.5 font-primary text-[11px] font-bold"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                −{discountPct}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Description — three lines, expandable ── */}
      {product.description && (
        <div className="mt-5">
          <p
            className={`font-primary text-[13px] font-light leading-[1.7] text-ink-muted ${
              descOpen ? "" : "line-clamp-3"
            }`}
          >
            {product.description}
          </p>
          {longDesc && (
            <button
              onClick={() => setDescOpen((v) => !v)}
              className="mt-2.5 flex items-center gap-1 font-primary text-[11px] font-semibold tracking-[0.12em] text-ink-muted uppercase transition-colors hover:text-accent"
              aria-expanded={descOpen}
            >
              {descOpen ? "View less" : "View more"}
              <ChevronDown
                size={13}
                strokeWidth={2}
                className={`transition-transform duration-300 ${descOpen ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      )}

      {/* ── Accordions — all copy editable via custom.* metafields ── */}
      <div className="mt-6 border-t border-line lg:flex-1 lg:overflow-y-auto">
        <Accordion
          title="Wash Care"
          open={openSection === "washcare"}
          onToggle={() => toggleSection("washcare")}
        >
          <ul className="space-y-1.5">
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
          <ul className="space-y-1.5">
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

      {/* ── Bottom: size selector + add to cart ── */}
      <div className="mt-6 lg:mt-4">
        {/* Size selector — inline buttons */}
        {sizes.length > 0 && (
          <div className="mb-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-primary text-[12px] font-bold tracking-[0.08em] text-ink uppercase">
                Size{selectedSize ? `: ${selectedSize}` : ""}
              </span>
              <button
                onClick={() => {
                  capture("size_guide_opened", {
                    product_id: product.id,
                    product_name: product.title,
                  });
                  setSizeGuideOpen(true);
                }}
                className="font-primary text-[11px] font-medium tracking-[0.04em] text-ink-faint underline underline-offset-2 transition-colors hover:text-accent"
              >
                Size Guide
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
                    data-available={available}                    className="dusk-size flex h-11 min-w-[3.25rem] items-center justify-center rounded-full border px-4 font-primary text-[12px] font-bold tracking-[0.05em] uppercase transition-all duration-200"
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add to cart — tap adds instantly, press-and-hold on any device */}
        <div className="flex items-stretch">
          <HoldToAddButton
            onAdd={handleAddToCart}
            disabled={soldOut || isPending}
            canHold={!soldOut && !isPending && !needsSize && !alreadyInBag}
            holdLabel="Keep holding"
            fillClassName="bg-accent"
            className={`dusk-add flex h-[54px] w-full items-center justify-center rounded-full border font-primary text-[12px] font-bold tracking-[0.18em] uppercase transition-all disabled:cursor-not-allowed ${
              soldOut
                ? "border-line text-ink-faint"
                : needsSize
                  ? "text-ink-faint"
                  : "dusk-add--on text-ink"
            }`}
            idleLabel={
              soldOut
                ? "Sold Out"
                : isPending
                  ? "Adding…"
                  : needsSize
                    ? "Select a Size"
                    : "Add to Cart"
            }
          />
        </div>
      </div>

      <SizeGuide
        chart={sizeChart}
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}
