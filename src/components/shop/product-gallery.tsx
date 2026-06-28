"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import type { ShopifyImage } from "@/lib/shopify/types";

export function ProductGallery({ images }: { images: ShopifyImage[] }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const isDragging = useRef(false);

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
      <div className="lg:hidden">
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
              className="relative aspect-[3/4] w-full flex-shrink-0 snap-center overflow-hidden bg-[#f0f0f0]"
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

        {/* Thumbnail dock */}
        {images.length > 1 && (
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

      {/* ── Desktop — 2 columns: sticky cover + scrollable ── */}
      <div className="hidden gap-1 lg:grid lg:grid-cols-2">
        <div className="sticky top-20 self-start">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f0f0f0]">
            <Image
              src={cover.url}
              alt={cover.altText || "Product cover"}
              fill
              sizes="35vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {(rest.length > 0 ? rest : [cover]).map((img, i) => (
            <div
              key={img.url}
              className="relative h-svh w-full overflow-hidden bg-[#f0f0f0]"
            >
              <Image
                src={img.url}
                alt={img.altText || `Product image ${i + 2}`}
                fill
                sizes="35vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
