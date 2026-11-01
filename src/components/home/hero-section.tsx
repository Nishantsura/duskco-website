"use client";

import { useState } from "react";
import Link from "next/link";
import { WaitlistModal } from "./waitlist-modal";
import { CutOn, CutText, GateBar, GatePhoto, cutEnd } from "./gate-frame";

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
        <GatePhoto />
        <GateBar right="Stage 01" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center">
          <CutText text={HEADLINE} start={CUT_START} />

          {/* The links cut on once the word is whole. */}
          <CutOn
            at={cutEnd(HEADLINE, CUT_START)}
            className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 sm:mt-28 sm:gap-x-18"
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
