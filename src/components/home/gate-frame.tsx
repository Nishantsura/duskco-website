import type { ReactNode } from "react";
import Link from "next/link";

export const HERO_IMAGE = "/Cover%203.png";
export const HERO_VIDEO = "/videos/hero.mp4";
export const HERO_POSTER = "/videos/hero-poster.jpg";

/** Behind the photograph the page is pearl. Lives only while a gate screen is
 *  mounted. */
function GateGround() {
  return <style>{"html,body{background:var(--pearl)}"}</style>;
}

/** The gate photograph, full bleed and untouched. Fills its nearest
 *  positioned parent. See DESIGN.md. */
export function GatePhoto() {
  return (
    <>
      <GateGround />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
    </>
  );
}

/** The gate footage, in place of the photograph: full bleed, silent, looping,
 *  shown exactly as shot. The poster is the first frame, so the still and the
 *  footage are the same picture and nothing jumps when playback starts. */
export function GateVideo() {
  return (
    <>
      <GateGround />
      <video
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
    </>
  );
}

/* ---------- the cut: text that types itself in ---------- */

/** How long one letter's flicker runs (matches .gate-cut in globals.css). */
const CUT_FLICKER = 0.42;

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/** When the last letter of `text` has settled, in seconds. Use it to time
 *  whatever cuts on after. */
export function cutEnd(text: string, start = 0, step = 0.075) {
  return start + text.length * step + CUT_FLICKER;
}

/** Letters cut on in a scattered but fixed order (same on server and client),
 *  each flickering once on hard steps. See DESIGN.md · Motion. */
export function CutText({
  text,
  as: Tag = "h1",
  start = 0,
  step = 0.075,
  className = "gate-title",
}: {
  text: string;
  as?: "h1" | "h2" | "p" | "span";
  start?: number;
  step?: number;
  className?: string;
}) {
  const n = text.length;
  // Stepping by a number coprime with the length visits every index once.
  const scatter = [7, 5, 11, 3, 1].find((k) => gcd(k, n) === 1) ?? 1;
  return (
    <Tag className={className} aria-label={text}>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          " "
        ) : (
          <span
            key={i}
            aria-hidden
            className="gate-cut"
            style={{ "--d": `${start + ((i * scatter) % n) * step}s` } as React.CSSProperties}
          >
            {ch}
          </span>
        ),
      )}
    </Tag>
  );
}

/** Hard-cuts its children on at `at` seconds, in one frame. */
export function CutOn({
  at,
  className = "",
  children,
}: {
  at: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`gate-after ${className}`} style={{ "--d": `${at}s` } as React.CSSProperties}>
      {children}
    </div>
  );
}

/** The only marks on a gate screen: the wordmark top left, one mark top right.
 *
 *  `tone` picks how they sit on what's behind them:
 *  - `invert` (default) is white under difference blending, which reads over a
 *    pale overlay or a photograph that swings light to dark.
 *  - `light` is plain pearl, for the dark footage on the home gate, where
 *    difference blending turns the wordmark a muddy grey against the sky. */
export function GateBar({
  right,
  tone = "invert",
}: {
  right: ReactNode;
  tone?: "invert" | "light";
}) {
  const marks = tone === "light" ? "text-pearl" : "text-white mix-blend-difference";
  return (
    <div className={`absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-6 sm:px-12 sm:pt-10 ${marks}`}>
      <Link
        href="/"
        className="font-logo text-[15px] font-bold uppercase tracking-[0.08em] sm:text-[17px]"
      >
        DUSK&amp;CO
      </Link>
      <div className="text-[11px] tracking-[0.2em] sm:text-[13px]">{right}</div>
    </div>
  );
}
