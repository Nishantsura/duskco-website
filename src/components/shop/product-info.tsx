"use client";

import { useState } from "react";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "@/components/cart/cart-provider";
import { SizeGuide } from "@/components/shop/size-guide";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

const TABS = ["Details & Description", "Washcare", "Shipping"] as const;
type Tab = (typeof TABS)[number];

export function ProductInfo({ product }: { product: Product }) {
  const variants = product.variants.edges.map((e) => e.node);
  const price = product.priceRange.minVariantPrice;

  const sizeOption = product.options.find(
    (o) => o.name.toLowerCase() === "size"
  );
  const sizes = sizeOption?.values ?? [];

  const { addItem, isPending } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Details & Description");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

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

  return (
    <div className="flex flex-col">
      {/* Title + Price */}
      <h1 className="font-primary text-[20px] font-bold text-neutral-900">
        {displayName}
      </h1>
      <p className="mt-1.5 font-primary text-[15px] text-neutral-600">
        {formatPrice(price.amount, price.currencyCode)}
      </p>

      {/* Size selector */}
      {sizes.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="font-primary text-[12px] font-medium tracking-[0.06em] text-neutral-500 uppercase">
              Size
            </p>
            {product.sizeChart && (
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="font-primary text-[12px] font-medium text-neutral-900 underline underline-offset-2 transition-colors hover:text-neutral-500"
              >
                Size Guide
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  data-size-btn={active ? "active" : undefined}
                  onClick={() => available && setSelectedSize(size)}
                  disabled={!available}
                  className={`flex h-11 min-w-[56px] items-center justify-center rounded-full border px-5 font-primary text-[13px] transition-all ${
                    active
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : available
                        ? "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-600"
                        : "border-neutral-200 bg-neutral-50 text-neutral-300 line-through cursor-not-allowed"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button
          disabled={
            isPending ||
            !product.availableForSale ||
            (sizes.length > 0 && !selectedSize)
          }
          onClick={() => {
            if (selectedVariant) addItem(selectedVariant.id);
          }}
          className="flex-1 rounded-full border border-neutral-900 bg-white py-3.5 font-primary text-[11px] font-normal tracking-[0.08em] text-neutral-900 uppercase transition-all hover:bg-neutral-100 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
        >
          {!product.availableForSale
            ? "Sold Out"
            : isPending
              ? "Adding..."
              : "Add to Bag"}
        </button>
        <button
          disabled={
            !product.availableForSale ||
            (sizes.length > 0 && !selectedSize)
          }
          onClick={() => {
            if (selectedVariant) {
              addItem(selectedVariant.id);
            }
          }}
          className="flex-1 rounded-full bg-neutral-900 py-3.5 font-primary text-[11px] font-normal tracking-[0.08em] text-white uppercase transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Buy Now
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-t border-neutral-200">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 border-b-2 py-3.5 font-primary text-[12px] font-medium tracking-[0.02em] transition-colors ${
                activeTab === tab
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="py-5 font-primary text-[13px] font-light leading-[1.8] text-neutral-600">
          {activeTab === "Details & Description" && (
            <div>
              {product.productType && (
                <p className="mb-3 text-[12px] font-medium text-neutral-500">
                  {product.productType}
                </p>
              )}
              <ul className="mb-4 space-y-1">
                <li>100% Premium Cotton</li>
                <li>Weight — 220 gsm</li>
                <li>Relaxed Fit</li>
              </ul>
              {product.description && (
                <p>{product.description}</p>
              )}
            </div>
          )}

          {activeTab === "Washcare" && (
            <ul className="space-y-1.5">
              <li>Machine wash cold with similar colours</li>
              <li>Do not bleach</li>
              <li>Tumble dry low</li>
              <li>Iron on low heat if needed</li>
              <li>Do not dry clean</li>
            </ul>
          )}

          {activeTab === "Shipping" && (
            <ul className="space-y-1.5">
              <li>Free shipping on orders above ₹2,999</li>
              <li>Standard delivery: 5–7 business days</li>
              <li>Express delivery: 2–3 business days</li>
              <li>Cash on Delivery available</li>
              <li>Easy returns within 7 days of delivery</li>
            </ul>
          )}
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
