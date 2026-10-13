"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HERO_IMAGE } from "@/components/home/hero-section";

const SAFE_NEXT = /^\/(shop|collections|products)(\/|$)/;
const PREFIX = "DUSK";

// Uppercase, strip a pasted DUSK prefix and anything that isn't a letter/digit.
function clean(raw: string) {
  return raw
    .toUpperCase()
    .replace(new RegExp(`^${PREFIX}[-\\s]?`), "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

export function AccessGate() {
  const params = useSearchParams();

  // Pre-fill from the emailed link (/access?code=DUSK-XXXXXX).
  const [value, setValue] = useState(() => clean(params.get("code") || ""));
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "granted">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const nextParam = params.get("next") || "";
  const destination = SAFE_NEXT.test(nextParam) ? nextParam : "/collections/stage-one";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function onChange(raw: string) {
    setValue(clean(raw));
    if (status === "error") {
      setStatus("idle");
      setError("");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value || status === "loading" || status === "granted") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/access/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: `${PREFIX}-${value}` }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "That code isn't valid.");
        return;
      }
      setStatus("granted");
      window.location.assign(destination);
    } catch {
      setStatus("error");
      setError("Connection lost. Please try again.");
    }
  }

  const denied = status === "error";
  const granted = status === "granted";

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-bg px-5 py-28 text-ink">
      {/* The hero photograph, blurred under a veil — same feel as the waitlist */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      />
      <div aria-hidden className="absolute inset-0 bg-bg/75" />

      <div className="relative z-10 w-full max-w-sm">
        <p className="t-label text-ink-muted">Access</p>
        <h1 className="t-title mt-4">Enter your access code</h1>
        <p className="t-body mt-4 text-ink-muted">
          Stage One is open to waitlist members. Use the code from your invitation email.
        </p>

        <form onSubmit={onSubmit} className="mt-10" noValidate>
          <label className="block">
            <span className="t-label text-ink-muted">Access code</span>
            <span
              className={`mt-1 flex h-11 items-center gap-3 border-b transition-colors ${
                denied ? "border-danger" : "border-line-strong focus-within:border-ink"
              }`}
            >
              <span className="select-none text-[14px] tracking-[0.12em] text-ink-faint">
                {PREFIX}
              </span>
              <span aria-hidden className="h-4 w-px bg-line-strong" />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={granted}
                placeholder="XXXXXX"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                name="dusk-access-code"
                aria-label="Access code"
                aria-invalid={denied}
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] tracking-[0.12em] text-ink outline-none placeholder:text-ink-faint"
              />
            </span>
          </label>

          <p
            className={`t-body mt-3 min-h-[1.65em] ${denied ? "text-danger" : "text-ink-muted"}`}
            role={denied ? "alert" : undefined}
          >
            {denied ? error : granted ? "Code accepted. Opening Stage One." : ""}
          </p>

          <button
            type="submit"
            disabled={!value || status === "loading" || granted}
            className="btn btn-primary mt-4 w-full"
          >
            {status === "loading" ? "Checking" : granted ? "Opening" : "Continue"}
          </button>
        </form>

        <p className="t-body mt-8 text-ink-muted">
          No code yet?{" "}
          <Link href="/?join" className="link text-ink">
            Join the waitlist
          </Link>
        </p>
      </div>
    </main>
  );
}
