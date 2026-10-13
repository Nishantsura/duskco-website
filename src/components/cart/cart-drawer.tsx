"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import type { CartLineItem } from "@/lib/shopify/types";
import { capture } from "@/lib/analytics";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

function CartLineItemRow({ item }: { item: CartLineItem }) {
  const { removeItem, isPending } = useCart();
  const { merchandise } = item;

  return (
    <div className="flex gap-4 py-5">
      <Link
        href={`/products/${merchandise.product.handle}`}
        className="relative h-28 w-[84px] flex-shrink-0 overflow-hidden bg-surface"
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
            <span className="t-label text-ink-faint">No image</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${merchandise.product.handle}`}
            className="t-label transition-opacity hover:opacity-60"
          >
            {merchandise.product.title}
          </Link>
          {merchandise.title !== "Default Title" && (
            <p className="t-body mt-1 text-ink-muted">
              {merchandise.selectedOptions.map((o) => o.value).join(" / ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="t-body">
            {formatPrice(
              item.cost.totalAmount.amount,
              item.cost.totalAmount.currencyCode
            )}
          </span>
          <button
            onClick={() => removeItem(item.id)}
            disabled={isPending}
            className="t-label link text-ink-muted disabled:opacity-40"
          >
            Remove
          </button>
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
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-bg text-ink transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isOpen ? "translate-x-0 border-l border-line" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex h-11 items-center justify-between border-b border-line px-5">
          <h2 className="t-label">
            Bag ({cart?.totalQuantity ?? 0})
          </h2>
          <button
            onClick={closeCart}
            className="t-label transition-opacity hover:opacity-60"
            aria-label="Close bag"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="t-body text-ink-muted">Your bag is empty.</p>
              <button
                onClick={closeCart}
                className="btn btn-outline mt-6"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {lines.map((item) => (
                <CartLineItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && cart && (
          <div className="border-t border-line px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="t-label">Subtotal</span>
              <span className="t-body">
                {formatPrice(
                  cart.cost.subtotalAmount.amount,
                  cart.cost.subtotalAmount.currencyCode
                )}
              </span>
            </div>
            <p className="t-body mb-5 text-ink-muted">
              Shipping and taxes calculated at checkout.
            </p>
            <a
              href={cart.checkoutUrl}
              onClick={() =>
                capture("checkout_started", {
                  item_count: cart.totalQuantity,
                  subtotal: parseFloat(cart.cost.subtotalAmount.amount),
                  currency: cart.cost.subtotalAmount.currencyCode,
                })
              }
              className={`btn btn-primary h-12 w-full ${
                isPending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {isPending ? "Updating" : "Checkout"}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
