"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ShopifyImage } from "@/lib/shopify/types";
import { parseSpec } from "@/lib/product-copy";
import { useNavVisibility, NAVBAR_HEIGHT } from "@/components/layout/nav-visibility";

const LENS = 184; // magnifier diameter (px)
const ZOOM = 2.4; // magnification factor

type Lens = { left: number; top: number; tx: number; ty: number; w: number; h: number };

// Hover magnifier — a circular loupe follows the cursor and shows the garment
// magnified under it. Mouse only (touch has no hover); the mobile flow keeps the
// tap-to-open lightbox instead.
function ZoomImage({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<Lens | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) {
      setLens(null);
      return;
    }
    const R = LENS / 2;
    const w = r.width * ZOOM;
    const h = r.height * ZOOM;
    // Keep the loupe circle fully on the image…
    const left = Math.min(Math.max(x, R), r.width - R) - R;
    const top = Math.min(Math.max(y, R), r.height - R) - R;
    // …while the magnified content still tracks the true cursor point.
    const tx = Math.min(0, Math.max(LENS - w, R - x * ZOOM));
    const ty = Math.min(0, Math.max(LENS - h, R - y * ZOOM));
    setLens({ left, top, tx, ty, w, h });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setLens(null)}
      className="absolute inset-0 cursor-zoom-in"
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {lens && (
        <div
          className="pointer-events-none absolute z-10 overflow-hidden rounded-full"
          style={{
            width: LENS,
            height: LENS,
            left: lens.left,
            top: lens.top,
            boxShadow:
              "0 12px 34px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.75)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            style={{
              width: lens.w,
              height: lens.h,
              maxWidth: "none",
              objectFit: "cover",
              transform: `translate(${lens.tx}px, ${lens.ty}px)`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// "The Spec" — label/value rows parsed from the editable garment metafield.
function SpecCard({ specs, className = "" }: { specs: string[]; className?: string }) {
  if (specs.length === 0) return null;
  return (
    <div
      className={`rounded-[2px] border border-line bg-ink/[0.03] px-4 py-3.5 ${className}`}
    >
      <p className="mb-2.5 flex items-center gap-1.5 font-primary text-[9px] font-bold tracking-[0.24em] text-ink-faint uppercase">
        <span
          className="h-1 w-1 rounded-full"
          style={{ background: "var(--accent)", boxShadow: "0 0 5px var(--accent)" }}
        />
        The Spec
      </p>
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
                  <dt className="font-primary text-[10px] tracking-[0.1em] text-ink-faint uppercase">
                    {label}
                  </dt>
                  <dd className="text-right font-primary text-[11px] font-medium text-ink">
                    {value}
                  </dd>
                </>
              ) : (
                <dd className="font-primary text-[11px] font-medium text-ink">
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
        <span className="font-primary text-sm font-light text-ink-faint">
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
              />
            </div>
          ))}
        </div>

        {/* Zoom affordance */}
        <button
          onClick={() => setZoomIdx(active)}
          aria-label="Zoom image"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:text-white"
        >
          <Maximize2 size={15} strokeWidth={1.75} />
        </button>

        {/* Sentinel — marks the natural position of the dock */}
        <div ref={sentinelRef} className="h-0 w-full" />

        {/* In-flow thumbnails — shown only when NOT stuck */}
        {images.length > 1 && !isStuck && (
          <div className="flex gap-1.5 px-5 py-2.5">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => scrollToSlide(i)}
                className={`relative aspect-square w-14 flex-shrink-0 overflow-hidden transition-all duration-200 ${
                  i === active
                    ? "ring-[1.5px] ring-accent ring-offset-1 ring-offset-bg"
                    : "opacity-40 ring-1 ring-line hover:opacity-70"
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
          className={`fixed left-0 right-0 z-40 flex items-center gap-1.5 bg-bg/95 px-3 py-1.5 backdrop-blur-sm transition-transform duration-300 lg:hidden ${
            isStuck && !navHidden
              ? "translate-y-0 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.8)]"
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
              className={`relative aspect-square w-5 flex-shrink-0 overflow-hidden transition-all duration-200 ${
                i === active
                  ? "ring-[1px] ring-accent ring-offset-[0.5px] ring-offset-bg"
                  : "ring-1 ring-line hover:ring-line-strong"
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
              <span
                className="flex h-6 items-center gap-1 rounded-full pl-2.5 pr-2 font-street text-[11px] tracking-[0.08em] uppercase"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
              >
                {selectedSize}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Desktop — equal cover + scroll column, hover to magnify ── */}
      <div className="hidden gap-2 p-2 lg:grid lg:grid-cols-2">
        {/* Left — sticky cover, spec card filling the space below */}
        <div className="sticky top-11 flex h-[calc(100vh-2.75rem-1rem)] flex-col gap-3 self-start">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-surface">
            <ZoomImage
              src={cover.url}
              alt={cover.altText || "Product cover"}
              sizes="30vw"
              priority
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
                className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-surface"
              >
                <ZoomImage
                  src={img.url}
                  alt={img.altText || `Product image ${idx + 1}`}
                  sizes="30vw"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {zoomIdx !== null && images[zoomIdx] && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/92 backdrop-blur-sm"
          onClick={() => setZoomIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            onClick={() => setZoomIdx(null)}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
          >
            <X size={20} strokeWidth={1.75} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                }}
                aria-label="Previous"
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white sm:left-8"
              >
                <ChevronLeft size={22} strokeWidth={1.75} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomIdx((i) => (i === null ? i : (i + 1) % images.length));
                }}
                aria-label="Next"
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white sm:right-8"
              >
                <ChevronRight size={22} strokeWidth={1.75} />
              </button>
            </>
          )}

          <div
            className="relative h-[84vh] w-[92vw] max-w-[1100px]"
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

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-primary text-[11px] font-medium tracking-[0.2em] text-white/50">
            {zoomIdx + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
