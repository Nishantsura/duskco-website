"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SAFE_NEXT = /^\/(shop|collections|products)(\/|$)/;

export function AccessGate() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const nextParam = params.get("next") || "";
  const destination = SAFE_NEXT.test(nextParam) ? nextParam : "/collections/stage-one";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || status === "loading") return;
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
        setError(data.error || "That code isn't valid.");
        return;
      }
      // Hard navigation so the proxy re-reads the fresh session cookie.
      window.location.assign(destination);
    } catch {
      setStatus("error");
      setError("Something went wrong. Try again.");
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-sm text-center">
        <p className="font-primary text-[10px] uppercase tracking-[0.35em] text-white/40">
          Stage One — Invite Only
        </p>
        <h1 className="mt-6 font-display text-3xl font-light uppercase tracking-tight">
          Enter your
          <br />
          access code
        </h1>
        <p className="mt-4 font-primary text-[11px] leading-relaxed tracking-wide text-white/50">
          The drop is open only to waitlist members. Enter the code sent to your
          email to view and shop the pieces.
        </p>

        <form onSubmit={onSubmit} className="mt-10">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="ACCESS CODE"
            autoFocus
            autoCapitalize="characters"
            spellCheck={false}
            className="w-full border-b border-white/25 bg-transparent pb-3 text-center font-primary text-sm uppercase tracking-[0.3em] text-white placeholder:text-white/25 focus:border-[var(--color-accent-orange)] focus:outline-none"
          />

          {error && (
            <p className="mt-4 font-primary text-[11px] uppercase tracking-wide text-[var(--color-accent-orange)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !code.trim()}
            className="mt-8 w-full bg-white py-4 font-primary text-[11px] uppercase tracking-[0.3em] text-black transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {status === "loading" ? "Checking…" : "Unlock the drop"}
          </button>
        </form>

        <p className="mt-8 font-primary text-[10px] uppercase tracking-[0.2em] text-white/30">
          Not on the list?{" "}
          <a href="/" className="text-white/60 underline underline-offset-4 hover:text-white">
            Join the waitlist
          </a>
        </p>
      </div>
    </main>
  );
}
