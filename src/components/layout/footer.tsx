"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const PAGES = [
  { label: "Stage 1", href: "/collections/stage-one" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Returns", href: "/policies/refund" },
];

export function Footer() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // On the homepage the hero fills the viewport, so the dock floats over it
  // instead of sitting in normal flow — keeps the landing scroll-free.
  const isHome = pathname === "/";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
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
          <a href="https://instagram.com/duskandco">Instagram</a>
          <a href="https://snapchat.com/add/duskandco">Snapchat</a>
          <a href="mailto:help@dusk.co">help@dusk.co</a>
        </nav>
        <p>&copy; {new Date().getFullYear()} Dusk&Co. All rights reserved.</p>
      </footer>

      {/* Dock footer — in normal flow, except on the homepage where it floats
          over the full-viewport hero so the landing has no scroll. */}
      <div
        className={
          isHome
            ? "fixed inset-x-0 bottom-0 z-40 flex justify-center pb-4 pt-0 pointer-events-none"
            : "flex justify-center py-6 sm:py-10"
        }
      >
        <div ref={dockRef} className={`relative ${isHome ? "pointer-events-auto" : ""}`}>
          {/* Pages menu — expands above the dock */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-black/40 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(20px)]"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Top gloss highlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                <nav className="relative flex flex-col gap-2 min-w-[130px]">
                  {PAGES.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      onClick={() => setMenuOpen(false)}
                      className="font-primary text-[11px] font-medium tracking-[0.04em] text-white/60 transition-colors hover:text-white"
                    >
                      {page.label}
                    </Link>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The dock bar — iOS liquid-glass: translucent, blurred, glossy */}
          <motion.div
            className="relative flex items-center gap-0.5 rounded-full border border-white/15 bg-black/40 px-1.5 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(20px)]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          >
            {/* Gloss — soft top highlight + faint sheen for the glassy feel */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/15 via-white/[0.03] to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
            {/* Logo */}
            <Link
              href="/"
              className="relative flex h-7 items-center justify-center rounded-full bg-white/10 px-3 transition-all hover:bg-white/20"
            >
              <span className="font-display text-[8px] font-bold tracking-[0.08em] text-white uppercase">
                Dusk&Co
              </span>
            </Link>

            {/* Separator */}
            <div className="mx-0.5 h-4 w-px bg-white/10" />

            {/* Instagram */}
            <a
              href="https://instagram.com/duskandco"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-all hover:text-white hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>

            {/* Snapchat */}
            <a
              href="https://snapchat.com/add/duskandco"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Snapchat"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-all hover:text-white hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.206 1c1.734 0 3.238.683 4.476 2.03 1.046 1.14 1.58 2.502 1.636 4.166l.004.196c0 .425-.02.843-.063 1.246l-.035.297.075.04c.342.19.654.34.932.44l.12.04c.258.077.414.125.524.19a.87.87 0 0 1 .438.757c0 .36-.244.655-.73.888-.297.14-.646.252-1.042.336l-.174.034-.157.038c-.137.04-.222.07-.275.098-.135.075-.2.173-.25.375l-.02.1c-.02.145-.02.276.003.41.18.76.502 1.478.964 2.147.558.81 1.2 1.416 1.928 1.826l.15.082c.236.12.47.206.756.265a.472.472 0 0 1 .378.458c0 .3-.2.56-.597.774-.472.256-1.075.42-1.795.492-.12.014-.2.07-.25.15-.055.09-.08.183-.12.35l-.03.107a.622.622 0 0 1-.61.468c-.2 0-.417-.04-.68-.098a5.266 5.266 0 0 0-1.093-.134c-.287 0-.57.03-.85.086-.366.077-.696.236-1.077.52-.643.48-1.225.85-1.746 1.115-.606.31-1.2.467-1.77.467h-.08c-.57 0-1.164-.157-1.77-.467a8.458 8.458 0 0 1-1.746-1.115c-.38-.284-.71-.443-1.078-.52a4.32 4.32 0 0 0-.848-.086c-.39 0-.757.05-1.094.134-.262.06-.48.098-.68.098a.622.622 0 0 1-.61-.468l-.028-.107c-.042-.167-.066-.26-.12-.35-.053-.08-.132-.136-.252-.15-.72-.073-1.323-.236-1.795-.492-.397-.215-.597-.474-.597-.774a.472.472 0 0 1 .378-.458c.287-.06.52-.146.757-.265l.15-.082c.727-.41 1.37-1.017 1.927-1.826.462-.67.784-1.387.964-2.148.024-.133.024-.264.004-.41l-.02-.1c-.05-.2-.116-.3-.25-.374-.054-.03-.14-.06-.276-.1l-.157-.037-.174-.034c-.396-.084-.745-.196-1.042-.336-.486-.233-.73-.528-.73-.888a.87.87 0 0 1 .438-.758c.11-.064.266-.112.524-.19l.12-.04c.278-.098.59-.248.932-.44l.075-.04-.035-.296a14.48 14.48 0 0 1-.063-1.247l.004-.196c.057-1.664.59-3.026 1.636-4.166C8.968 1.683 10.472 1 12.206 1z" />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:help@dusk.co"
              aria-label="Send email"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-all hover:text-white hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            </a>

            {/* Separator */}
            <div className="mx-0.5 h-4 w-px bg-white/10" />

            {/* Menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Site pages"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-all hover:text-white hover:bg-white/10"
            >
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ rotate: menuOpen ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </motion.svg>
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
