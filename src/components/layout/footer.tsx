"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChromeTheme } from "./chrome-theme";

const PAGES = [
  { label: "Stage 1", href: "/collections/stage-one" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Returns", href: "/policies/refund" },
  { label: "Privacy", href: "/policies/privacy" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/duskandco" },
  { label: "Snapchat", href: "https://snapchat.com/add/duskandco" },
];

export function Footer() {
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { snap } = useChromeTheme();

  // On the homepage and the access page the content fills the viewport, so
  // the bar floats over it instead of sitting in normal flow.
  const isHome = pathname === "/";
  const floatOverlay = isHome || pathname === "/access";
  // Over the home photograph the marks are white; elsewhere they follow ink.
  const tone = isHome ? "text-white" : "text-ink";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Hidden SEO footer */}
      <footer className="sr-only" aria-label="Site navigation">
        <nav>
          {PAGES.map((p) => (
            <a key={p.href} href={p.href}>{p.label}</a>
          ))}
          {SOCIALS.map((s) => (
            <a key={s.href} href={s.href}>{s.label}</a>
          ))}
          <a href="mailto:help@dusk.co">help@dusk.co</a>
        </nav>
        <p>&copy; {new Date().getFullYear()} Dusk&Co. All rights reserved.</p>
      </footer>

      <div
        className={
          floatOverlay
            ? "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-5"
            : snap
              ? "flex snap-end justify-center border-t border-line py-8"
              : "flex justify-center border-t border-line py-8"
        }
      >
        <div
          ref={barRef}
          className={`relative ${tone} ${floatOverlay ? "pointer-events-auto" : ""}`}
        >
          {/* Pages — a plain list that opens above the bar */}
          {menuOpen && (
            <nav className="absolute bottom-full right-0 mb-3 flex min-w-[160px] flex-col border border-line bg-bg py-2 text-ink">
              {PAGES.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={() => setMenuOpen(false)}
                  className="t-label px-4 py-2 transition-opacity hover:opacity-60"
                >
                  {page.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="t-label flex items-center gap-4 px-5 sm:gap-7">
            <Link href="/" className="font-logo text-[10px] font-bold tracking-[0.08em]">
              DUSK&CO
            </Link>
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 transition-opacity hover:opacity-100"
              >
                {s.label}
              </a>
            ))}
            <a
              href="mailto:help@dusk.co"
              className="hidden opacity-70 transition-opacity hover:opacity-100 sm:inline"
            >
              Email
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Site pages"
              className="t-label opacity-70 transition-opacity hover:opacity-100"
            >
              {menuOpen ? "Close" : "Info"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
