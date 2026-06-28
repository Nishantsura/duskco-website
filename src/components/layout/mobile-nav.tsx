"use client";

import Link from "next/link";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const LINKS = [
  { label: "Shop", href: "/collections/frontpage" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer — full-height, black */}
      <div
        className={`fixed left-0 top-0 z-[70] flex h-full w-full max-w-[400px] flex-col bg-black transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-[60px] items-center justify-between px-8">
          <span className="font-display text-sm font-bold tracking-[0.08em] text-white uppercase">
            DUSK&CO
          </span>
          <button onClick={onClose} aria-label="Close menu" className="text-white/60 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links — large, staggered entry */}
        <nav className={`flex flex-col gap-2 px-8 pt-12 ${open ? "stagger-children" : ""}`}>
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="animate-slide-in-left font-primary text-[clamp(32px,5vw,48px)] font-bold tracking-[-0.02em] text-white uppercase opacity-0 transition-colors hover:text-white/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-8 py-8">
          <Link
            href="https://instagram.com/duskandco"
            className="font-primary text-[12px] font-light tracking-[0.06em] text-white/40 uppercase transition-colors hover:text-white/70"
          >
            Instagram
          </Link>
          <p className="mt-4 font-primary text-[10px] font-light tracking-[0.1em] text-white/25 uppercase">
            Wear the difference.
          </p>
        </div>
      </div>
    </>
  );
}
