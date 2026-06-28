"use client";

import Image from "next/image";
import type { ShopifyImage } from "@/lib/shopify/types";

export function ProductGallery({ images }: { images: ShopifyImage[] }) {
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
      {/* Mobile + Tablet — single column stack */}
      <div className="flex flex-col gap-1 lg:hidden">
        {images.map((img, i) => (
          <div key={img.url} className="relative aspect-[3/4] w-full overflow-hidden bg-[#f0f0f0]">
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

      {/* Desktop — 2 columns: sticky cover + scrollable */}
      <div className="hidden gap-1 lg:grid lg:grid-cols-2">
        {/* Left — sticky cover */}
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

        {/* Right — scrollable images */}
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
