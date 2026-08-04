"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Product, ShopifyImage } from "@/lib/shopify/types";
import { useQuickView } from "./quick-view-provider";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ────────────────────────────────────────────────────────────
 * Stage One — "After Hours"
 * Five pieces, five concepts. One editorial arc, now on a single
 * light/dark system (toggle) so the shirts — shot on transparent
 * ground — are the only colour on the page. Each piece keeps a
 * restrained accent as its signature pop. House type only:
 * Bebas display + Archivo text.
 * Every chapter is shoppable: real product title, price, add-to-bag.
 * ──────────────────────────────────────────────────────────── */

type Theme = "dark" | "light";

type ThemeTokens = {
  bg: string;
  ink: string;
  sub: string;
  panel: string; // product-frame backdrop
  border: string;
  ctaText: string; // text sitting on an accent-filled button
  stroke: string; // ghost-index outline
};

const THEMES: Record<Theme, ThemeTokens> = {
  dark: {
    bg: "#0B0B0C",
    ink: "#F5F4F2",
    sub: "rgba(245,244,242,0.55)",
    panel: "#151517",
    border: "rgba(255,255,255,0.12)",
    ctaText: "#0A0A0A",
    stroke: "rgba(255,255,255,0.14)",
  },
  light: {
    bg: "#F5F4F2",
    ink: "#0A0A0A",
    sub: "rgba(10,10,10,0.55)",
    panel: "#ECEAE6",
    border: "rgba(0,0,0,0.10)",
    ctaText: "#F5F4F2",
    stroke: "rgba(0,0,0,0.10)",
  },
};

type Story = {
  handle: string; // maps to a Shopify product
  n: string;
  name: string; // the concept — the star of the page
  tag: string;
  headline: string; // poster line, \n = break
  body: string;
  accent: string; // restrained colour signature
  gradient?: string; // finale only
};

const STORY_PIECES: Story[] = [
  {
    handle: "impact-ink",
    n: "01",
    name: "IMPACT INK",
    tag: "The loud one",
    headline: "MADE TO\nLEAVE A MARK",
    body: "Oversized type cut like graffiti — black on white, zero apology. The piece that walks into the room a full second before you do.",
    accent: "#FF4500",
  },
  {
    handle: "ear-to-the-street",
    n: "02",
    name: "EAR TO THE STREET",
    tag: "The grounded one",
    headline: "THE CITY HAS\nA HEARTBEAT",
    body: "Waves pulsing out from the centre — the raw frequency of the street. For the ones who stay tuned in, ear to the ground, plugged into where it starts.",
    accent: "#7C3AED",
  },
  {
    handle: "not-for-all",
    n: "03",
    name: "NOT FOR ALL",
    tag: "The quiet flex",
    headline: "IF YOU KNOW,\nYOU KNOW",
    body: "Minimal type, maximum meaning. A quiet no to the mainstream — this one only speaks to the people who actually get it. No logo shouting. Just a nod.",
    accent: "#8A7A55",
  },
  {
    handle: "success-is-mans-god",
    n: "04",
    name: "SUCCESS IS MAN'S GOD",
    tag: "The manifesto",
    headline: "GREATNESS AS\nA RELIGION",
    body: "Angular type cut against the cosmos. Three stars — ambition, destiny, the grind. Built for the ones reaching past the ceiling and calling it a floor.",
    accent: "#7FA8FF",
  },
  {
    handle: "saphira",
    n: "05",
    name: "SAPHIRA",
    tag: "The grail",
    headline: "ENTER THE\nDRAGON",
    body: "Weeks in the sketch. Blue meets pink, fire meets calm. A dragon that looks almost alive, printed in ink that shimmers under light. The limited crown of Stage One.",
    accent: "#F472B6",
    gradient: "linear-gradient(120deg, #3B82F6 0%, #A855F7 52%, #F472B6 100%)",
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
function AutoGallery({
  images,
  alt,
  accent,
}: {
  images: ShopifyImage[];
  alt: string;
  accent: string;
}) {
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
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={idx === 0}
          className={`object-cover transition-opacity duration-700 ease-out group-hover:scale-[1.04] ${
            idx === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* progress dots — decorative, mirror the auto-advance */}
      {images.length > 1 && (
        <div
          className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
          aria-hidden
        >
          {images.map((im, idx) => (
            <span
              key={im.url}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: idx === active ? 18 : 6,
                background:
                  idx === active ? accent : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- one shoppable piece chapter ---------- */

function PieceChapter({
  story,
  product,
  index,
  total,
  t,
}: {
  story: Story;
  product: Product;
  index: number;
  total: number;
  t: ThemeTokens;
}) {
  const { open: openQuickView } = useQuickView();
  const reverse = index % 2 === 1;
  const price = product.priceRange.minVariantPrice;
  const signature = story.gradient ?? story.accent;

  const gallery = (
    product.images?.edges?.map((e) => e.node).filter(Boolean) ?? []
  );
  const images =
    gallery.length > 0
      ? gallery
      : product.featuredImage
        ? [product.featuredImage]
        : [];

  return (
    <section className="relative overflow-hidden" style={{ color: t.ink }}>
      <div className="mx-auto grid max-w-[1600px] items-center gap-x-8 gap-y-12 px-6 py-24 sm:px-10 sm:py-32 md:grid-cols-2 lg:gap-x-20 lg:py-40">
        {/* ── product visual ── */}
        <Reveal y={40} className={`relative ${reverse ? "md:order-2" : ""}`}>
          {/* soft accent glow */}
          <div
            className="pointer-events-none absolute -inset-6 opacity-40 blur-3xl sm:-inset-10"
            style={{ background: signature, opacity: 0.22 }}
            aria-hidden
          />
          {/* huge ghost index behind the frame */}
          <span
            className="pointer-events-none absolute -top-10 -left-2 z-0 font-street leading-none select-none sm:-top-16"
            style={{
              fontSize: "clamp(90px,14vw,180px)",
              color: "transparent",
              WebkitTextStroke: `1.4px ${t.stroke}`,
            }}
            aria-hidden
          >
            {story.n}
          </span>

          <Link
            href={`/products/${product.handle}`}
            className="group relative z-10 block aspect-[4/5] w-full overflow-hidden rounded-[3px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] ring-1"
            style={
              {
                background: t.panel,
                "--tw-ring-color": `${story.accent}33`,
              } as React.CSSProperties
            }
            aria-label={`View ${story.name}`}
          >
            {images.length > 0 && (
              <AutoGallery
                images={images}
                alt={product.title || story.name}
                accent={story.accent}
              />
            )}
          </Link>
        </Reveal>

        {/* ── editorial + commerce ── */}
        <div className={`relative ${reverse ? "md:order-1" : ""}`}>
          <Reveal>
            <p
              className="flex items-center gap-3 font-primary text-[11px] font-medium tracking-[0.24em] uppercase"
              style={{ color: t.sub }}
            >
              <span
                className="font-street text-[15px] tracking-normal"
                style={{ color: story.accent }}
              >
                {index + 1} of {total}
              </span>
              <span
                className="h-px w-6"
                style={{ background: `${story.accent}66` }}
              />
              {story.tag}
            </p>
          </Reveal>

          {/* the concept — the piece's real identity on this page */}
          <MaskHeading
            text={story.name}
            className="mt-5 font-street text-[clamp(40px,5.5vw,82px)] leading-[0.9] tracking-[0.01em] uppercase"
          />

          <Reveal delay={0.08}>
            <p
              className="mt-4 font-street text-[clamp(17px,1.7vw,22px)] leading-[1.15] tracking-[0.03em] uppercase"
              style={{ color: t.ink }}
            >
              {story.headline.replace("\n", " ")}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <p
              className="mt-6 max-w-md font-primary text-[15px] font-light leading-[1.75]"
              style={{ color: t.sub }}
            >
              {story.body}
            </p>
          </Reveal>

          {/* commerce row */}
          <Reveal delay={0.2}>
            <div
              className="mt-9 border-t pt-6"
              style={{ borderColor: t.border }}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p
                    className="font-primary text-[10px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: t.sub }}
                  >
                    {product.title}
                  </p>
                  <p
                    className="mt-1 font-street text-[clamp(38px,4.4vw,56px)] leading-[0.85] tracking-[0.01em]"
                    style={{ color: t.ink }}
                  >
                    {formatPrice(price.amount, price.currencyCode)}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 font-primary text-[9px] font-bold tracking-[0.18em] uppercase"
                  style={{
                    background: `${story.accent}1f`,
                    color: story.accent,
                  }}
                >
                  ★ 1 of {total} · Limited
                </span>
              </div>

              <div className="mt-5 flex items-stretch gap-3">
                <button
                  onClick={() => openQuickView(product)}
                  className="group relative flex-1 overflow-hidden rounded-full px-8 py-4 font-primary text-[13px] font-bold tracking-[0.16em] uppercase transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: signature, color: t.ctaText }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Add to bag
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      ↗
                    </span>
                  </span>
                </button>
                <Link
                  href={`/products/${product.handle}`}
                  className="flex items-center rounded-full border px-6 font-primary text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200"
                  style={{ borderColor: t.border, color: t.sub }}
                >
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

/* ---------- theme toggle ---------- */

function ThemeToggle({
  theme,
  onToggle,
  t,
}: {
  theme: Theme;
  onToggle: () => void;
  t: ThemeTokens;
}) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${next} mode`}
      className="fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full border px-4 py-2.5 font-primary text-[11px] font-semibold tracking-[0.16em] uppercase backdrop-blur-xl transition-transform duration-200 hover:scale-[1.04] active:scale-95 sm:right-8 sm:bottom-8"
      style={{
        borderColor: t.border,
        color: t.ink,
        background:
          theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      }}
    >
      {theme === "dark" ? (
        <Sun size={15} strokeWidth={2} />
      ) : (
        <Moon size={15} strokeWidth={2} />
      )}
      {next}
    </button>
  );
}

/* ---------- spec strip ---------- */

const SPECS = [
  { value: "05", label: "Signature pieces" },
  { value: "LIMITED", label: "Once it's gone, it's gone" },
  { value: "320–420", label: "GSM heavyweight cotton" },
  { value: "UNISEX", label: "Cut for everyone" },
];

/* ---------- the drop ---------- */

export function DropStory({ products }: { products: Product[] }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const t = THEMES[theme];

  const byHandle = new Map(products.map((p) => [p.handle, p]));
  const pieces = STORY_PIECES.map((s) => ({
    story: s,
    product: byHandle.get(s.handle),
  })).filter((p): p is { story: Story; product: Product } =>
    Boolean(p.product)
  );

  return (
    <div style={{ background: t.bg }} className="transition-colors duration-500">
      <ThemeToggle
        theme={theme}
        onToggle={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
        t={t}
      />

      {/* ===== HERO (always dark) ===== */}
      <section className="relative flex h-svh w-full flex-col justify-end overflow-hidden bg-black">
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

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pb-8 sm:px-10 sm:pb-10">
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
      {pieces.map(({ story, product }, i) => (
        <PieceChapter
          key={story.handle}
          story={story}
          product={product}
          index={i}
          total={pieces.length}
          t={t}
        />
      ))}

      {/* ===== SPEC STRIP ===== */}
      <section className="border-y" style={{ borderColor: t.border }}>
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-y-10 px-6 py-16 sm:px-10 md:grid-cols-4">
          {SPECS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center md:text-left">
              <p
                className="font-street text-[clamp(34px,4vw,54px)] leading-none tracking-[0.01em]"
                style={{ color: t.ink }}
              >
                {s.value}
              </p>
              <p
                className="mt-2 font-primary text-[11px] font-light tracking-[0.12em] uppercase"
                style={{ color: t.sub }}
              >
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
