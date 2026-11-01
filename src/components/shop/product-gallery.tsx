"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import type { ShopifyImage } from "@/lib/shopify/types";
import { parseSpec } from "@/lib/product-copy";
import { useNavVisibility, NAVBAR_HEIGHT } from "@/components/layout/nav-visibility";

// A gallery image that opens the full screen viewer when clicked.
function ZoomImage({
  src,
  alt,
  sizes,
  priority,
  onOpen,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="View larger"
      className="absolute inset-0 cursor-zoom-in"
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </button>
  );
}

// "The Spec" — label/value rows parsed from the editable garment metafield.
function SpecCard({ specs, className = "" }: { specs: string[]; className?: string }) {
  if (specs.length === 0) return null;
  return (
    <div
      className={`border border-line px-4 py-4 ${className}`}
    >
      <p className="t-label mb-3 text-ink-muted">Specification</p>
      <dl className="space-y-2">
        {specs.slice(0, 4).map((line) => {
          const { label, value } = parseSpec(line);
          return (
            <div
              key={line}
              className="flex items-baseline justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0"
            >
              {label ? (
                <>
                  <dt className="t-label text-ink-muted">
                    {label}
                  </dt>
                  <dd className="t-body text-right">
                    {value}
                  </dd>
                </>
              ) : (
                <dd className="t-body">
                  {value}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function ProductGallery({
  images,
  specs = [],
}: {
  images: ShopifyImage[];
  specs?: string[];
}) {
  const [active, setActive] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
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

  // Lightbox — lock scroll + wire keyboard nav while open.
  useEffect(() => {
    if (zoomIdx === null) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomIdx(null);
      else if (e.key === "ArrowRight")
        setZoomIdx((i) => (i === null ? i : (i + 1) % images.length));
      else if (e.key === "ArrowLeft")
        setZoomIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoomIdx, images.length]);

  // Touch devices scroll the track natively (smooth, with momentum + snap).
  // Only mouse pointers get the JS click-and-drag fallback.
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    isDragging.current = true;
    startX.current = e.clientX;
    startScroll.current = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !isDragging.current || !trackRef.current) return;
    const dx = e.clientX - startX.current;
    trackRef.current.scrollLeft = startScroll.current - dx;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || !isDragging.current || !trackRef.current) return;
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
      <div className="flex aspect-[3/4] items-center justify-center bg-surface">
        <span className="t-label text-ink-faint">No images available</span>
      </div>
    );
  }

  const cover = images[0];
  const rest = images.slice(1);

  return (
    <>
      {/* ── Mobile + Tablet — swipeable carousel ── */}
      <div ref={carouselRef} className="relative lg:hidden">
        {/* Carousel track */}
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          style={{ scrollSnapType: "x mandatory", touchAction: "pan-x pan-y pinch-zoom" }}
        >
          {images.map((img, i) => (
            <div
              key={img.url}
              className="relative aspect-[4/5] w-full flex-shrink-0 snap-center overflow-hidden bg-surface"
            >
              <Image
                src={img.url}
                alt={img.altText || `Product image ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
                onClick={() => setZoomIdx(i)}
              />
            </div>
          ))}
        </div>

        {/* Sentinel — marks the natural position of the dock */}
        <div ref={sentinelRef} className="h-0 w-full" />

        {/* In-flow thumbnails — shown only when NOT stuck */}
        {images.length > 1 && !isStuck && (
          <div className="flex gap-1.5 px-5 py-3">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => scrollToSlide(i)}
                className={`relative aspect-[4/5] w-12 flex-shrink-0 overflow-hidden transition-opacity duration-300 ${
                  i === active ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `Thumbnail ${i + 1}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile spec card — the desktop one lives in the sticky gallery column */}
      <SpecCard specs={specs} className="mx-5 mb-1 mt-1 lg:hidden" />

      {/* Fixed thumbnail dock — sits flush under the navbar and hides/shows with it (mobile only) */}
      {images.length > 1 && (
        <div
          className={`fixed left-0 right-0 z-40 flex items-center gap-1.5 border-b border-line bg-bg px-5 py-1.5 transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none lg:hidden ${
            isStuck && !navHidden
              ? "translate-y-0"
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
              className={`relative aspect-[4/5] w-5 flex-shrink-0 overflow-hidden ${
                i === active ? "opacity-100" : "opacity-40"
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
            <span className="t-label ml-auto">Size · {selectedSize}</span>
          )}
        </div>
      )}

      {/* ── Desktop — equal cover + scroll column, hover to magnify ── */}
      <div className="hidden gap-2 p-2 lg:grid lg:grid-cols-2">
        {/* Left — sticky cover, spec card filling the space below */}
        <div className="sticky top-11 flex h-[calc(100vh-2.75rem-1rem)] flex-col gap-3 self-start">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
            <ZoomImage
              src={cover.url}
              alt={cover.altText || "Product cover"}
              sizes="30vw"
              priority
              onOpen={() => setZoomIdx(0)}
            />
          </div>

          <SpecCard specs={specs} className="flex min-h-0 flex-1 flex-col justify-center" />
        </div>

        {/* Right — the rest of the shots, equal size, hover to magnify */}
        <div className="flex flex-col gap-2">
          {(rest.length > 0 ? rest : [cover]).map((img, i) => {
            const idx = rest.length > 0 ? i + 1 : 0;
            return (
              <div
                key={img.url}
                className="relative aspect-[4/5] w-full overflow-hidden bg-surface"
              >
                <ZoomImage
                  src={img.url}
                  alt={img.altText || `Product image ${idx + 1}`}
                  sizes="30vw"
                  onOpen={() => setZoomIdx(idx)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {zoomIdx !== null && images[zoomIdx] && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-bg text-ink"
          onClick={() => setZoomIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            onClick={() => setZoomIdx(null)}
            aria-label="Close"
            className="t-label absolute right-5 top-4 z-10 transition-opacity hover:opacity-60 sm:right-10"
          >
            Close
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                }}
                aria-label="Previous"
                className="t-label absolute left-5 top-1/2 z-10 -translate-y-1/2 transition-opacity hover:opacity-60 sm:left-10"
              >
                Prev
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomIdx((i) => (i === null ? i : (i + 1) % images.length));
                }}
                aria-label="Next"
                className="t-label absolute right-5 top-1/2 z-10 -translate-y-1/2 transition-opacity hover:opacity-60 sm:right-10"
              >
                Next
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-[76vw] max-w-[1000px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[zoomIdx].url}
              alt={images[zoomIdx].altText || `Image ${zoomIdx + 1}`}
              fill
              sizes="92vw"
              className="object-contain"
              priority
            />
          </div>

          <span className="t-label absolute bottom-6 left-1/2 -translate-x-1/2 tabular-nums text-ink-muted">
            {zoomIdx + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
