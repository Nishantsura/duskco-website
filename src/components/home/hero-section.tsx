"use client";

import { useState } from "react";
import Link from "next/link";
import { WaitlistModal } from "./waitlist-modal";

export const HERO_IMAGE = "/Cover%203.png";

export function HeroSection({ openWaitlist = false }: { openWaitlist?: boolean }) {
  const [waitlistOpen, setWaitlistOpen] = useState(openWaitlist);

  function closeWaitlist() {
    setWaitlistOpen(false);
    // Drop the ?join flag so a refresh doesn't reopen the form.
    if (window.location.search) window.history.replaceState(null, "", "/");
  }

  return (
    <>
      <section className="relative h-svh w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Quiet floor so the copy stays legible on any frame */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        <div className="animate-fade-in absolute inset-x-0 bottom-20 z-10 mx-auto max-w-[90rem] px-5 text-white sm:bottom-24 sm:px-10">
          <p className="t-label text-white/75">Stage One</p>
          <h1 className="t-display mt-3">By invitation only</h1>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setWaitlistOpen(true)}
              className="btn btn-light w-full sm:w-auto"
            >
              Join the waitlist
            </button>
            <Link href="/access" className="btn btn-ghost-light w-full sm:w-auto">
              Enter access code
            </Link>
          </div>
        </div>
      </section>

      <WaitlistModal open={waitlistOpen} onClose={closeWaitlist} />
    </>
  );
}
