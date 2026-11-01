"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GateBar, GatePhoto } from "@/components/home/gate-frame";

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
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-pearl px-5 py-28 text-center font-mono uppercase text-graphite">
      <GatePhoto />
      <GateBar right="Stage 01" />

      <div className="relative z-10 w-full max-w-xs">
        <h1 className="gate-title">Enter access code</h1>
        <p className="gate-label mt-6">From your invitation</p>

        <form onSubmit={onSubmit} className="mt-14" noValidate>
          <label className="block">
            <span className="sr-only">Access code</span>
            <span
              className={`gate-field flex items-center justify-center gap-3 ${
                denied ? "!border-graphite" : ""
              }`}
            >
              <span className="select-none opacity-50">{PREFIX}</span>
              <span aria-hidden className="h-4 w-px bg-graphite/35" />
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
                className="h-full w-[10ch] min-w-0 bg-transparent tracking-[0.12em] outline-none placeholder:text-graphite/35"
              />
            </span>
          </label>

          <p
            className="gate-label mt-4 min-h-[1.4em] text-graphite"
            role={denied ? "alert" : undefined}
          >
            {denied ? error : granted ? "Accepted" : ""}
          </p>

          <button
            type="submit"
            disabled={!value || status === "loading" || granted}
            className="gate-action gate-action-primary mt-10"
          >
            {status === "loading" ? "Checking" : granted ? "Opening" : "Enter"}
          </button>
        </form>

        <Link href="/?join" className="gate-action gate-label mt-16 inline-block">
          No code · Join the waitlist
        </Link>
      </div>
    </main>
  );
}
