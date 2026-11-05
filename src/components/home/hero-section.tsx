"use client";

import { useState } from "react";
import Link from "next/link";
import { WaitlistModal } from "./waitlist-modal";
import { CutOn, CutText, GateBar, GateVideo, cutEnd } from "./gate-frame";

const HEADLINE = "By invitation only";
const CUT_START = 0.35; // s before the first letter

export function HeroSection({ openWaitlist = false }: { openWaitlist?: boolean }) {
  const [waitlistOpen, setWaitlistOpen] = useState(openWaitlist);

  function closeWaitlist() {
    setWaitlistOpen(false);
    // Drop the ?join flag so a refresh doesn't reopen the form.
    if (window.location.search) window.history.replaceState(null, "", "/");
  }

  return (
    <>
      <section className="relative h-dvh w-full overflow-hidden bg-pearl font-mono uppercase text-graphite">
        <GateVideo />
        <GateBar right="Stage 01" tone="light" />

        {/* The footage is shot at dusk, so graphite type would sink into it.
            Plain white, not difference blending: the headline crosses the pale
            sky as well as the dark figure, and difference goes muddy over the
            mid-tones in between. */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center text-white">
          {/* Dropped clear of the lit building edge the crop puts behind it,
              onto the figure. The actions keep their own place below. */}
          <CutText text={HEADLINE} start={CUT_START} className="gate-title translate-y-12" />

          {/* The links cut on once the word is whole. On phones the crop puts
              the shirt's white print right where they'd land, so they shift
              down past it — a transform, not a margin, so the headline keeps
              its place instead of being pushed up into the pale sky. */}
          <CutOn
            at={cutEnd(HEADLINE, CUT_START)}
            className="mt-20 flex translate-y-28 flex-wrap items-center justify-center gap-x-12 gap-y-5 sm:mt-28 sm:translate-y-0 sm:gap-x-18"
          >
            <button onClick={() => setWaitlistOpen(true)} className="gate-action gate-action-primary">
              Join the waitlist
            </button>
            <Link href="/access" className="gate-action">
              Enter access code
            </Link>
          </CutOn>
        </div>
      </section>

      <WaitlistModal open={waitlistOpen} onClose={closeWaitlist} />
    </>
  );
}
