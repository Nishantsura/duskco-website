"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";

const SAFE_NEXT = /^\/(shop|collections|products)(\/|$)/;

const PREFIX = "DUSK";
const NEON = "var(--accent)";
const DANGER = "#F87171";

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
      setError("SIGNAL LOST. TRY AGAIN");
    }
  }

  const denied = status === "error";
  const granted = status === "granted";
  const lineColor = denied ? DANGER : focused || value ? NEON : "var(--line-strong)";

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-end overflow-hidden bg-bg px-6 pb-24 pt-32 text-ink">
      {/* ── Fullscreen background video ── */}
      <video
        src="/videos/15609235_3840_2160_25fps.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover [filter:grayscale(0.2)_contrast(1.04)]"
      />
      {/* ── Cinematic grade — edge-anchored, matches the waitlist modal ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-bg/15" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[92%]"
        style={{
          background:
            "linear-gradient(to top, var(--bg) 0%, color-mix(in srgb, var(--bg) 92%, transparent) 24%, color-mix(in srgb, var(--bg) 62%, transparent) 50%, color-mix(in srgb, var(--bg) 24%, transparent) 74%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--bg) 55%, transparent), transparent)" }}
      />
      {/* faint dusk↔dawn tint for brand mood */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light"
        style={{ background: "var(--accent-gradient)" }}
      />

      {/* ── Content — anchored into the graded lower zone ── */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <p className="flex items-center gap-2.5 font-primary text-[10px] font-semibold uppercase tracking-[0.34em] text-ink-muted [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]">
          <span
            aria-hidden
            className={`inline-block h-[5px] w-[5px] rounded-full ${reduce ? "" : "access-caret"}`}
            style={{ background: NEON, boxShadow: `0 0 8px ${NEON}` }}
          />
          Invite Only Terminal
        </p>

        <h1
          className="mt-6 font-street text-[clamp(52px,11vw,96px)] leading-[0.86] tracking-[0.015em] text-ink uppercase"
          style={{ textShadow: "0 2px 28px color-mix(in srgb, var(--bg) 70%, transparent)" }}
        >
          Enter Your
          <br />
          Access Code
        </h1>

        <p
          className="mt-5 max-w-xs font-primary text-[13px] font-light leading-relaxed tracking-[0.02em] text-ink-muted"
          style={{ textShadow: "0 1px 14px color-mix(in srgb, var(--bg) 80%, transparent)" }}
        >
          The drop is sealed to waitlist members. Punch in the code sent to your inbox to breach the vault.
        </p>

        <form onSubmit={onSubmit} className="mt-10 w-full">
          {/* single terminal line — DUSK prefix + one growing field */}
          <label
            className={`mx-auto flex w-fit max-w-full cursor-text items-center gap-2.5 border-b pb-3 ${denied ? "animate-access-shake" : ""}`}
            style={{
              borderColor: lineColor,
              boxShadow: focused && !denied ? `0 10px 30px -18px ${NEON}` : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <span className="font-street text-[30px] leading-none tracking-[0.12em] text-ink-faint select-none sm:text-[34px]">
              {PREFIX}
            </span>
            <span className="text-[20px] leading-none select-none" style={{ color: NEON }}>
              ·
            </span>

            {/* rendered value + block caret (native caret hidden) */}
            <span className="relative flex min-w-[5ch] items-center font-street text-[30px] leading-none tracking-[0.22em] text-ink sm:text-[34px]">
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
                ✓ Access granted. Entering
              </p>
            ) : (
              <p className="font-primary text-[10px] font-light uppercase tracking-[0.28em] text-ink-faint">
                {status === "loading" ? "Decrypting…" : "Awaiting input"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading" || granted || !value.trim()}
            className="dusk-cta group mx-auto mt-7 flex items-center justify-center gap-2.5 rounded-full border px-10 py-4 font-primary text-[12px] font-bold uppercase tracking-[0.16em] text-ink transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={
              granted
                ? { background: `color-mix(in srgb, var(--accent) 12%, transparent)` }
                : undefined
            }
          >
            {status === "loading" ? "Decrypting…" : granted ? "Unlocked" : "Unlock the drop"}
            {!granted && status !== "loading" && (
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            )}
          </button>
        </form>

        <p className="mt-8 font-primary text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          Not on the list?{" "}
          <a
            href="/"
            className="text-ink underline underline-offset-4 transition-colors hover:text-ink-muted"
          >
            Join the waitlist
          </a>
        </p>
      </div>
    </main>
  );
}
