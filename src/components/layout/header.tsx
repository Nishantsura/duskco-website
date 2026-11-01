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

  // Routes that open on a full-bleed image — the nav floats transparent over
  // them until the user scrolls. Its marks are white under difference
  // blending, so they invert against light and dark photographs alike.
  const isHeroRoute =
    pathname === "/shop" ||
    pathname.startsWith("/collections/");
  const isTransparent = isHeroRoute && !scrolled;

  const mark = isTransparent ? "text-white" : "text-ink";
  const nextTheme = theme === "dark" ? "light" : "dark";
  const count = cart?.totalQuantity ?? 0;

  // The gate (home and access) draws its own bare top line, no nav.
  if (pathname === "/" || pathname === "/access") return null;

  return (
    <>
      {/* Only the slide animates. The transparent/solid swap is instant: the
          blend mode and mark colour can't fade, so fading the background
          under them flashes an inverted band. Keyboard focus brings a hidden
          bar back. */}
      <header
        className={`fixed top-0 z-50 w-full border-b transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] focus-within:translate-y-0 motion-reduce:transition-none ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${isTransparent ? "border-transparent bg-transparent mix-blend-difference" : "border-line bg-bg"}`}
      >
        <div
          className={`mx-auto flex max-w-[90rem] items-center justify-between px-5 font-mono sm:px-10 ${mark}`}
          style={{ height: NAVBAR_HEIGHT }}
        >
          {/* Left — menu */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-8 flex-col justify-center gap-[5px]"
          >
            <span className="block h-px w-[18px] bg-current" />
            <span className="block h-px w-[18px] bg-current" />
          </button>

          {/* Center — wordmark */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-logo text-[15px] font-bold tracking-[0.08em] uppercase sm:text-[17px]"
          >
            DUSK&CO
          </Link>

          {/* Right — Stage 1, theme, bag */}
          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/collections/stage-one"
              className="t-label hidden transition-opacity hover:opacity-60 sm:block"
            >
              Stage 1
            </Link>
            <button
              onClick={toggle}
              aria-label={`Switch to ${nextTheme} mode`}
              className="transition-opacity hover:opacity-60"
            >
              {theme === "dark" ? (
                <Sun size={16} strokeWidth={1.25} />
              ) : (
                <Moon size={16} strokeWidth={1.25} />
              )}
            </button>
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
              aria-label={count ? `Open bag, ${count} items` : "Open bag"}
            >
              <ShoppingBag size={17} strokeWidth={1.25} />
              {count > 0 && <span className="t-label tabular-nums">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
