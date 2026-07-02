"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import type { ShopifyImage } from "@/lib/shopify/types";
import { useNavVisibility, NAVBAR_HEIGHT } from "@/components/layout/nav-visibility";

export function ProductGallery({ images }: { images: ShopifyImage[] }) {
  const [active, setActive] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const { hidden: navHidden } = useNavVisibility();
  const trackRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const isDragging = useRef(false);

  const NAVBAR_H = NAVBAR_HEIGHT;

  const scrollToSlide = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(index, images.length - 1));
      const slideWidth = track.offsetWidth;
      track.scrollTo({ left: clamped * slideWidth, behavior: "smooth" });
      setActive(clamped);
    },
    [images.length]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (!track) return;
        const slideWidth = track.offsetWidth;
        if (slideWidth === 0) return;
        const idx = Math.round(track.scrollLeft / slideWidth);
        setActive(idx);
        ticking = false;
      });
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  // Detect when the thumbnail dock should become fixed
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: `-${NAVBAR_H}px 0px 0px 0px` }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Read selected size from ProductInfo's active button
  useEffect(() => {
    if (!isStuck) {
      setSelectedSize("");
      return;
    }

    function readSize() {
      const activeBtn = document.querySelector('[data-size-btn="active"]');
      if (activeBtn) {
        setSelectedSize(activeBtn.textContent?.trim() || "");
      }
    }

    readSize();
    const interval = setInterval(readSize, 300);
    return () => clearInterval(interval);
  }, [isStuck]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    isDragging.current = true;
    startX.current = e.clientX;
    startScroll.current = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = e.clientX - startX.current;
    trackRef.current.scrollLeft = startScroll.current - dx;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || !trackRef.current) return;
      isDragging.current = false;
      trackRef.current.releasePointerCapture(e.pointerId);
      const slideWidth = trackRef.current.offsetWidth;
      const idx = Math.round(trackRef.current.scrollLeft / slideWidth);
      scrollToSlide(idx);
    },
    [scrollToSlide]
  );

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-neutral-100">
        <span className="font-primary text-sm font-light text-neutral-400">
          No images available
        </span>
      </div>
    );
  }

  const cover = images[0];
  const rest = images.slice(1);

  return (
    <>
      {/* ── Mobile + Tablet — swipeable carousel ── */}
      <div ref={carouselRef} className="lg:hidden">
        {/* Carousel track */}
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          style={{ scrollSnapType: "x mandatory", touchAction: "pan-y pinch-zoom" }}
        >
          {images.map((img, i) => (
            <div
              key={img.url}
              className="relative aspect-[3/4] w-full flex-shrink-0 snap-center overflow-hidden bg-white"
            >
              <Image
                src={img.url}
                alt={img.altText || `Product image ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Sentinel — marks the natural position of the dock */}
        <div ref={sentinelRef} className="h-0 w-full" />

        {/* In-flow thumbnails — shown only when NOT stuck */}
        {images.length > 1 && !isStuck && (
          <div className="flex gap-1.5 px-5 py-2.5">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => scrollToSlide(i)}
                className={`relative aspect-square w-9 flex-shrink-0 overflow-hidden rounded-[3px] transition-all duration-200 ${
                  i === active
                    ? "ring-[1.5px] ring-brand-near-black ring-offset-1"
                    : "opacity-40 ring-1 ring-black/10 hover:opacity-70"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `Thumbnail ${i + 1}`}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fixed thumbnail dock — sits flush under the navbar and hides/shows with it (mobile only) */}
      {images.length > 1 && (
        <div
          className={`fixed left-0 right-0 z-40 flex items-center gap-1.5 bg-white/95 px-3 py-1.5 backdrop-blur-sm transition-transform duration-300 lg:hidden ${
            isStuck && !navHidden
              ? "translate-y-0 shadow-sm"
              : "pointer-events-none -translate-y-[calc(100%+44px)]"
          }`}
          style={{ top: NAVBAR_H }}
        >
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => {
                scrollToSlide(i);
                carouselRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`relative aspect-square w-5 flex-shrink-0 overflow-hidden rounded-[2px] transition-all duration-200 ${
                i === active
                  ? "ring-[1px] ring-brand-near-black ring-offset-[0.5px]"
                  : "ring-1 ring-black/5 hover:ring-black/20"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `Thumbnail ${i + 1}`}
                fill
                sizes="20px"
                className="object-cover"
              />
            </button>
          ))}

          {selectedSize && (
            <div className="ml-auto flex items-center">
              <span className="flex h-6 items-center gap-1 rounded-full bg-brand-near-black pl-2.5 pr-2 font-street text-[11px] tracking-[0.08em] text-white uppercase">
                {selectedSize}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Desktop — sticky cover (smaller) + scrollable (larger) ── */}
      <div className="hidden gap-1 lg:grid lg:grid-cols-[5fr_7fr]">
        <div className="sticky top-11 self-start">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
            <Image
              src={cover.url}
              alt={cover.altText || "Product cover"}
              fill
              sizes="30vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {(rest.length > 0 ? rest : [cover]).map((img, i) => (
            <div
              key={img.url}
              className="relative h-svh w-full overflow-hidden bg-white"
            >
              <Image
                src={img.url}
                alt={img.altText || `Product image ${i + 2}`}
                fill
                sizes="42vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
