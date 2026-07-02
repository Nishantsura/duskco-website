"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/shopify/types";
import { ProductCard } from "./product-card";

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name-asc", label: "Name: A–Z" },
];

function priceOf(p: Product) {
  return parseFloat(p.priceRange.minVariantPrice.amount);
}

export function ShopGrid({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [open, setOpen] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...products];
    switch (sort) {
      case "price-asc":
        return arr.sort((a, b) => priceOf(a) - priceOf(b));
      case "price-desc":
        return arr.sort((a, b) => priceOf(b) - priceOf(a));
      case "name-asc":
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return arr;
    }
  }, [products, sort]);

  const activeLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Featured";

  return (
    <>
      <div className="flex items-center justify-end border-b border-black/5 py-4">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="font-primary text-[11px] font-bold tracking-[0.15em] text-brand-black uppercase"
          >
            Sort: {activeLabel} +
          </button>
          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 top-full z-20 mt-2 min-w-[200px] rounded-[0.2rem] border border-black/10 bg-white shadow-lg overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSort(opt.key);
                      setOpen(false);
                    }}
                    className={`block w-full px-4 py-2.5 text-left font-primary text-[11px] tracking-[0.12em] uppercase transition-colors ${
                      sort === opt.key
                        ? "bg-black/5 font-bold text-brand-black"
                        : "text-neutral-600 hover:bg-black/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-8 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
