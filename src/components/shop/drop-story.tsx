"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Product } from "@/lib/shopify/types";
import { useQuickView } from "./quick-view-provider";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ────────────────────────────────────────────────────────────
 * Stage One — "After Hours"
 * Five pieces, five concepts. A luxury editorial arc that descends
 * from bright gallery light into after-hours dark. Each concept is
 * its own world (colour + attitude) but sits on the house design
 * language — Bebas display, Archivo text, hairline detail, restraint.
 * Every chapter is shoppable: real product title, price, add-to-bag.
 * ──────────────────────────────────────────────────────────── */

type Story = {
  handle: string; // maps to a Shopify product
  n: string;
  name: string; // the concept — the star of the page
  tag: string;
  headline: string; // poster line, \n = break
  body: string;
  words: string[]; // marquee keywords
  tone: "light" | "dark";
  bg: string;
  ink: string;
  sub: string;
  accent: string; // restrained colour signature
  panel: string; // product-panel backdrop
  gradient?: string; // finale only
  mono?: boolean; // grayscale product image
};

const STORY_PIECES: Story[] = [
  {
    handle: "impact-ink",
    n: "01",
    name: "IMPACT INK",
    tag: "The loud one",
    headline: "MADE TO\nLEAVE A MARK",
    body: "Oversized type cut like graffiti — black on white, zero apology. The piece that walks into the room a full second before you do.",
    words: ["LOUD", "UNAPOLOGETIC", "SEEN", "IMPACT INK"],
    tone: "light",
    bg: "#F5F4F2",
    ink: "#0A0A0A",
    sub: "rgba(10,10,10,0.55)",
    accent: "#FF4500",
    panel: "#0A0A0A",
    mono: true,
  },
  {
    handle: "ear-to-the-street",
    n: "02",
    name: "EAR TO THE STREET",
    tag: "The grounded one",
    headline: "THE CITY HAS\nA HEARTBEAT",
    body: "Waves pulsing out from the centre — the raw frequency of the street. For the ones who stay tuned in, ear to the ground, plugged into where it starts.",
    words: ["RHYTHM", "FREQUENCY", "TUNED IN", "PULSE"],
    tone: "light",
    bg: "#F1EFFA",
    ink: "#1A1230",
    sub: "rgba(26,18,48,0.55)",
    accent: "#7C3AED",
    panel: "#241548",
  },
  {
    handle: "not-for-all",
    n: "03",
    name: "NOT FOR ALL",
    tag: "The quiet flex",
    headline: "IF YOU KNOW,\nYOU KNOW",
    body: "Minimal type, maximum meaning. A quiet no to the mainstream — this one only speaks to the people who actually get it. No logo shouting. Just a nod.",
    words: ["IYKYK", "SELECT FEW", "NO NOISE", "NOT FOR ALL"],
    tone: "light",
    bg: "#E9E4DA",
    ink: "#211C15",
    sub: "rgba(33,28,21,0.5)",
    accent: "#8A7A55",
    panel: "#CFC6B4",
  },
  {
    handle: "success-is-mans-god",
    n: "04",
    name: "SUCCESS IS MAN'S GOD",
    tag: "The manifesto",
    headline: "GREATNESS AS\nA RELIGION",
    body: "Angular type cut against the cosmos. Three stars — ambition, destiny, the grind. Built for the ones reaching past the ceiling and calling it a floor.",
    words: ["AMBITION", "DESTINY", "★ ★ ★", "GREATNESS"],
    tone: "dark",
    bg: "#080C1C",
    ink: "#EAF1FF",
    sub: "rgba(234,241,255,0.58)",
    accent: "#7FA8FF",
    panel: "#0E1531",
  },
  {
    handle: "saphira",
    n: "05",
    name: "SAPHIRA",
    tag: "The grail",
    headline: "ENTER THE\nDRAGON",
    body: "Weeks in the sketch. Blue meets pink, fire meets calm. A dragon that looks almost alive, printed in ink that shimmers under light. The limited crown of Stage One.",
    words: ["MYTH", "BALANCE", "LIMITED", "SAPHIRA"],
    tone: "dark",
    bg: "#140617",
    ink: "#FFE9F4",
    sub: "rgba(255,233,244,0.6)",
    accent: "#F472B6",
    panel: "#2A0E2F",
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

/* ---------- one shoppable piece chapter ---------- */

function PieceChapter({
  story,
  product,
  index,
}: {
  story: Story;
  product: Product;
  index: number;
}) {
  const { open: openQuickView } = useQuickView();
  const reverse = index % 2 === 1;
  const dark = story.tone === "dark";
  const price = product.priceRange.minVariantPrice;
  const img = product.featuredImage;
  const signature = story.gradient ?? story.accent;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: story.bg, color: story.ink }}
    >
      <div className="mx-auto grid max-w-[1600px] items-center gap-x-8 gap-y-12 px-6 py-24 sm:px-10 sm:py-32 md:grid-cols-2 lg:gap-x-20 lg:py-40">
        {/* ── product visual ── */}
        <Reveal
          y={40}
          className={`relative ${reverse ? "md:order-2" : ""}`}
        >
          {/* soft accent glow */}
          <div
            className="pointer-events-none absolute -inset-6 opacity-40 blur-3xl sm:-inset-10"
            style={{ background: signature, opacity: dark ? 0.28 : 0.16 }}
            aria-hidden
          />
          {/* huge ghost index behind the frame */}
          <span
            className="pointer-events-none absolute -top-10 -left-2 z-0 font-street leading-none select-none sm:-top-16"
            style={{
              fontSize: "clamp(90px,14vw,180px)",
              color: "transparent",
              WebkitTextStroke: `1.4px ${dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)"}`,
            }}
            aria-hidden
          >
            {story.n}
          </span>

          <Link
            href={`/products/${product.handle}`}
            className="group relative z-10 block aspect-[4/5] w-full overflow-hidden rounded-[3px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] ring-1"
            style={{ background: story.panel, "--tw-ring-color": `${story.accent}33` } as React.CSSProperties}
          >
            {img ? (
              <Image
                src={img.url}
                alt={img.altText || story.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04] ${
                  story.mono ? "grayscale contrast-[1.1]" : ""
                }`}
              />
            ) : null}
            {/* hover cue */}
            <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3.5 py-1.5 font-primary text-[10px] font-medium tracking-[0.18em] text-white uppercase opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
              View the piece →
            </span>
          </Link>
        </Reveal>

        {/* ── editorial + commerce ── */}
        <div className={`relative ${reverse ? "md:order-1" : ""}`}>
          <Reveal>
            <p className="flex items-center gap-3 font-primary text-[11px] font-medium tracking-[0.24em] uppercase" style={{ color: story.sub }}>
              <span className="font-street text-[15px] tracking-normal" style={{ color: story.accent }}>
                {story.n} / 05
              </span>
              <span className="h-px w-6" style={{ background: `${story.accent}66` }} />
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
              className="mt-4 font-display text-[clamp(15px,1.5vw,19px)] leading-[1.4] tracking-[0.01em]"
              style={{ color: story.ink }}
            >
              {story.headline.replace("\n", " ")}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-6 max-w-md font-primary text-[15px] font-light leading-[1.75]" style={{ color: story.sub }}>
              {story.body}
            </p>
          </Reveal>

          {/* commerce row */}
          <Reveal delay={0.2}>
            <div
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-6"
              style={{ borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }}
            >
              <div>
                <p className="font-primary text-[10px] font-medium tracking-[0.18em] uppercase" style={{ color: story.sub }}>
                  {product.title}
                </p>
                <p className="mt-1 font-street text-[26px] leading-none tracking-[0.02em]" style={{ color: story.ink }}>
                  {formatPrice(price.amount, price.currencyCode)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openQuickView(product)}
                  className="rounded-full px-7 py-3.5 font-primary text-[11px] font-semibold tracking-[0.18em] uppercase transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                  style={{
                    background: signature,
                    color: dark ? "#0A0A0A" : "#F5F4F2",
                  }}
                >
                  Add to bag
                </button>
                <Link
                  href={`/products/${product.handle}`}
                  className="font-primary text-[11px] font-medium tracking-[0.16em] uppercase underline-offset-4 hover:underline"
                  style={{ color: story.sub }}
                >
                  Details →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
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
  const byHandle = new Map(products.map((p) => [p.handle, p]));
  const pieces = STORY_PIECES.map((s) => ({ story: s, product: byHandle.get(s.handle) }))
    .filter((p): p is { story: Story; product: Product } => Boolean(p.product));

  return (
    <>
      {/* ===== HERO ===== */}
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
        <PieceChapter key={story.handle} story={story} product={product} index={i} />
      ))}

      {/* ===== SPEC STRIP ===== */}
      <section className="border-y border-black/10 bg-brand-page">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-y-10 px-6 py-16 sm:px-10 md:grid-cols-4">
          {SPECS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center md:text-left">
              <p className="font-street text-[clamp(34px,4vw,54px)] leading-none tracking-[0.01em] text-brand-black">
                {s.value}
              </p>
              <p className="mt-2 font-primary text-[11px] font-light tracking-[0.12em] text-brand-medium-grey uppercase">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
