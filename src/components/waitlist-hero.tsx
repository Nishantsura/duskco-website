"use client";

import { useState, useCallback, type FormEvent } from "react";
import { GradientBackground } from "@/components/ui/noisy-gradient-backgrounds";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor";

type Phase = "landing" | "transitioning" | "form" | "success";
type SubmitStatus = "idle" | "loading" | "error";

// Full-sky dusk gradient — sun core at the bottom (0%) blending up
// through orange, pink and lavender into deep twilight at the top (100%).
const DUSK_GRADIENT_COLORS = [
  { color: "rgba(255,125,35,1)", stop: "0%" },
  { color: "rgba(245,95,10,1)", stop: "8%" },
  { color: "rgba(245,140,60,1)", stop: "16%" },
  { color: "rgba(240,160,140,1)", stop: "26%" },
  { color: "rgba(228,165,190,1)", stop: "38%" },
  { color: "rgba(190,160,205,1)", stop: "50%" },
  { color: "rgba(130,105,170,1)", stop: "62%" },
  { color: "rgba(78,66,125,1)", stop: "74%" },
  { color: "rgba(42,38,82,1)", stop: "85%" },
  { color: "rgba(22,20,48,1)", stop: "94%" },
  { color: "rgba(12,11,28,1)", stop: "100%" },
];

export function WaitlistHero() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleJoinClick = useCallback(() => {
    setPhase("transitioning");
    setTimeout(() => setPhase("form"), 1400);
  }, []);

  const handleBack = useCallback(() => {
    setPhase("landing");
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (res.ok) {
        setPhase("success");
        setEmail("");
        setName("");
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Connection failed. Please try again.");
    }
  }

  const isUp = phase !== "landing";
  const showForm = phase === "form" || phase === "success";
  const showLanding = phase === "landing";

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#050510]">
      {/* Full-sky dusk gradient — sun at the bottom blending up into twilight.
          Scales up from the bottom on click so the sun expands to fill the screen. */}
      <div
        className="absolute inset-0 z-[2] overflow-hidden transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transformOrigin: "50% 100%",
          transform: isUp ? "scale(2.6)" : "scale(1)",
          transitionDuration: isUp ? "2800ms" : "900ms",
        }}
      >
        <GradientBackground
          gradientOrigin="bottom-middle"
          gradientSize="135% 118%"
          colors={DUSK_GRADIENT_COLORS}
          noiseIntensity={0.8}
          noisePatternSize={100}
          noisePatternRefreshInterval={2}
          noisePatternAlpha={40}
        />
      </div>

      {/* Subtle stars in the upper twilight (vanish over the bright sun) */}
      <div className="stars-container pointer-events-none absolute inset-0 z-[3] opacity-40 mix-blend-screen" />

      {/* Landing content */}
      <div
        className="relative z-10 flex h-dvh flex-col items-center justify-between px-6 py-10 transition-all duration-700 sm:px-12"
        style={{
          opacity: showLanding ? 1 : 0,
          transform: showLanding ? "translateY(0)" : "translateY(-40px)",
          pointerEvents: showLanding ? "auto" : "none",
        }}
      >
        <header
          className="animate-fade-in flex w-full justify-center pt-4 opacity-0"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="font-primary text-2xl font-light tracking-[0.35em] text-white/90 uppercase drop-shadow sm:text-3xl">
            DUSK&CO
          </h2>
        </header>

        <div className="flex max-w-2xl flex-col items-center text-center">
          <p
            className="animate-fade-in-up mb-4 font-primary text-xs font-light tracking-[0.25em] text-white/80 uppercase opacity-0 drop-shadow-sm sm:text-sm"
            style={{ animationDelay: "0.5s" }}
          >
            Something exclusive is coming
          </p>

          {/* Retro TV video */}
          <div
            className="animate-fade-in-up mb-5 w-full max-w-xs opacity-0 sm:max-w-sm"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="relative mx-auto overflow-hidden rounded-lg" style={{ margin: "0 -2%" }}>
              <video
                className="h-full w-full object-contain"
                src="/videos/Homepage%20video.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{ clipPath: "inset(8% 8% 8% 8% round 12px)" }}
              />
            </div>
          </div>

          <h1
            className="animate-fade-in-up mb-8 font-primary text-2xl font-bold leading-[0.95] tracking-tight text-white opacity-0 drop-shadow-lg sm:text-3xl md:text-4xl"
            style={{ animationDelay: "0.7s" }}
          >
            Wear The
            <br />
            Difference.
          </h1>

          <button
            onClick={handleJoinClick}
            className="animate-fade-in-up border border-white/30 bg-white/10 px-10 py-3.5 font-primary text-xs font-bold tracking-[0.2em] text-white uppercase opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/50"
            style={{ animationDelay: "0.9s" }}
          >
            Join The Waitlist
          </button>
        </div>

        <footer
          className="animate-fade-in flex w-full flex-col items-center gap-2 pb-2 opacity-0"
          style={{ animationDelay: "1.5s" }}
        >
          <p className="font-primary text-[10px] font-light tracking-[0.15em] text-white/70 uppercase drop-shadow-sm">
            Embrace your Dawn. Embrace your Dusk.
          </p>
        </footer>
      </div>

      {/* Form overlay */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 transition-all duration-700"
        style={{
          opacity: showForm ? 1 : 0,
          transform: showForm ? "translateY(0)" : "translateY(20px)",
          pointerEvents: showForm ? "auto" : "none",
          transitionDelay: showForm ? "200ms" : "0ms",
        }}
      >
        {phase !== "success" ? (
          <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
            <button
              onClick={handleBack}
              className="fixed left-6 top-10 z-30 font-primary text-xs font-light tracking-[0.15em] text-white/70 uppercase drop-shadow-sm transition-colors hover:text-white sm:left-12"
            >
              &larr; Back
            </button>

            <h2 className="font-primary text-sm font-light tracking-[0.3em] text-white/90 uppercase drop-shadow">
              DUSK&CO
            </h2>

            <div className="text-center">
              <h3 className="mb-2 font-primary text-2xl font-bold text-white drop-shadow-md sm:text-3xl">
                Join The Waitlist
              </h3>
              <p className="font-primary text-sm font-light text-white/75 drop-shadow-sm">
                Be the first to know when we drop.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-3"
            >
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-white/20 bg-black/25 px-4 py-3.5 font-primary text-sm font-light text-white placeholder:text-white/55 backdrop-blur-md transition-colors focus:border-white/45 focus:bg-black/35 focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-white/20 bg-black/25 px-4 py-3.5 font-primary text-sm font-light text-white placeholder:text-white/55 backdrop-blur-md transition-colors focus:border-white/45 focus:bg-black/35 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="mt-1 w-full border border-white/30 bg-white/10 px-4 py-3.5 font-primary text-xs font-bold tracking-[0.2em] text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/50 disabled:opacity-50"
              >
                {submitStatus === "loading" ? (
                  <span className="animate-pulse-subtle">Submitting...</span>
                ) : (
                  "Submit"
                )}
              </button>
              {submitStatus === "error" && (
                <p className="text-center font-primary text-xs font-light text-red-400">
                  {errorMessage}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-white/40 backdrop-blur-sm">
              <svg
                className="h-8 w-8 text-white drop-shadow"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-2 font-primary text-2xl font-bold text-white drop-shadow-md">
                You&apos;re In.
              </h3>
              <p className="font-primary text-sm font-light text-white/75 drop-shadow-sm">
                We&apos;ll be in touch when it&apos;s time.
              </p>
            </div>
            <p className="font-primary text-[10px] font-light tracking-[0.15em] text-white/55 uppercase drop-shadow-sm">
              Wear the difference.
            </p>
          </div>
        )}
      </div>
      <SpotlightCursor config={{ radius: 250, brightness: 0.12, color: "#ffffff" }} />
    </main>
  );
}
