"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { useCart } from "@/components/cart/cart-provider";
import { useNavVisibility, NAVBAR_HEIGHT } from "./nav-visibility";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hidden, scrolled } = useNavVisibility();
  const { cart, openCart } = useCart();
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div
          className="mx-auto flex max-w-[90rem] items-center justify-between px-6 sm:px-10"
          style={{ height: NAVBAR_HEIGHT }}
        >
          {/* Left — hamburger */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex flex-col gap-[4px]"
            >
              <span className={`block h-[1.5px] w-[18px] transition-colors ${isTransparent ? "bg-white" : "bg-black"}`} />
              <span className={`block h-[1.5px] w-[18px] transition-colors ${isTransparent ? "bg-white" : "bg-black"}`} />
            </button>
          </div>

          {/* Center — Logo */}
          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 font-display text-lg font-bold tracking-[0.08em] uppercase sm:text-xl transition-colors duration-200 ${isTransparent ? "text-white" : "text-black"}`}
          >
            DUSK&CO
          </Link>

          {/* Right — Stage 1 + Cart icon */}
          <div className="flex items-center gap-6">
            <Link
              href="/shop"
              className="hidden sm:block font-primary text-[13px] font-bold tracking-[0.08em] uppercase transition-colors duration-200 text-accent-orange hover:opacity-70"
            >
              Stage 1
            </Link>
            <button
              onClick={openCart}
              className={`relative transition-colors duration-200 ${
                isTransparent ? "text-white/80 hover:text-white" : "text-black/70 hover:text-black"
              }`}
              aria-label={cart?.totalQuantity ? `Open cart, ${cart.totalQuantity} items` : "Open cart"}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cart && cart.totalQuantity > 0 && (
                <span className="absolute -right-1 -top-1 block h-[7px] w-[7px] rounded-full bg-accent-orange" />
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
