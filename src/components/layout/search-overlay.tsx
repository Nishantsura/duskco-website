"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import { searchAction } from "./search-actions";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const products = await searchAction(value);
      setResults(products);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-brand-light-grey/30">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-6 sm:px-10">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="flex-shrink-0 text-brand-dark-grey"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 font-primary text-lg font-light text-brand-black placeholder:text-brand-light-grey focus:outline-none"
          />
          <button
            onClick={onClose}
            className="font-primary text-xs font-bold tracking-[0.15em] text-brand-dark-grey uppercase transition-colors hover:text-brand-black"
          >
            Close
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1440px] px-6 py-8 sm:px-10">
          {loading && (
            <p className="font-primary text-sm font-light text-brand-medium-grey">
              Searching...
            </p>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="font-primary text-sm font-light text-brand-medium-grey">
              No results found for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.length > 0 && (
            <>
              <p className="mb-6 font-primary text-[11px] font-bold tracking-[0.15em] text-brand-dark-grey uppercase">
                {results.length} Result{results.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    onClick={onClose}
                    className="group block"
                  >
                    <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden bg-brand-chalk">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={
                            product.featuredImage.altText || product.title
                          }
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-primary text-xs font-light text-brand-medium-grey">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-primary text-[10px] font-bold tracking-[0.15em] text-brand-dark-grey uppercase">
                      DUSK&CO
                    </p>
                    <h3 className="mt-0.5 font-primary text-sm font-light text-brand-black">
                      {product.title}
                    </h3>
                    <p className="mt-0.5 font-primary text-sm font-light text-brand-black">
                      {formatPrice(
                        product.priceRange.minVariantPrice.amount,
                        product.priceRange.minVariantPrice.currencyCode
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="py-20 text-center">
              <p className="font-primary text-sm font-light text-brand-medium-grey">
                Start typing to search products
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
