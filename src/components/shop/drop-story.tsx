"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Product, ShopifyImage } from "@/lib/shopify/types";
import { useQuickView } from "./quick-view-provider";
import { useChromeTheme } from "@/components/layout/chrome-theme";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ────────────────────────────────────────────────────────────
 * Stage One — "After Hours"
 * Five pieces, five concepts. One editorial arc on a single
 * light/dark system (toggle). One accent runs through the whole
 * page — the mint from the access terminal — so the invite → drop
 * journey reads as one system; the shirts stay the only real colour.
 * Each piece is one full viewport, snapped: five scrolls, five pieces.
 * House type only: Bebas display + Archivo text.
 * ──────────────────────────────────────────────────────────── */

// The whole page is token-driven (bg-bg / text-ink / bg-accent …) so it follows
// the global light/dark theme; the accent is mint on dark, deep teal on light.

// One shared grid shell — same max-width and responsive gutters on every
// section, so the hero copy, each piece's image and its editorial column all
// line up to the same left/right rails across breakpoints.
const SHELL = "mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16 xl:px-24";

type Story = {
  handle: string; // maps to a Shopify product
  n: string;
  name: string; // the concept — the star of the page
  tag: string;
  headline: string; // poster line, \n = break
  body: string;
};

const STORY_PIECES: Story[] = [
  {
    handle: "impact-ink",
    n: "01",
    name: "IMPACT INK",
    tag: "The loud one",
    headline: "MADE TO\nLEAVE A MARK",
    body: "Oversized type cut like graffiti — black on white, zero apology. The piece that walks into the room a full second before you do.",
  },
  {
    handle: "ear-to-the-street",
    n: "02",
    name: "EAR TO THE STREET",
    tag: "The grounded one",
    headline: "THE CITY HAS\nA HEARTBEAT",
    body: "Waves pulsing out from the centre — the raw frequency of the street. For the ones who stay tuned in, ear to the ground, plugged into where it starts.",
  },
  {
    handle: "not-for-all",
    n: "03",
    name: "NOT FOR ALL",
    tag: "The quiet flex",
    headline: "IF YOU KNOW,\nYOU KNOW",
    body: "Minimal type, maximum meaning. A quiet no to the mainstream — this one only speaks to the people who actually get it. No logo shouting. Just a nod.",
  },
  {
    handle: "success-is-mans-god",
    n: "04",
    name: "SUCCESS IS MAN'S GOD",
    tag: "The manifesto",
    headline: "GREATNESS AS\nA RELIGION",
    body: "Angular type cut against the cosmos. Three stars — ambition, destiny, the grind. Built for the ones reaching past the ceiling and calling it a floor.",
  },
  {
    handle: "saphira",
    n: "05",
    name: "SAPHIRA",
    tag: "The grail",
    headline: "ENTER THE\nDRAGON",
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

/* ---------- reveal helpers ---------- */

function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  onMount = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  onMount?: boolean;
}) {
  const reduce = useReducedMotion();
  const from = reduce ? { opacity: 0 } : { opacity: 0, y };
  const to = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={from}
      {...(onMount
        ? { animate: to }
        : { whileInView: to, viewport: { once: true, amount: 0.2 } })}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Line-by-line rise from behind a clip mask. Detection lives on the UNCLIPPED
// outer span (the inner one starts translated out of an overflow-hidden box, so
// watching it directly deadlocks whileInView — it can never enter view).
function MaskHeading({
  text,
  className,
  onMount = false,
  style,
}: {
  text: string;
  className: string;
  onMount?: boolean;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 90 },
    show: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
  };
  const trigger = onMount
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, amount: 0.4 } };
  return (
    <h2 className={className} style={style}>
      {lines.map((line, i) => (
        <motion.span
          key={i}
          className="block overflow-hidden pb-[0.08em]"
          initial="hidden"
          {...trigger}
        >
          <motion.span
            className="block"
            variants={variants}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.09 }}
          >
            {line}
          </motion.span>
        </motion.span>
      ))}
    </h2>
  );
}

/* ---------- auto-cycling product gallery ---------- */

// Cross-fades through every shot of the piece, advancing on a timer. Honours
// reduced-motion (holds on the first frame) and single-image products.
function AutoGallery({ images, alt }: { images: ShopifyImage[]; alt: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce || images.length <= 1) return;
    const id = setInterval(
      () => setActive((v) => (v + 1) % images.length),
      3500
    );
    return () => clearInterval(id);
  }, [images.length, reduce]);

  return (
    <>
      {images.map((im, idx) => (
        <Image
          key={im.url}
          src={im.url}
          alt={idx === 0 ? alt : `${alt} — view ${idx + 1}`}
          fill
          sizes="(max-width: 768px) 60vw, 32vw"
          priority={idx === 0}
          className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.07] ${
            idx === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

/* ---------- one shoppable piece chapter ---------- */

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
    gallery.length > 0
      ? gallery
      : product.featuredImage
        ? [product.featuredImage]
        : [];

  return (
    <section className="relative flex min-h-svh snap-start snap-always items-center overflow-hidden text-ink">
      <div className={`${SHELL} grid items-center gap-x-8 gap-y-6 py-20 md:grid-cols-2 md:gap-x-14 md:py-0 lg:gap-x-24`}>
        {/* ── product visual — grid column one ── */}
        <Reveal y={30} className="relative flex justify-center md:justify-start">
          <div className="group relative">
            {/* single soft accent glow — blooms gently on hover */}
            <div
              className="dusk-card-glow pointer-events-none absolute -inset-6 bg-accent blur-3xl"
              aria-hidden
            />

            <Link
              href={`/products/${product.handle}`}
              className="dusk-card relative z-10 block aspect-[4/5] h-[40svh] w-auto overflow-hidden rounded-[3px] bg-surface shadow-[0_14px_40px_-28px_rgba(0,0,0,0.5)] ring-1 sm:h-[46svh] md:h-[62svh]"
              aria-label={`View ${story.name}`}
            >
              {images.length > 0 && (
                <AutoGallery images={images} alt={product.title || story.name} />
              )}

              {/* faint diagonal shine that drifts across on hover */}
              <span
                aria-hidden
                className="dusk-shine pointer-events-none absolute inset-0 z-20"
              />
            </Link>
          </div>
        </Reveal>

        {/* ── editorial + commerce ── */}
        <div className="relative">
          <Reveal>
            <p className="flex items-center gap-3 font-primary text-[11px] font-medium tracking-[0.24em] text-ink-muted uppercase">
              <span className="font-street text-[15px] tracking-normal text-ink">
                {story.n} / {String(total).padStart(2, "0")}
              </span>
              <span className="h-px w-6 bg-accent/40" />
              {story.tag}
            </p>
          </Reveal>

          {/* the concept — the piece's real identity on this page; links to PDP */}
          <Link
            href={`/products/${product.handle}`}
            className="group/title inline-block w-fit"
            aria-label={`View ${story.name}`}
          >
            <MaskHeading
              text={story.name}
              className="mt-4 font-street text-[clamp(34px,5vw,72px)] leading-[0.9] tracking-[0.01em] uppercase transition-colors duration-300 group-hover/title:text-accent"
            />
          </Link>

          <Reveal delay={0.08}>
            <p className="mt-3 font-street text-[clamp(15px,1.6vw,20px)] leading-[1.15] tracking-[0.03em] text-ink uppercase">
              {story.headline.replace("\n", " ")}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-4 max-w-md font-primary text-[13px] font-light leading-[1.7] line-clamp-2 text-ink-muted md:text-[15px] md:leading-[1.75] md:line-clamp-none">
              {story.body}
            </p>
          </Reveal>

          {/* commerce row */}
          <Reveal delay={0.2}>
            <div className="mt-6 border-t border-line pt-4">
              <p className="font-primary text-[10px] font-semibold tracking-[0.2em] text-ink-muted uppercase">
                {product.title}
              </p>
              <p className="mt-1 font-street text-[clamp(32px,4vw,50px)] leading-[0.85] tracking-[0.01em] text-ink">
                {formatPrice(price.amount, price.currencyCode)}
              </p>

              <div className="mt-5 flex items-stretch gap-3">
                {/* primary — outline + a very subtle accent glow, no fill */}
                <button
                  onClick={() => openQuickView(product)}
                  className="dusk-cta flex items-center justify-center gap-2.5 rounded-full border px-10 py-3.5 font-primary text-[12px] font-bold tracking-[0.16em] text-ink uppercase"
                >
                  <ShoppingBag size={15} strokeWidth={2} />
                  Add to bag
                </button>
                <Link
                  href={`/products/${product.handle}`}
                  className="dusk-details flex items-center gap-2 rounded-full border border-line px-6 py-3.5 font-primary text-[11px] font-semibold tracking-[0.16em] text-ink-muted uppercase"
                >
                  <ArrowUpRight size={14} strokeWidth={2} />
                  Details
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- the drop ---------- */

export function DropStory({ products }: { products: Product[] }) {
  const { setSnap } = useChromeTheme();

  // Turn on full-viewport section snapping while this page is mounted.
  useEffect(() => {
    setSnap(true);
    return () => setSnap(false);
  }, [setSnap]);

  const byHandle = new Map(products.map((p) => [p.handle, p]));
  const pieces = STORY_PIECES.map((s) => ({
    story: s,
    product: byHandle.get(s.handle),
  })).filter((p): p is { story: Story; product: Product } =>
    Boolean(p.product)
  );

  return (
    <div className="bg-bg transition-colors duration-500">
      {/* ===== HERO (always dark) ===== */}
      <section className="relative flex h-svh w-full snap-start snap-always flex-col justify-end overflow-hidden bg-black">
        <video
          src="/Landscape video.mp4"
          poster="/Streetwear landscape.jpg"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/85" />

        <div className={`${SHELL} relative z-10 pb-8 sm:pb-10`}>
          <Reveal y={14} onMount>
            <p className="font-primary text-[11px] font-medium tracking-[0.28em] text-white/70 uppercase">
              Stage 01 — The First Drop
            </p>
          </Reveal>

          <MaskHeading
            onMount
            text={"After\nHours"}
            className="mt-3 font-street text-[clamp(72px,16vw,200px)] leading-[0.82] tracking-[0.01em] text-white uppercase"
          />

          <Reveal delay={0.2} onMount>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="font-primary text-[13px] font-light tracking-[0.04em] text-white/70">
                Five pieces. Five worlds. One night.
              </p>
              <span className="hidden h-px w-10 bg-white/40 sm:block" />
              <span className="font-primary text-[10px] tracking-[0.28em] text-white/50 uppercase">
                Scroll — the collection ↓
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== THE FIVE PIECES ===== */}
      {pieces.map(({ story, product }) => (
        <PieceChapter
          key={story.handle}
          story={story}
          product={product}
          total={pieces.length}
        />
      ))}
    </div>
  );
}
