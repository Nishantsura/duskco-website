"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { StoryStage } from "@/lib/shopify/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------- reveal helpers (shared cinematic language with DropStory) ---------- */

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
function MaskHeading({ text, className }: { text: string; className: string }) {
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

function StageMedia({
  media,
  priority,
  className = "object-cover",
}: {
  media: StoryStage["media"];
  priority?: boolean;
  className?: string;
}) {
  if (!media) return null;
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        autoPlay
        muted
        loop
        playsInline
        className={`h-full w-full ${className}`}
      />
    );
  }
  return (
    <Image
      src={media.url}
      alt={media.alt || ""}
      fill
      sizes="100vw"
      className={className}
      priority={priority}
    />
  );
}

function Kicker({ stageNumber, label }: { stageNumber: string; label: string }) {
  return (
    <p className="flex items-center gap-3 font-primary text-[11px] font-medium tracking-[0.24em] uppercase">
      {stageNumber && (
        <span className="font-display text-[15px] not-italic text-accent-orange">
          {stageNumber}
        </span>
      )}
      {label}
    </p>
  );
}

/* ---------- stage layouts ---------- */

// First stage — full-screen opener over media.
function StageHero({ stage }: { stage: StoryStage }) {
  return (
    <section className="relative flex h-svh w-full flex-col justify-end overflow-hidden bg-black">
      <div className="absolute inset-0">
        <StageMedia media={stage.media} priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-16 sm:px-10 sm:pb-20">
        <Reveal y={16}>
          <div className="text-white/70">
            <Kicker stageNumber={stage.stageNumber} label={stage.label} />
          </div>
        </Reveal>

        <MaskHeading
          text={stage.headline}
          className="mt-4 font-street text-[clamp(72px,16vw,190px)] leading-[0.85] tracking-[0.01em] text-white uppercase"
        />

        {stage.body && (
          <Reveal delay={0.15}>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="max-w-md font-primary text-[13px] font-light leading-[1.7] tracking-[0.02em] text-white/70">
                {stage.body}
              </p>
              <span className="hidden h-px w-10 bg-white/40 sm:block" />
              <span className="font-primary text-[10px] tracking-[0.28em] text-white/50 uppercase">
                Scroll — the story ↓
              </span>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

// Full-bleed centered statement over media.
function StageStatement({ stage }: { stage: StoryStage }) {
  return (
    <section className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0">
        <StageMedia media={stage.media} className="object-cover opacity-60" />
      </div>
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {(stage.stageNumber || stage.label) && (
          <Reveal y={14}>
            <div className="mb-5 flex justify-center text-white/60">
              <Kicker stageNumber={stage.stageNumber} label={stage.label} />
            </div>
          </Reveal>
        )}
        <MaskHeading
          text={stage.headline}
          className="font-street text-[clamp(34px,7vw,96px)] leading-[0.95] tracking-[0.01em] text-white uppercase"
        />
        {stage.body && (
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-lg font-primary text-[13px] font-light leading-[1.7] tracking-[0.04em] text-white/65">
              {stage.body}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

// Media beside text, alternating sides.
function StageSplit({ stage, reverse }: { stage: StoryStage; reverse?: boolean }) {
  return (
    <section className="bg-bg">
      <div className="mx-auto grid max-w-[1440px] items-stretch gap-y-8 md:grid-cols-2">
        <div
          className={`relative aspect-[4/5] w-full overflow-hidden md:aspect-auto md:min-h-[78vh] ${
            reverse ? "md:order-2" : ""
          }`}
        >
          <StageMedia media={stage.media} />
        </div>

        <div
          className={`flex flex-col justify-center px-6 py-14 sm:px-10 md:px-14 lg:px-20 ${
            reverse ? "md:order-1" : ""
          }`}
        >
          <Reveal>
            <div className="text-ink-muted">
              <Kicker stageNumber={stage.stageNumber} label={stage.label} />
            </div>
          </Reveal>

          <MaskHeading
            text={stage.headline}
            className="mt-5 font-street text-[clamp(40px,6vw,76px)] leading-[0.92] tracking-[0.01em] text-ink uppercase"
          />

          {stage.body && (
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md font-primary text-[15px] font-light leading-[1.75] text-ink-muted">
                {stage.body}
              </p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- the collection story ---------- */

export function CollectionStory({ stages }: { stages: StoryStage[] }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div>
      {stages.map((stage, i) => {
        if (i === 0) return <StageHero key={i} stage={stage} />;
        if (stage.layout === "split" && stage.media) {
          return <StageSplit key={i} stage={stage} reverse={i % 2 === 0} />;
        }
        return <StageStatement key={i} stage={stage} />;
      })}
    </div>
  );
}
