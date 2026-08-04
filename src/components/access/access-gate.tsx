"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor";

const SAFE_NEXT = /^\/(shop|collections|products)(\/|$)/;

const PREFIX = "DUSK";
const NEON = "#5EEAD4"; // subtle mint/aqua — the page's only accent
const DANGER = "#F87171"; // denied state only
const SCRAMBLE = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#*";

// Fine static film grain, kept off the main thread (SVG, no canvas).
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Decode-in scramble: cycles random glyphs, then resolves left→right. */
function useScramble(text: string, enabled: boolean) {
  const [out, setOut] = useState(enabled ? "" : text);
  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const revealed = Math.floor(frame / 2);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") s += " ";
        else if (i < revealed) s += text[i];
        else s += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }
      setOut(s);
      if (revealed >= text.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [text, enabled]);
  return out;
}

export function AccessGate() {
  const params = useSearchParams();
  const reduce = useReducedMotion();

  // Pre-fill from the emailed link (…/access?code=DUSK-XXXXXX) so recipients
  // just press Unlock. The prefix and any noise are stripped, same as typing.
  const prefilled = (params.get("code") || "")
    .toUpperCase()
    .replace(/^DUSK[-\s]?/, "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

  const [value, setValue] = useState(prefilled);
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "granted">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const nextParam = params.get("next") || "";
  const destination = SAFE_NEXT.test(nextParam) ? nextParam : "/collections/stage-one";

  const code = `${PREFIX}-${value}`;
  const heading = useScramble("ACCESS CODE", !reduce);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function onChange(raw: string) {
    // Only ever one field; strip a pasted DUSK- prefix and non-alnum noise.
    const cleaned = raw
      .toUpperCase()
      .replace(new RegExp(`^${PREFIX}[-\\s]?`), "")
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    setValue(cleaned);
    if (status === "error") {
      setStatus("idle");
      setError("");
    }
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!value.trim() || status === "loading" || status === "granted") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/access/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "ACCESS DENIED");
        return;
      }
      setStatus("granted");
      setTimeout(() => window.location.assign(destination), reduce ? 0 : 750);
    } catch {
      setStatus("error");
      setError("SIGNAL LOST — TRY AGAIN");
    }
  }

  const denied = status === "error";
  const granted = status === "granted";
  const lineColor = denied ? DANGER : focused || value ? NEON : "rgba(255,255,255,0.18)";

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 text-white">
      {/* ── background stack ── */}
      {/* neon core bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.10] blur-[130px]"
        style={{ background: NEON }}
      />
      {/* vignette — lifts the centre, sinks the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, rgba(255,255,255,0.045) 0%, rgba(5,5,5,0) 42%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
        style={{ backgroundImage: GRAIN, backgroundSize: "140px 140px" }}
      />
      {/* CRT scanlines */}
      <div aria-hidden className="access-scanlines pointer-events-none absolute inset-0" />
      {/* slow scan-sweep */}
      {!reduce && (
        <div
          aria-hidden
          className="access-sweep pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background: `linear-gradient(to bottom, transparent, ${NEON}14, transparent)`,
          }}
        />
      )}
      {/* cursor-following neon glow */}
      <SpotlightCursor config={{ color: NEON, radius: 300, brightness: 0.06 }} />

      {/* corner stamps */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 select-none font-primary text-[9px] font-medium tracking-[0.3em] text-white/25 uppercase">
        <span className="absolute left-6 top-24">Stage 01</span>
        <span className="absolute right-6 top-24" style={{ color: NEON, opacity: 0.7 }}>
          ● Classified
        </span>
        <span className="absolute bottom-6 left-6">No. 001 / 500</span>
        <span className="absolute bottom-6 right-6">After Hours</span>
      </div>

      {/* ── terminal ── */}
      <div className={`relative z-10 w-full max-w-md ${reduce ? "" : "access-flicker"}`}>
        <div className="text-center">
          <p className="font-primary text-[10px] font-medium uppercase tracking-[0.4em] text-white/40">
            <span style={{ color: NEON }}>/</span> Invite Only Terminal
          </p>
          <h1
            className="mt-6 font-street text-[clamp(46px,9vw,74px)] leading-[0.85] uppercase tracking-[0.01em]"
          >
            Enter your
            <br />
            <span
              className={reduce ? "" : "glitch"}
              data-text={heading}
              style={{ textShadow: `0 0 26px ${NEON}55` }}
            >
              {heading}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xs font-primary text-[11px] font-light leading-relaxed tracking-wide text-white/45">
            The drop is sealed to waitlist members. Punch in the code sent to your
            inbox to breach the vault.
          </p>
        </div>

        {/* live feed — a small surveillance monitor to sit between the copy and
            the code line. Tinted + scanlined to match the terminal. */}
        <div className="relative mx-auto mt-8 w-[190px]">
          <div
            className={`relative aspect-[4/3] overflow-hidden rounded-lg ${reduce ? "" : "access-signal"}`}
            style={{ boxShadow: `inset 0 0 0 1px ${NEON}44, 0 24px 60px -34px ${NEON}` }}
          >
            <video
              src="/dusk-video.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover [filter:grayscale(0.25)_contrast(1.05)_brightness(0.95)]"
            />
            {/* mint tint */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
              style={{ background: NEON }}
            />
            {/* scanlines + inner vignette */}
            <div aria-hidden className="access-scanlines pointer-events-none absolute inset-0 opacity-60" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 42px rgba(0,0,0,0.65)" }}
            />
            {/* tags */}
            <span
              className="absolute left-2 top-2 flex items-center gap-1 font-primary text-[8px] font-bold uppercase tracking-[0.2em]"
              style={{ color: NEON }}
            >
              <span
                className={`h-1 w-1 rounded-full ${reduce ? "" : "access-caret"}`}
                style={{ background: NEON, boxShadow: `0 0 6px ${NEON}` }}
              />
              Live
            </span>
            <span className="absolute bottom-2 right-2 font-primary text-[7px] font-medium uppercase tracking-[0.2em] text-white/50">
              Feed 01
            </span>
          </div>
          {/* viewfinder corner brackets */}
          {[
            "-left-1 -top-1 border-l border-t",
            "-right-1 -top-1 border-r border-t",
            "-left-1 -bottom-1 border-l border-b",
            "-right-1 -bottom-1 border-r border-b",
          ].map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={`pointer-events-none absolute h-3 w-3 ${pos}`}
              style={{ borderColor: NEON, opacity: 0.8 }}
            />
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-8">
          {/* single terminal line — DUSK- prefix + one growing field */}
          <label
            className={`mx-auto flex w-fit max-w-full cursor-text items-center gap-2 border-b pb-3 ${denied ? "animate-access-shake" : ""}`}
            style={{
              borderColor: lineColor,
              boxShadow: focused && !denied ? `0 10px 30px -18px ${NEON}` : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <span className="font-street text-[26px] leading-none tracking-[0.12em] text-white/45 select-none sm:text-[30px]">
              {PREFIX}
            </span>
            <span className="text-[22px] leading-none select-none" style={{ color: NEON }}>
              –
            </span>

            {/* rendered value + block caret (native caret hidden) */}
            <span className="relative flex min-w-[5ch] items-center font-street text-[26px] leading-none tracking-[0.22em] text-white sm:text-[30px]">
              {value}
              {(focused || !value) && (
                <span
                  className={`ml-0.5 inline-block h-[0.95em] w-[3px] ${reduce ? "" : "access-caret"}`}
                  style={{ background: NEON, boxShadow: `0 0 8px ${NEON}` }}
                />
              )}
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={granted}
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                name="dusk-terminal"
                aria-label="Access code"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent outline-none"
              />
            </span>
          </label>

          {/* status line */}
          <div className="mt-5 h-4 text-center">
            {denied ? (
              <p className="font-primary text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: DANGER }}>
                ✕ {error}
              </p>
            ) : granted ? (
              <p className="font-primary text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: NEON }}>
                ✓ Access granted — entering
              </p>
            ) : (
              <p className="font-primary text-[10px] font-light uppercase tracking-[0.28em] text-white/30">
                {status === "loading" ? "Decrypting…" : "Awaiting input"}
              </p>
            )}
          </div>

          {/* terminal execute button — hairline neon, subtle fill on hover */}
          <button
            type="submit"
            disabled={status === "loading" || granted || !value.trim()}
            className="group mt-6 flex w-full items-center justify-center gap-3 rounded-full border py-4 font-primary text-[12px] font-bold uppercase tracking-[0.28em] transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              borderColor: granted ? NEON : `${NEON}55`,
              color: NEON,
              background: granted ? `${NEON}1f` : "transparent",
            }}
          >
            {status === "loading" ? "Decrypting…" : granted ? "Unlocked" : "Unlock the drop"}
            {!granted && status !== "loading" && (
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center font-primary text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
          Not on the list?{" "}
          <a
            href="/"
            className="text-white/60 underline underline-offset-4 transition-colors hover:text-white"
          >
            Join the waitlist
          </a>
        </p>
      </div>
    </main>
  );
}
