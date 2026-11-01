"use client";

import Link from "next/link";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const LINKS = [
  { label: "Stage 1", href: "/collections/stage-one" },
  { label: "Contact", href: "/contact" },
];

const SECONDARY = [
  { label: "Instagram", href: "https://instagram.com/duskandco", external: true },
  { label: "Snapchat", href: "https://snapchat.com/add/duskandco", external: true },
  { label: "help@dusk.co", href: "mailto:help@dusk.co", external: false },
  { label: "Shipping", href: "/policies/shipping", external: false },
  { label: "Returns", href: "/policies/refund", external: false },
  { label: "Privacy", href: "/policies/privacy", external: false },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-[70] flex h-full w-full max-w-[380px] flex-col bg-bg text-ink transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-[44px] items-center justify-between px-5 sm:px-8">
          <span className="font-logo text-[13px] font-bold tracking-[0.08em] uppercase">
            DUSK&CO
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="t-label transition-opacity hover:opacity-60"
          >
            Close
          </button>
        </div>

        <nav className="flex flex-col gap-4 px-5 pt-16 sm:px-8">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="t-title w-fit transition-opacity hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2.5 px-5 py-8 sm:px-8">
          {SECONDARY.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="t-label w-fit text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
