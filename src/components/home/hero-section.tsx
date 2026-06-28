"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    id: "01",
    type: "video" as const,
    desktopSrc: "/videos/Hero video desktop.mp4",
    mobileSrc: "/videos/Hero video mobile.mp4",
    eyebrow: "Dusk&Co",
    heading: "Join The\nWaitlist",
    cta: { label: "Join Now", href: "#waitlist" },
  },
  {
    id: "02",
    type: "image" as const,
    src: "/hero-cover.jpeg",
    eyebrow: "Our Story",
    heading: "A Modern\nExpression\nof Self",
    cta: { label: "About Us", href: "/about" },
  },
];

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  function goTo(i: number) {
    setActive(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
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
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = SLIDES[active];

  return (
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
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src={s.src!}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-contain"
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
      </div>

      {/* Slide numbers — top left */}
      <div className="absolute left-5 top-24 z-20 flex flex-col gap-2 sm:left-10">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`font-display text-right font-light italic transition-all duration-300 ${
              i === active
                ? "text-[24px] text-white"
                : "text-[14px] text-white/40 hover:text-white/60"
            }`}
          >
            {s.id}
          </button>
        ))}
      </div>

      {/* Main content — bottom left */}
      <div className="absolute bottom-24 left-5 z-20 flex flex-col gap-4 sm:bottom-28 sm:left-10">
        <p className="font-primary text-[11px] font-light tracking-[0.12em] text-white/60 uppercase">
          {slide.eyebrow}
        </p>
        <h1 className="font-display text-[clamp(32px,8vw,72px)] font-bold leading-[1.05] tracking-[-0.02em] text-white uppercase whitespace-pre-line">
          {slide.heading}
        </h1>
        <Link
          href={slide.cta.href}
          onClick={
            slide.cta.href === "#waitlist"
              ? (e) => {
                  e.preventDefault();
                  document
                    .getElementById("waitlist")
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              : undefined
          }
          className="mt-2 w-fit rounded-full border border-white/60 bg-transparent px-8 py-3.5 font-primary text-[11px] font-normal tracking-[0.08em] text-white uppercase transition-all duration-200 hover:bg-white hover:text-black"
        >
          {slide.cta.label}
        </Link>
      </div>

      {/* Scroll / Next — bottom right */}
      <div className="absolute bottom-24 right-5 z-20 flex flex-col items-end gap-3 sm:bottom-28 sm:right-10">
        <button
          onClick={() =>
            document
              .getElementById("below-hero")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="font-primary text-[13px] font-light italic text-white/50 transition-colors hover:text-white/80"
        >
          Scroll
        </button>
        <button
          onClick={() => goTo((active + 1) % SLIDES.length)}
          className="font-primary text-[13px] font-light italic text-white/50 transition-colors hover:text-white/80"
        >
          Next
        </button>
      </div>

      {/* Slide indicator bars — bottom */}
      <div className="absolute bottom-10 left-5 z-20 flex gap-[6px] sm:left-10">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="h-[2px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              width: i === active ? "3rem" : "1.25rem",
              backgroundColor:
                i === active ? "white" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
