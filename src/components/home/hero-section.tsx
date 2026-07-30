"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { WaitlistModal } from "./waitlist-modal";

const AUTOPLAY_MS = 7000;

// Editorial line-by-line "mask rise" for the hero heading — plays once on load.
// `settled` flips true shortly after mount so later slide changes swap text
// instantly instead of re-hiding the heading.
const HEAD_CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const HEAD_LINE: Variants = {
  hidden: { y: "115%" },
  visible: { y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

function HeroHeading({
  text,
  className,
  reduce,
  settled,
}: {
  text: string;
  className: string;
  reduce: boolean | null;
  settled: boolean;
}) {
  if (reduce) {
    return (
      <h1
        className={`${className} text-white uppercase whitespace-pre-line transition-opacity duration-200 group-hover:opacity-75`}
      >
        {text}
      </h1>
    );
  }

  const lines = text.split("\n");
  return (
    <motion.h1
      className={`${className} text-white uppercase transition-opacity duration-200 group-hover:opacity-75`}
      initial={settled ? false : "hidden"}
      animate="visible"
      variants={HEAD_CONTAINER}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span className="block" variants={HEAD_LINE}>
            {line}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}

const SLIDES = [
  {
    id: "01",
    type: "video" as const,
    desktopSrc: "/Landscape video.mp4",
    mobileSrc: "/videos/Hero video mobile.mp4",
    heading: "Join The\nWaitlist",
    headingClass: "font-street text-[clamp(60px,14vw,160px)] font-normal leading-[0.9] tracking-[0.02em]",
    action: "waitlist" as const,
  },
  {
    id: "02",
    type: "image" as const,
    desktopSrc: "/Streetwear landscape.jpg",
    mobileSrc: "/potrait picture.jpg",
    heading: "Enter\nStage One",
    headingClass: "font-street text-[clamp(60px,14vw,160px)] font-normal leading-[0.9] tracking-[0.02em]",
    action: "link" as const,
    href: "/collections/stage-one",
  },
];

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const reduce = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // After the intro reveal has played once, later slide changes swap the
  // heading text instantly instead of re-running the mask rise.
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 1800);
    return () => clearTimeout(t);
  }, []);

  function goTo(i: number) {
    setActive(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = SLIDES[active];

  return (
    <>
      <section className="relative h-svh w-full overflow-hidden bg-black">
        {/* Background — video or image (slow zoom-out + fade-in on load) */}
        <motion.div
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === active ? 1 : 0 }}
            >
              {s.type === "video" ? (
                <video
                  key={isMobile ? "mobile" : "desktop"}
                  src={isMobile ? s.mobileSrc : s.desktopSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <picture className="absolute inset-0">
                  <source media="(max-width: 768px)" srcSet={s.mobileSrc} />
                  <source media="(min-width: 769px)" srcSet={s.desktopSrc} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.desktopSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </picture>
              )}
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
        </motion.div>

        {/* Slide 01 — top left */}
        <motion.button
          onClick={() => goTo(0)}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className={`absolute left-5 top-24 z-20 sm:left-10 font-display font-light italic transition-all duration-300 ${
            active === 0
              ? "text-[24px] text-white"
              : "text-[14px] text-white/40 hover:text-white/60"
          }`}
        >
          01
        </motion.button>

        {/* Slide 02 — top right */}
        <motion.button
          onClick={() => goTo(1)}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className={`absolute right-5 top-24 z-20 sm:right-10 font-display font-light italic transition-all duration-300 ${
            active === 1
              ? "text-[24px] text-white"
              : "text-[14px] text-white/40 hover:text-white/60"
          }`}
        >
          02
        </motion.button>

        {/* Clickable heading — bottom left */}
        <div className="absolute bottom-16 left-5 z-20 sm:bottom-20 sm:left-10">
          {slide.action === "waitlist" ? (
            <button
              onClick={() => setWaitlistOpen(true)}
              className="group text-left"
              aria-label="Join the waitlist"
            >
              <HeroHeading text={slide.heading} className={slide.headingClass} reduce={reduce} settled={settled} />
              {/* Mobile: underline + tap cue always visible. Desktop: expand on hover */}
              <div className="mt-2 flex items-center gap-3">
                <span className="h-px bg-white transition-[width] duration-400 w-full sm:w-0 sm:group-hover:w-full" />
                <span className="shrink-0 font-primary text-[9px] tracking-[0.25em] text-white/50 uppercase transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                  ↗
                </span>
              </div>
            </button>
          ) : (
            <Link
              href={"href" in slide ? slide.href : "/"}
              className="group text-left block"
            >
              <HeroHeading text={slide.heading} className={slide.headingClass} reduce={reduce} settled={settled} />
              <div className="mt-2 flex items-center gap-3">
                <span className="h-px bg-white transition-[width] duration-400 w-full sm:w-0 sm:group-hover:w-full" />
                <span className="shrink-0 font-primary text-[9px] tracking-[0.25em] text-white/50 uppercase transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                  ↗
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </>
  );
}
