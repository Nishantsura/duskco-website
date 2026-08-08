import type { StoryStage } from "./shopify/types";

/**
 * Baked-in Dusk story shown when a collection has no Shopify-authored story yet
 * (i.e. the `custom.story` metaobject list is empty). Three scroll-stages, then
 * the grid. Copy is written for the after-hours / Gen-Z voice and nods at the
 * ~5-piece drop. Once the client fills the metaobjects in Shopify, this is
 * automatically replaced — see getCollectionByHandle.
 */
const DUSK_FALLBACK_STORY: StoryStage[] = [
  {
    stageNumber: "01",
    label: "The Signal",
    headline: "When The\nSun Clocks Out",
    body: "Golden hour is a group chat you left on read. Stage One starts where the daylight ends — a tight drop built for the version of you that only loads after dark.",
    media: { type: "image", url: "/Cover%201.png", alt: "Dusk&Co Stage One" },
    layout: "statement",
  },
  {
    stageNumber: "02",
    label: "The Uniform",
    headline: "Five Fits,\nZero Rules",
    body: "No dress code, no main-character pressure. Five pieces cut to layer, break and remix however the night runs. Heavyweight, oversized, engineered to outlive the trend cycle you're already bored of.",
    media: { type: "image", url: "/potrait picture.jpg", alt: "Dusk&Co Stage One fit" },
    layout: "split",
  },
  {
    stageNumber: "03",
    label: "The Hours",
    headline: "Dusk Till\nWhenever",
    body: "Not fast-fashion cosplay — a limited run for the nocturnal. The skaters, the makers, the ones who go quiet online and loud IRL. Once it sells through, that's the drop. Blink and it's gone.",
    media: { type: "image", url: "/hero-cover.jpeg", alt: "After hours on the street" },
    layout: "statement",
  },
];

/**
 * Returns the fallback story for a collection. Kept as a function so per-handle
 * variants can be added later without touching callers.
 */
export function getFallbackStory(_title?: string): StoryStage[] {
  return DUSK_FALLBACK_STORY;
}
