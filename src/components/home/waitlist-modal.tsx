"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { capture, identifyUser } from "@/lib/analytics";
import { CutOn, CutText, GateBar, cutEnd } from "./gate-frame";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "name" | "email" | "done";

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

// Each step's question cuts in fast; the field is up almost at once so typing
// never waits on the animation.
const Q_START = 0.1;
const Q_STEP = 0.03;
const FIELD_AT = 0.25;

const ASK_NAME = "What do we call you";
const ASK_EMAIL = "Where does the code go";

const DONE_LABEL = "Stage 01 · Confirmed";
const DONE_TITLE = "Your name is on the list";

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const firstName = name.trim().split(" ")[0] || "";
  const hasName = name.trim().length > 0;
  const canSubmit = hasName && isEmail(email) && status !== "loading";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toEmail(e: React.FormEvent) {
    e.preventDefault();
    if (hasName) setStep("email");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong. Try again.");
      }
      const cleanEmail = email.trim();
      identifyUser(cleanEmail, { email: cleanEmail, name: name.trim() });
      capture("waitlist_signup", { email: cleanEmail });
      setStatus("idle");
      setStep("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("name");
      setName("");
      setEmail("");
      setStatus("idle");
      setErrorMsg("");
    }, 400);
  }

  function clearError() {
    if (status === "error") {
      setStatus("idle");
      setErrorMsg("");
    }
  }

  return (
    // initial={false}: when the page loads already open (/?join) the form is
    // server rendered visible instead of waiting on the fade.
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Join the waitlist"
          className="fixed inset-0 z-[60] overflow-y-auto bg-pearl/85 font-mono uppercase text-graphite backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <GateBar
            right={
              <button onClick={handleClose} className="gate-action">
                Close
              </button>
            }
          />

          <div className="flex min-h-full items-center justify-center px-5 py-28 text-center">
            {/* Keyed by step: each step mounts fresh, so its cut replays. The
                old step leaves in one frame — a hard cut, no slide. */}
            <div key={step} className="w-full max-w-xs">
              {step === "name" && (
                <>
                  <CutOn at={0}>
                    <p className="gate-label tabular-nums">01 / 02</p>
                  </CutOn>
                  <CutText as="h2" text={ASK_NAME} start={Q_START} step={Q_STEP} className="gate-title mt-6" />

                  <form onSubmit={toEmail} className="mt-14" noValidate>
                    <CutOn at={FIELD_AT}>
                      <label className="block">
                        <span className="sr-only">Name</span>
                        <input
                          autoFocus
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="given-name"
                          placeholder="Name"
                          required
                          className="gate-field"
                        />
                      </label>
                    </CutOn>

                    <CutOn at={cutEnd(ASK_NAME, Q_START, Q_STEP)} className="mt-12">
                      <button type="submit" disabled={!hasName} className="gate-action gate-action-primary">
                        Next
                      </button>
                    </CutOn>
                  </form>

                  <CutOn at={cutEnd(ASK_NAME, Q_START, Q_STEP)} className="mt-16">
                    <Link href="/access" className="gate-action gate-label">
                      Have a code · Enter it
                    </Link>
                  </CutOn>
                </>
              )}

              {step === "email" && (
                <>
                  <CutOn at={0}>
                    <p className="gate-label tabular-nums">02 / 02</p>
                  </CutOn>
                  <CutText as="h2" text={ASK_EMAIL} start={Q_START} step={Q_STEP} className="gate-title mt-6" />

                  <form onSubmit={handleSubmit} className="mt-14" noValidate>
                    <CutOn at={FIELD_AT}>
                      <label className="block">
                        <span className="sr-only">Email</span>
                        <input
                          autoFocus
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearError();
                          }}
                          autoComplete="email"
                          placeholder="Email"
                          required
                          className="gate-field"
                        />
                      </label>
                    </CutOn>

                    <p
                      className="gate-label mt-4 min-h-[1.4em] text-graphite"
                      role={status === "error" ? "alert" : undefined}
                    >
                      {status === "error" ? errorMsg : ""}
                    </p>

                    <CutOn
                      at={cutEnd(ASK_EMAIL, Q_START, Q_STEP)}
                      className="mt-8 flex items-center justify-center gap-12"
                    >
                      <button type="button" onClick={() => setStep("name")} className="gate-action">
                        Back
                      </button>
                      <button type="submit" disabled={!canSubmit} className="gate-action gate-action-primary">
                        {status === "loading" ? "Joining" : "Join"}
                      </button>
                    </CutOn>
                  </form>
                </>
              )}

              {step === "done" && (
                <Confirmation firstName={firstName} email={email.trim()} onClose={handleClose} />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- you are on the list ---------- */

// The confirmation plays as a short sequence: the label and headline cut in,
// then a pass with their name on it, then the terms, one line at a time.
function Confirmation({
  firstName,
  email,
  onClose,
}: {
  firstName: string;
  email: string;
  onClose: () => void;
}) {
  const titleStart = 0.35;
  const passAt = cutEnd(DONE_TITLE, titleStart, 0.04) + 0.1;
  const nameStart = passAt + 0.15;
  const name = firstName || "Guest";
  const rowsAt = cutEnd(name, nameStart, 0.06);
  const linesAt = rowsAt + 0.6;

  const rows: [string, React.ReactNode][] = [
    ["Status", "On the list"],
    ["Access", "Code to follow"],
    ["Sent to", <span key="e" className="normal-case">{email}</span>],
  ];

  return (
    <>
      <CutText as="p" text={DONE_LABEL} start={0.05} step={0.02} className="gate-label" />
      <CutText as="h2" text={DONE_TITLE} start={titleStart} step={0.04} className="gate-title mt-6" />

      {/* The pass */}
      <CutOn at={passAt} className="mt-12 border border-graphite/25 px-5 py-5 text-left">
        <div className="flex items-center justify-between">
          <span className="font-logo text-[11px] font-bold tracking-[0.08em]">DUSK&amp;CO</span>
          <span className="gate-label">Stage 01</span>
        </div>

        <CutText
          as="p"
          text={name}
          start={nameStart}
          step={0.06}
          className="mt-10 truncate text-[24px] font-medium tracking-[0.12em] sm:text-[28px]"
        />

        <dl className="mt-8 border-t border-graphite/15">
          {rows.map(([k, v], i) => (
            <CutOn key={k} at={rowsAt + i * 0.15}>
              <div className="flex items-baseline justify-between gap-4 border-b border-graphite/15 py-2.5">
                <dt className="gate-label">{k}</dt>
                <dd className="truncate text-[12px] tracking-[0.1em]">{v}</dd>
              </div>
            </CutOn>
          ))}
        </dl>
      </CutOn>

      <div className="mt-10 space-y-2">
        <CutOn at={linesAt}>
          <p className="gate-label">Your personal code arrives before the doors open.</p>
        </CutOn>
        <CutOn at={linesAt + 0.5}>
          <p className="gate-label text-graphite">Until then, say nothing.</p>
        </CutOn>
      </div>

      <CutOn at={linesAt + 1.1} className="mt-14">
        <button onClick={onClose} className="gate-action gate-action-primary">
          Close
        </button>
      </CutOn>
    </>
  );
}
