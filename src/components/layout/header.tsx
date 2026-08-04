"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Sun, Moon } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { useCart } from "@/components/cart/cart-provider";
import { useNavVisibility, NAVBAR_HEIGHT } from "./nav-visibility";
import { useChromeTheme } from "./chrome-theme";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hidden, scrolled } = useNavVisibility();
  const { theme, toggle } = useChromeTheme();
  const { cart, openCart } = useCart();
  const pathname = usePathname();

  // Routes that open on a dark, full-bleed hero — the nav floats transparent
  // over them (with light marks) until the user scrolls.
  const isHeroRoute =
    pathname === "/" ||
    pathname === "/shop" ||
    pathname.startsWith("/collections/");
  const isTransparent = isHeroRoute && !scrolled;

  // Over the dark hero the marks are white; otherwise they follow the theme ink.
  const mark = isTransparent ? "text-white" : "text-ink";
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${isTransparent ? "bg-transparent" : "bg-bg/95 backdrop-blur-sm"}`}
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
              <span className={`block h-[1.5px] w-[18px] transition-colors ${isTransparent ? "bg-white" : "bg-ink"}`} />
              <span className={`block h-[1.5px] w-[18px] transition-colors ${isTransparent ? "bg-white" : "bg-ink"}`} />
            </button>
          </div>

          {/* Center — Logo */}
          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 font-logo text-lg font-bold tracking-[0.08em] uppercase sm:text-xl transition-colors duration-200 ${mark}`}
          >
            DUSK&CO
          </Link>

          {/* Right — Stage 1 + theme toggle + Cart icon */}
          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/collections/stage-one"
              className="hidden sm:block font-primary text-[13px] font-bold tracking-[0.08em] uppercase transition-colors duration-200 text-accent-orange hover:opacity-70"
            >
              Stage 1
            </Link>
            {/* Light/dark toggle — on every page */}
            <button
              onClick={toggle}
              aria-label={`Switch to ${nextTheme} mode`}
              className={`transition-colors duration-200 ${
                isTransparent ? "text-white/80 hover:text-white" : "text-ink/70 hover:text-ink"
              }`}
            >
              {theme === "dark" ? (
                <Sun size={18} strokeWidth={1.75} />
              ) : (
                <Moon size={18} strokeWidth={1.75} />
              )}
            </button>
            <button
              onClick={openCart}
              className={`relative transition-colors duration-200 ${
                isTransparent ? "text-white/80 hover:text-white" : "text-ink/70 hover:text-ink"
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
