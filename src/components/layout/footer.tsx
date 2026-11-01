"use client";

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

// What the visible bar links to, in reading order.
const BAR_LINKS = [
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Returns", href: "/policies/refund" },
  { label: "Privacy", href: "/policies/privacy" },
  { label: "Help", href: "/contact" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/duskandco" },
  { label: "Snapchat", href: "https://snapchat.com/add/duskandco" },
];

const INSTAGRAM = SOCIALS[0].href;

// The Instagram glyph, drawn at the weight of the header icons.
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const pathname = usePathname();
  const { snap } = useChromeTheme();

  // The gate (home and access) shows no visible bar and no socials.
  const isGate = pathname === "/" || pathname === "/access";

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

      {!isGate && (
      <div
        className={
          snap
            ? "flex snap-end justify-center border-t border-line py-8"
            : "flex justify-center border-t border-line py-8"
        }
      >
        {/* Phones: the links on one line, the logo and Instagram under them.
            From md: one line, logo first. */}
        <div className="t-label flex flex-col items-center gap-5 px-5 font-mono text-ink md:flex-row md:gap-8">
          <nav aria-label="Help and policies" className="flex items-center gap-5 md:order-2 md:gap-8">
            {BAR_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="opacity-70 transition-opacity hover:opacity-100">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-6 md:contents">
            <Link href="/" className="font-logo text-[10px] font-bold tracking-[0.08em] md:order-1">
              DUSK&CO
            </Link>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="opacity-70 transition-opacity hover:opacity-100 md:order-3"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
