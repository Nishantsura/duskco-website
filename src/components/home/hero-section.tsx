"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { WaitlistModal } from "./waitlist-modal";

const AUTOPLAY_MS = 7000;

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
    heading: "A Modern\nExpression\nof Self",
    headingClass: "font-street text-[clamp(60px,14vw,160px)] font-normal leading-[0.9] tracking-[0.02em]",
    action: "link" as const,
    href: "/about",
  },
];

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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
        {/* Background — video or image */}
        <div className="absolute inset-0">
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
        </div>

        {/* Slide 01 — top left */}
        <button
          onClick={() => goTo(0)}
          className={`absolute left-5 top-24 z-20 sm:left-10 font-display font-light italic transition-all duration-300 ${
            active === 0
              ? "text-[24px] text-white"
              : "text-[14px] text-white/40 hover:text-white/60"
          }`}
        >
          01
        </button>

        {/* Slide 02 — top right */}
        <button
          onClick={() => goTo(1)}
          className={`absolute right-5 top-24 z-20 sm:right-10 font-display font-light italic transition-all duration-300 ${
            active === 1
              ? "text-[24px] text-white"
              : "text-[14px] text-white/40 hover:text-white/60"
          }`}
        >
          02
        </button>

        {/* Clickable heading — bottom left */}
        <div className="absolute bottom-16 left-5 z-20 sm:bottom-20 sm:left-10">
          {slide.action === "waitlist" ? (
            <button
              onClick={() => setWaitlistOpen(true)}
              className="group text-left"
              aria-label="Join the waitlist"
            >
              <h1 className={`${slide.headingClass} text-white uppercase whitespace-pre-line transition-opacity duration-200 group-hover:opacity-75`}>
                {slide.heading}
              </h1>
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
              <h1 className={`${slide.headingClass} text-white uppercase whitespace-pre-line transition-opacity duration-200 group-hover:opacity-75`}>
                {slide.heading}
              </h1>
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
