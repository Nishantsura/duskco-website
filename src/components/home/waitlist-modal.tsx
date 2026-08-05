"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { capture, identifyUser } from "@/lib/analytics";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "name" | "email";

const EASE = [0.32, 0.72, 0, 1] as const;
const NEON = "#5EEAD4"; // mint — shared with the access terminal
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

// Fine static film grain (SVG, no canvas) — same texture as the access page.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const MARQUEE = ["Limited Drop", "Invite Only", "Stage One", "Wear The Difference"];

// A single glitching heading line (chromatic split, reduced-motion safe).
// Declared at module scope so it isn't recreated on every render.
function GlitchLine({ text, reduce }: { text: string; reduce: boolean | null }) {
  return (
    <span className={reduce ? "" : "glitch"} data-text={text} style={{ display: "block" }}>
      {text}
    </span>
  );
}

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const firstName = name.trim().split(" ")[0] || "";
  const stepIndex = step === "name" ? 0 : 1;
  const done = status === "success";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || done) return;
    const t = setTimeout(() => {
      (step === "name" ? nameRef : emailRef).current?.focus();
    }, 60);
    return () => clearTimeout(t);
  }, [step, open, done]);

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setErrorMsg("");
    setStatus("idle");
    setStep("email");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) return;
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
        throw new Error(data.error || "Something went wrong");
      }
      const cleanEmail = email.trim();
      identifyUser(cleanEmail, { email: cleanEmail, name: name.trim() });
      capture("waitlist_signup", { email: cleanEmail });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
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
    }, 300);
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3.5 font-primary text-[14px] tracking-[0.02em] text-white caret-[#5EEAD4] placeholder:text-white/30 outline-none transition-all focus:border-[#5EEAD4] focus:bg-white/[0.06] focus:ring-4 focus:ring-[#5EEAD4]/10";

  const primaryBtn =
    "group flex w-full items-center justify-center gap-2 rounded-xl border border-[#5EEAD4]/40 py-4 font-primary text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5EEAD4] transition-all hover:border-[#5EEAD4]/80 hover:bg-[#5EEAD4]/10 disabled:pointer-events-none disabled:border-white/10 disabled:text-white/30";

  const stepVariants = {
    initial: { opacity: 0, x: reduce ? 0 : 28 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : -28 },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Join the waitlist"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <div
              className="relative overflow-hidden rounded-[26px] bg-[#0B0B0C]"
              style={{ boxShadow: `inset 0 0 0 1px ${NEON}22, 0 40px 120px -28px rgba(0,0,0,0.8)` }}
            >
              {/* ── background stack ── */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-[0.12] blur-[90px]"
                style={{ background: NEON }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
                style={{ backgroundImage: GRAIN, backgroundSize: "140px 140px" }}
              />
              <div aria-hidden className="access-scanlines pointer-events-none absolute inset-0 opacity-70" />

              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="relative z-10 px-8 pt-8 pb-6">
                {/* kicker + step counter (no progress bar) */}
                <div className="flex items-center justify-between pr-8">
                  <span className="font-primary text-[9px] font-semibold uppercase tracking-[0.32em] text-white/40">
                    <span style={{ color: NEON }}>/</span> Stage One — Waitlist
                  </span>
                  {!done && (
                    <span className="font-street text-[15px] leading-none tracking-[0.06em] text-white/30 tabular-nums">
                      0{stepIndex + 1}
                      <span className="text-white/15"> / 02</span>
                    </span>
                  )}
                </div>

                {/* body */}
                <div className="mt-7 min-h-[188px]">
                  <AnimatePresence mode="wait" initial={false}>
                    {done ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center pt-2 text-center"
                      >
                        <motion.div
                          initial={reduce ? false : { scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.05 }}
                          className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                          style={{ background: NEON, boxShadow: `0 0 30px -4px ${NEON}` }}
                        >
                          <Check size={26} strokeWidth={3} className="text-black" />
                        </motion.div>
                        <h2 className="font-street text-[40px] leading-[0.9] tracking-[0.02em] text-white uppercase" style={{ textShadow: `0 0 26px ${NEON}44` }}>
                          You&apos;re in.
                        </h2>
                        <p className="mt-3 max-w-[16rem] font-primary text-[13px] font-light leading-relaxed tracking-[0.02em] text-white/50">
                          Locked in, {firstName}. Your access code lands in your
                          inbox before the drop.
                        </p>
                        <button
                          onClick={handleClose}
                          className="mt-6 font-primary text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 underline underline-offset-4 transition-colors hover:text-white"
                        >
                          Back to the site
                        </button>
                      </motion.div>
                    ) : (
                      <div key="form">
                        <h2 className="font-street text-[40px] leading-[0.88] tracking-[0.02em] text-white uppercase" style={{ textShadow: `0 0 26px ${NEON}33` }}>
                          {step === "name" ? (
                            <>
                              <GlitchLine text="Join The" reduce={reduce} />
                              <GlitchLine text="Waitlist" reduce={reduce} />
                            </>
                          ) : (
                            <>
                              <GlitchLine text={`Hey${firstName ? "," : ""}`} reduce={reduce} />
                              <GlitchLine text={firstName || "there"} reduce={reduce} />
                            </>
                          )}
                        </h2>

                        <AnimatePresence mode="wait" initial={false}>
                          {step === "name" ? (
                            <motion.div
                              key="step-name"
                              variants={stepVariants}
                              initial="initial"
                              animate="center"
                              exit="exit"
                              transition={{ duration: 0.24, ease: EASE }}
                            >
                              <label htmlFor="wl-name" className="mt-5 block font-primary text-[12px] font-light tracking-[0.03em] text-white/45">
                                First, what should we call you?
                              </label>
                              <form onSubmit={handleNameSubmit} className="mt-3 flex flex-col gap-3">
                                <input
                                  id="wl-name"
                                  ref={nameRef}
                                  type="text"
                                  placeholder="Your name"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  autoComplete="given-name"
                                  required
                                  className={inputClass}
                                />
                                <button type="submit" disabled={!name.trim()} className={primaryBtn}>
                                  Continue
                                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                                </button>
                              </form>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="step-email"
                              variants={stepVariants}
                              initial="initial"
                              animate="center"
                              exit="exit"
                              transition={{ duration: 0.24, ease: EASE }}
                            >
                              <label htmlFor="wl-email" className="mt-5 block font-primary text-[12px] font-light tracking-[0.03em] text-white/45">
                                Drop your email — first access to every drop.
                              </label>
                              <form onSubmit={handleEmailSubmit} className="mt-3 flex flex-col gap-3">
                                <div className="relative">
                                  <input
                                    id="wl-email"
                                    ref={emailRef}
                                    type="email"
                                    placeholder="you@email.com"
                                    value={email}
                                    onChange={(e) => {
                                      setEmail(e.target.value);
                                      if (status === "error") { setStatus("idle"); setErrorMsg(""); }
                                    }}
                                    required
                                    className={`${inputClass} pr-11`}
                                  />
                                  <AnimatePresence>
                                    {isEmail(email) && (
                                      <motion.span
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full"
                                        style={{ background: NEON, boxShadow: `0 0 12px -2px ${NEON}` }}
                                      >
                                        <Check size={13} strokeWidth={3} className="text-black" />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </div>

                                {status === "error" && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-1 font-primary text-[12px]"
                                    style={{ color: "#F87171" }}
                                  >
                                    {errorMsg}
                                  </motion.p>
                                )}

                                <div className="mt-1 flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => { setStatus("idle"); setErrorMsg(""); setStep("name"); }}
                                    aria-label="Back"
                                    className="flex h-[52px] shrink-0 items-center justify-center rounded-xl border border-white/15 px-4 text-white/50 transition-colors hover:border-[#5EEAD4]/60 hover:text-[#5EEAD4]"
                                  >
                                    <ArrowLeft size={16} />
                                  </button>
                                  <button type="submit" disabled={status === "loading" || !isEmail(email)} className={primaryBtn}>
                                    {status === "loading" ? (
                                      <span className="flex items-center gap-1.5">
                                        Joining
                                        <span className="flex gap-0.5">
                                          {[0, 1, 2].map((i) => (
                                            <motion.span
                                              key={i}
                                              className="h-1 w-1 rounded-full"
                                              style={{ background: NEON }}
                                              animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }}
                                              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                                            />
                                          ))}
                                        </span>
                                      </span>
                                    ) : (
                                      "Join the drop"
                                    )}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* live marquee footer — pulsing blip separators */}
              <div className="relative z-10 overflow-hidden border-t border-white/10 py-2.5">
                <div className={`flex w-max whitespace-nowrap ${reduce ? "" : "animate-marquee"}`}>
                  {[0, 1].map((dup) => (
                    <span key={dup} className="flex items-center" aria-hidden={dup === 1}>
                      {MARQUEE.map((w) => (
                        <span key={w} className="flex items-center font-primary text-[9px] font-semibold uppercase tracking-[0.24em] text-white/30">
                          {w}
                          <motion.span
                            className="mx-3 inline-block h-[5px] w-[5px] rounded-[1px]"
                            style={{ background: NEON }}
                            animate={reduce ? {} : { opacity: [0.3, 1, 0.3], scale: [0.8, 1.35, 0.8] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
