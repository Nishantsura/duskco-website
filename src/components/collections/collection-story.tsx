import Image from "next/image";
import type { StoryStage } from "@/lib/shopify/types";

function StageMedia({
  media,
  priority,
  className = "object-cover",
}: {
  media: StoryStage["media"];
  priority?: boolean;
  className?: string;
}) {
  if (!media) return null;
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        autoPlay
        muted
        loop
        playsInline
        className={`h-full w-full ${className}`}
      />
    );
  }
  return (
    <Image
      src={media.url}
      alt={media.alt || ""}
      fill
      sizes="100vw"
      className={className}
      priority={priority}
    />
  );
}

function Kicker({ stageNumber, label }: { stageNumber: string; label: string }) {
  const parts = [stageNumber, label].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="t-label">{parts.join(" · ")}</p>;
}

/* ---------- stage layouts ---------- */

// First stage — full screen opener over media.
function StageHero({ stage }: { stage: StoryStage }) {
  return (
    <section className="relative flex h-svh w-full flex-col justify-end overflow-hidden bg-black">
      <div className="absolute inset-0">
        <StageMedia media={stage.media} priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

      <div className="animate-fade-in relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-20 text-white sm:px-10 sm:pb-24">
        <div className="text-white/75">
          <Kicker stageNumber={stage.stageNumber} label={stage.label} />
        </div>
        <h1 className="t-display mt-3 whitespace-pre-line">{stage.headline}</h1>
        {stage.body && <p className="t-body mt-4 max-w-md text-white/75">{stage.body}</p>}
      </div>
    </section>
  );
}

// Full bleed centred statement over media.
function StageStatement({ stage }: { stage: StoryStage }) {
  return (
    <section className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0">
        <StageMedia media={stage.media} className="object-cover opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center text-white">
        <div className="mb-5 text-white/70">
          <Kicker stageNumber={stage.stageNumber} label={stage.label} />
        </div>
        <h2 className="t-title whitespace-pre-line">{stage.headline}</h2>
        {stage.body && <p className="t-body mx-auto mt-5 max-w-md text-white/70">{stage.body}</p>}
      </div>
    </section>
  );
}

// Media beside text, alternating sides.
function StageSplit({ stage, reverse }: { stage: StoryStage; reverse?: boolean }) {
  return (
    <section className="bg-bg text-ink">
      <div className="mx-auto grid max-w-[1440px] items-stretch md:grid-cols-2">
        <div
          className={`relative aspect-[4/5] w-full overflow-hidden md:aspect-auto md:min-h-[78vh] ${
            reverse ? "md:order-2" : ""
          }`}
        >
          <StageMedia media={stage.media} />
        </div>

        <div
          className={`flex flex-col justify-center px-5 py-16 sm:px-10 md:px-16 lg:px-24 ${
            reverse ? "md:order-1" : ""
          }`}
        >
          <div className="text-ink-muted">
            <Kicker stageNumber={stage.stageNumber} label={stage.label} />
          </div>
          <h2 className="t-title mt-4 whitespace-pre-line">{stage.headline}</h2>
          {stage.body && <p className="t-body mt-5 max-w-md text-ink-muted">{stage.body}</p>}
        </div>
      </div>
    </section>
  );
}

/* ---------- the collection story ---------- */

export function CollectionStory({ stages }: { stages: StoryStage[] }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div>
      {stages.map((stage, i) => {
        if (i === 0) return <StageHero key={i} stage={stage} />;
        if (stage.layout === "split" && stage.media) {
          return <StageSplit key={i} stage={stage} reverse={i % 2 === 0} />;
        }
        return <StageStatement key={i} stage={stage} />;
      })}
    </div>
  );
}
