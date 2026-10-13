"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import { useQuickView } from "./quick-view-provider";
import { useChromeTheme } from "@/components/layout/chrome-theme";

/* ────────────────────────────────────────────────────────────
 * Stage One · After Hours
 * One hero, then five pieces, one full viewport each (snapped).
 * Monochrome and still: the garments are the only colour, and
 * nothing moves except a quiet second image on hover.
 * ──────────────────────────────────────────────────────────── */

// One shared grid shell so every section lines up on the same rails.
const SHELL = "mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-16";

const HERO_IMAGE = "/Cover%201.png";

type Story = {
  handle: string; // maps to a Shopify product
  n: string;
  name: string;
  body: string;
};

const STORY_PIECES: Story[] = [
  {
    handle: "impact-ink",
    n: "01",
    name: "IMPACT INK",
    body: "Oversized type cut like graffiti. Black on white, zero apology. The piece that walks into the room a full second before you do.",
  },
  {
    handle: "ear-to-the-street",
    n: "02",
    name: "EAR TO THE STREET",
    body: "Waves pulsing out from the centre, the raw frequency of the street. For the ones who stay tuned in, ear to the ground, plugged into where it starts.",
  },
  {
    handle: "not-for-all",
    n: "03",
    name: "NOT FOR ALL",
    body: "Minimal type, maximum meaning. A quiet no to the mainstream. This one only speaks to the people who actually get it. No logo shouting. Just a nod.",
  },
  {
    handle: "success-is-mans-god",
    n: "04",
    name: "SUCCESS IS MAN'S GOD",
    body: "Angular type cut against the cosmos. Three stars: ambition, destiny, the grind. Built for the ones reaching past the ceiling and calling it a floor.",
  },
  {
    handle: "saphira",
    n: "05",
    name: "SAPHIRA",
    body: "Weeks in the sketch. Blue meets pink, fire meets calm. A dragon that looks almost alive, printed in ink that shimmers under light. The limited crown of Stage One.",
  },
];

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

/* ---------- one shoppable piece ---------- */

function PieceChapter({
  story,
  product,
  total,
}: {
  story: Story;
  product: Product;
  total: number;
}) {
  const { open: openQuickView } = useQuickView();
  const price = product.priceRange.minVariantPrice;

  const gallery = product.images?.edges?.map((e) => e.node).filter(Boolean) ?? [];
  const images =
    gallery.length > 0 ? gallery : product.featuredImage ? [product.featuredImage] : [];
  const [first, second] = images;

  return (
    <section className="relative flex min-h-svh snap-start snap-always items-center text-ink">
      <div className={`${SHELL} grid items-center gap-x-16 gap-y-8 py-20 md:grid-cols-2 md:py-0 lg:gap-x-24`}>
        {/* Product image — a second view fades in on hover */}
        <Link
          href={`/products/${product.handle}`}
          className="group relative mx-auto block aspect-[4/5] h-[46svh] max-w-full bg-surface md:mx-0 md:h-[70svh]"
          aria-label={`View ${story.name}`}
        >
          {first && (
            <Image
              src={first.url}
              alt={product.title || story.name}
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-cover"
            />
          )}
          {second && (
            <Image
              src={second.url}
              alt=""
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Copy + commerce */}
        <div className="max-w-md">
          <p className="t-label tabular-nums text-ink-muted">
            {story.n} / {String(total).padStart(2, "0")}
          </p>

          <Link href={`/products/${product.handle}`} className="mt-4 block w-fit hover:opacity-60 transition-opacity">
            <h2 className="t-title uppercase">{story.name}</h2>
          </Link>

          <p className="t-body mt-5 text-ink-muted">{story.body}</p>

          <p className="t-body mt-8">{formatPrice(price.amount, price.currencyCode)}</p>

          <div className="mt-5 flex gap-3">
            <button onClick={() => openQuickView(product)} className="btn btn-primary flex-1 sm:flex-none">
              Add to bag
            </button>
            <Link href={`/products/${product.handle}`} className="btn btn-outline flex-1 sm:flex-none">
              Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- the drop ---------- */

export function DropStory({ products }: { products: Product[] }) {
  const { setSnap } = useChromeTheme();

  // Full-viewport section snapping while this page is mounted.
  useEffect(() => {
    setSnap(true);
    return () => setSnap(false);
  }, [setSnap]);

  const byHandle = new Map(products.map((p) => [p.handle, p]));
  const pieces = STORY_PIECES.map((s) => ({
    story: s,
    product: byHandle.get(s.handle),
  })).filter((p): p is { story: Story; product: Product } => Boolean(p.product));

  return (
    <div className="bg-bg">
      {/* Hero — always over the photograph */}
      <section className="relative flex h-svh w-full snap-start snap-always flex-col justify-end overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        <div className={`${SHELL} animate-fade-in relative z-10 pb-20 text-white sm:pb-24`}>
          <p className="t-label text-white/75">Stage One</p>
          <h1 className="t-display mt-3">After Hours</h1>
          <p className="t-body mt-4 text-white/75">Five pieces. Five worlds. One night.</p>
        </div>
      </section>

      {pieces.map(({ story, product }) => (
        <PieceChapter key={story.handle} story={story} product={product} total={pieces.length} />
      ))}
    </div>
  );
}
