"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import type { CartLineItem } from "@/lib/shopify/types";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

function CartLineItemRow({ item }: { item: CartLineItem }) {
  const { updateItem, removeItem, isPending } = useCart();
  const { merchandise } = item;

  return (
    <div className="flex gap-4 py-5">
      <Link
        href={`/products/${merchandise.product.handle}`}
        className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-[0.5rem] bg-neutral-100"
      >
        {merchandise.image ? (
          <Image
            src={merchandise.image.url}
            alt={merchandise.image.altText || merchandise.product.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] text-neutral-400">No img</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${merchandise.product.handle}`}
            className="font-primary text-sm font-light text-neutral-900 hover:text-neutral-500 transition-colors"
          >
            {merchandise.product.title}
          </Link>
          {merchandise.title !== "Default Title" && (
            <p className="mt-0.5 font-primary text-[11px] font-light text-neutral-400">
              {merchandise.selectedOptions.map((o) => o.value).join(" / ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-neutral-200 rounded-full">
            <button
              onClick={() => updateItem(item.id, item.quantity - 1)}
              disabled={isPending}
              className="px-3 py-1 font-primary text-xs text-neutral-700 transition-colors hover:text-neutral-400 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[28px] text-center font-primary text-xs text-neutral-900">
              {item.quantity}
            </span>
            <button
              onClick={() => updateItem(item.id, item.quantity + 1)}
              disabled={isPending}
              className="px-3 py-1 font-primary text-xs text-neutral-700 transition-colors hover:text-neutral-400 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-primary text-sm font-bold text-neutral-900">
              {formatPrice(
                item.cost.totalAmount.amount,
                item.cost.totalAmount.currencyCode
              )}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              disabled={isPending}
              className="font-primary text-[10px] tracking-[0.1em] text-neutral-400 uppercase transition-colors hover:text-neutral-900 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { cart, isOpen, closeCart, isPending } = useCart();
  const lines = cart?.lines.edges.map((e) => e.node) ?? [];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 transition-opacity"
          onClick={closeCart}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-primary text-[13px] font-bold tracking-[0.08em] text-neutral-900 uppercase">
            Your Bag ({cart?.totalQuantity ?? 0})
          </h2>
          <button
            onClick={closeCart}
            className="text-neutral-400 transition-colors hover:text-neutral-900"
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="font-primary text-sm font-light text-neutral-400">
                Your bag is empty.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 rounded-full border border-neutral-900 px-8 py-3 font-primary text-[11px] font-normal tracking-[0.08em] text-neutral-900 uppercase transition-all duration-200 hover:bg-neutral-900 hover:text-white"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {lines.map((item) => (
                <CartLineItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && cart && (
          <div className="border-t border-neutral-200 px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-primary text-[13px] font-bold tracking-[0.08em] text-neutral-900 uppercase">
                Subtotal
              </span>
              <span className="font-primary text-base font-bold text-neutral-900">
                {formatPrice(
                  cart.cost.subtotalAmount.amount,
                  cart.cost.subtotalAmount.currencyCode
                )}
              </span>
            </div>
            <p className="mb-4 font-primary text-[11px] font-light text-neutral-400">
              Shipping and taxes calculated at checkout.
            </p>
            <a
              href={cart.checkoutUrl}
              className={`block w-full rounded-full bg-neutral-900 py-3.5 text-center font-primary text-[11px] font-normal tracking-[0.08em] text-white uppercase transition-all duration-200 hover:bg-neutral-800 ${
                isPending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {isPending ? "Updating..." : "Checkout"}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
