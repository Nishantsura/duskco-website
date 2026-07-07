"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------- reveal helpers ---------- */

function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Big heading that rises line-by-line from behind a clip mask on scroll-in.
function MaskHeading({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");
  return (
    <h2 className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={reduce ? { opacity: 0 } : { y: "110%" }}
            whileInView={reduce ? { opacity: 1 } : { y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.75, ease: EASE, delay: i * 0.1 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

// Slow image reveal — blur + scale settling as it enters view.
function RevealImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative h-full w-full overflow-hidden"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        priority={priority}
      />
    </motion.div>
  );
}

/* ---------- split section (image / video + text) ---------- */

type Media =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster?: string };

function SplitBlock({
  chapter,
  label,
  heading,
  body,
  media,
  reverse,
}: {
  chapter: string;
  label: string;
  heading: string;
  body: string;
  media: Media;
  reverse?: boolean;
}) {
  return (
    <section className="bg-brand-page">
      <div className="mx-auto grid max-w-[1440px] items-stretch gap-y-8 md:grid-cols-2">
        {/* Media */}
        <div
          className={`relative aspect-[4/5] w-full md:aspect-auto md:min-h-[70vh] ${
            reverse ? "md:order-2" : ""
          }`}
        >
          {media.type === "image" ? (
            <RevealImage src={media.src} alt={heading} />
          ) : (
            <video
              src={media.src}
              poster={media.poster}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Text */}
        <div
          className={`flex flex-col justify-center px-6 py-12 sm:px-10 md:px-14 lg:px-20 ${
            reverse ? "md:order-1" : ""
          }`}
        >
          <Reveal>
            <p className="flex items-center gap-3 font-primary text-[11px] font-medium tracking-[0.22em] text-brand-medium-grey uppercase">
              <span className="font-display text-[15px] italic text-accent-orange not-italic">
                {chapter}
              </span>
              {label}
            </p>
          </Reveal>

          <MaskHeading
            text={heading}
            className="mt-5 font-street text-[clamp(40px,6vw,76px)] leading-[0.92] tracking-[0.01em] text-brand-black uppercase"
          />

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md font-primary text-[15px] font-light leading-[1.75] text-black/60">
              {body}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- the drop story ---------- */

const ATTRIBUTES = [
  { value: "12", label: "Pieces in the drop" },
  { value: "LIMITED", label: "Once it's gone, it's gone" },
  { value: "320–420", label: "GSM heavyweight cottons" },
  { value: "UNISEX", label: "Cut for everyone" },
];

export function DropStory() {
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-16 sm:px-10 sm:pb-20">
          <Reveal y={16}>
            <p className="font-primary text-[11px] font-medium tracking-[0.28em] text-white/70 uppercase">
              Stage 01 — The First Drop
            </p>
          </Reveal>

          <MaskHeading
            text={"After\nHours"}
            className="mt-4 font-street text-[clamp(72px,16vw,190px)] leading-[0.85] tracking-[0.01em] text-white uppercase"
          />

          <Reveal delay={0.15}>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="font-primary text-[13px] font-light tracking-[0.04em] text-white/70">
                Made for the hours between dusk and dawn.
              </p>
              <span className="hidden h-px w-10 bg-white/40 sm:block" />
              <span className="font-primary text-[10px] tracking-[0.28em] text-white/50 uppercase">
                Scroll — the story ↓
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== OPENING STATEMENT (full-bleed) ===== */}
      <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden bg-black">
        <Image
          src="/Streetwear landscape.jpg"
          alt="Dusk&Co Stage One"
          fill
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-6 text-center">
          <MaskHeading
            text={"When the city empties,\nyou begin."}
            className="font-street text-[clamp(34px,7vw,96px)] leading-[0.95] tracking-[0.01em] text-white uppercase"
          />
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-lg font-primary text-[13px] font-light tracking-[0.05em] text-white/60">
              Dusk isn&apos;t an ending. It&apos;s the switch — the moment the
              day&apos;s version of you clocks out and the real one steps
              forward.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== CHAPTER 01 — THE CONCEPT ===== */}
      <SplitBlock
        chapter="01"
        label="The Concept"
        heading={"Dusk is a\ntransformation"}
        body="Stage One is built for that hour — for the people who come alive when the light goes down. The skaters, the makers, the ones moving through the city while everyone else winds down. This is clothing for becoming yourself, not performing for anyone else."
        media={{ type: "image", src: "/potrait picture.jpg" }}
      />

      {/* ===== CHAPTER 02 — THE MAKE (video) ===== */}
      <SplitBlock
        chapter="02"
        label="The Make"
        heading={"Built to\noutlast trends"}
        body="Heavyweight cottons, technical blends, hardware meant to survive a decade. We source fabric the way collectors hunt for grails — because the right material is half the design. Oversized, intentional, never accidental."
        media={{
          type: "video",
          src: "/videos/Hero video desktop.mp4",
          poster: "/hero-cover.jpeg",
        }}
        reverse
      />

      {/* ===== STREET QUOTE (full-bleed) ===== */}
      <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-black">
        <Image
          src="/hero-cover.jpeg"
          alt="Born on the street"
          fill
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <MaskHeading
            text={"Every drop starts on the\nstreet, not the sketchpad."}
            className="font-street text-[clamp(30px,5.5vw,80px)] leading-[0.98] tracking-[0.01em] text-white uppercase"
          />
          <Reveal delay={0.2}>
            <p className="mt-6 font-primary text-[11px] tracking-[0.28em] text-white/50 uppercase">
              The Dusk&Co ethos
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== BY THE NUMBERS ===== */}
      <section className="border-y border-black/10 bg-brand-page">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-10 px-6 py-16 sm:px-10 md:grid-cols-4">
          {ATTRIBUTES.map((a, i) => (
            <Reveal
              key={a.label}
              delay={i * 0.08}
              className="text-center md:text-left"
            >
              <p className="font-street text-[clamp(34px,4vw,54px)] leading-none tracking-[0.01em] text-brand-black">
                {a.value}
              </p>
              <p className="mt-2 font-primary text-[11px] font-light tracking-[0.12em] text-brand-medium-grey uppercase">
                {a.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
