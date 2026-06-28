"use client";

import { useState } from "react";
import Image from "next/image";

interface ProcessStep {
  id: string;
  label: string;
  caption: string;
  body: string;
  image: string;
}

const STEPS: ProcessStep[] = [
  {
    id: "research",
    label: "Research",
    caption: "Where it begins",
    body: "Every drop starts on the street, not the sketchpad. We study subcultures, archives, and the way people actually dress — the references nobody else is looking at. We skip what's trending in favour of what's about to matter.",
    image: "/hero-model.png",
  },
  {
    id: "character",
    label: "Character",
    caption: "The story underneath",
    body: "A garment without a point of view is just fabric. We give each piece a character — a mood, an attitude, a reason to exist. Before anything is drawn, we know exactly who it's for and what it has to say.",
    image: "/hero-cover.jpeg",
  },
  {
    id: "design",
    label: "Design",
    caption: "Idea into silhouette",
    body: "This is where instinct meets discipline. We translate the idea into proportion, drape, and cut — obsessing over every seam until the silhouette feels inevitable. Oversized, intentional, never accidental.",
    image: "/hero-model.png",
  },
  {
    id: "sourcing",
    label: "Sourcing",
    caption: "The right materials",
    body: "We hunt for fabrics the way collectors hunt for grails. Heavyweight cottons, technical blends, the hardware that lasts a decade — sourced from mills who care as much as we do. The right material is half the design.",
    image: "/hero-cover.jpeg",
  },
  {
    id: "color",
    label: "Color",
    caption: "Mood made visible",
    body: "Colour carries the feeling. We build palettes that hold tension — muted bases broken by a single charged tone, washes that look lived-in from day one. Nothing here is by default; every shade is a decision.",
    image: "/hero-model.png",
  },
  {
    id: "outfit",
    label: "Outfit",
    caption: "How it all comes together",
    body: "A piece is only finished when it's styled. We design in full looks — layering, proportion, the way a jacket sits over a tee. Because you don't wear one garment, you wear an attitude. That's the last and most important step.",
    image: "/hero-cover.jpeg",
  },
];

export function ProcessSection() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — headline, intro, selector, description */}
          <div className="flex flex-col">
            <h2 className="font-primary text-[clamp(40px,6vw,72px)] font-light leading-[1.0] tracking-[-0.02em] text-black">
              Our Process
            </h2>
            <p className="mt-6 max-w-md font-primary text-[13px] font-light leading-[1.7] tracking-[0.02em] text-black/50 uppercase">
              Every piece in the collection goes through a deliberate process —
              part research, part instinct, part obsession.
            </p>

            {/* Selector */}
            <div className="mt-10 flex flex-col">
              {STEPS.map((s, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(i)}
                    className={`group flex items-center gap-4 border-b border-black/10 py-4 text-left transition-colors duration-200 ${
                      isActive ? "border-black/40" : "hover:border-black/20"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                        isActive ? "border-black" : "border-black/30"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full bg-black transition-opacity duration-200 ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </span>
                    <span
                      className={`font-primary text-[clamp(20px,2.4vw,28px)] font-light tracking-[-0.01em] transition-colors duration-200 ${
                        isActive ? "text-black" : "text-black/35 group-hover:text-black/60"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active step description — bottom left, most important */}
            <div className="mt-12 max-w-xl">
              <p className="font-primary text-[10px] font-normal tracking-[0.2em] text-black/40 uppercase">
                {step.caption}
              </p>
              <p className="mt-4 font-primary text-[clamp(18px,2vw,26px)] font-light leading-[1.45] tracking-[-0.01em] text-black/80">
                {step.body}
              </p>
            </div>
          </div>

          {/* Right column — large image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-chalk lg:aspect-auto lg:h-full lg:min-h-[640px]">
            {STEPS.map((s, i) => (
              <Image
                key={s.id}
                src={s.image}
                alt={s.label}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-opacity duration-500"
                style={{ opacity: i === active ? 1 : 0 }}
                priority={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
