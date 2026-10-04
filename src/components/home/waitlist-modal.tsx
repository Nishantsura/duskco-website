"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { capture, identifyUser } from "@/lib/analytics";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

const EASE = [0.32, 0.72, 0, 1] as const;
const ACCENT = "var(--accent)";
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

type Step = "name" | "email";

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
    }, 80);
    return () => clearTimeout(t);
  }, [open, done, step]);

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("idle");
    setErrorMsg("");
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
    "w-full border-0 border-b border-line-strong bg-transparent px-1 pb-3 pt-2 font-primary text-[15px] tracking-[0.02em] text-ink caret-accent placeholder:text-ink-faint outline-none transition-colors duration-300 focus:border-accent";

  const ctaClass =
    "dusk-cta group flex items-center justify-center gap-2.5 rounded-full border px-10 py-4 font-primary text-[12px] font-bold uppercase tracking-[0.16em] text-ink transition-all disabled:cursor-not-allowed disabled:opacity-40";

  const headingClass =
    "font-street text-[clamp(56px,12vw,104px)] leading-[0.86] tracking-[0.015em] text-ink uppercase";
  const headingStyle = { textShadow: "0 2px 28px color-mix(in srgb, var(--bg) 70%, transparent)" };
  const subStyle = { textShadow: "0 1px 14px color-mix(in srgb, var(--bg) 80%, transparent)" };
  const subClass =
    "mt-5 max-w-xs font-primary text-[13px] font-light leading-relaxed tracking-[0.03em] text-ink-muted";

  const stepVariants = {
    initial: { opacity: 0, x: reduce ? 0 : 26 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : -26 },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Join the waitlist"
          className="fixed inset-0 z-[60] overflow-hidden bg-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {/* ── Fullscreen background video ── */}
          <video
            src="/videos/15609235_3840_2160_25fps.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover [filter:grayscale(0.2)_contrast(1.04)]"
          />
          {/* ── Cinematic grade ──────────────────────────────────────────────
              Edge-anchored, not a floating blob: the top and sides of the
              video stay fully detailed, while a bottom-up gradient builds a
              solid legibility bed under the lockup. A whisper-thin global tint
              + top fade unify the frame and seat the kicker/close. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-bg/15" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[88%]"
            style={{
              background:
                "linear-gradient(to top, var(--bg) 0%, color-mix(in srgb, var(--bg) 90%, transparent) 20%, color-mix(in srgb, var(--bg) 60%, transparent) 46%, color-mix(in srgb, var(--bg) 22%, transparent) 70%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32"
            style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--bg) 55%, transparent), transparent)" }}
          />
          {/* faint dusk↔dawn tint for brand mood — barely there, keeps detail */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light"
            style={{ background: "var(--accent-gradient)" }}
          />

          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink md:right-8 md:top-8 [filter:drop-shadow(0_1px_4px_rgba(0,0,0,0.5))]"
          >
            <X size={22} strokeWidth={1.5} />
          </button>

          {/* kicker — top center */}
          <div className="absolute inset-x-0 top-7 z-10 flex justify-center md:top-9">
            <span className="flex items-center gap-2.5 font-primary text-[10px] font-semibold uppercase tracking-[0.34em] text-ink-muted [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]">
              <motion.span
                aria-hidden
                className="inline-block h-[5px] w-[5px] rounded-full"
                style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
                animate={reduce ? {} : { opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
              />
              Incoming · Stage One
            </span>
          </div>

          {/* ── Content — anchored into the graded lower zone ── */}
          <div className="relative z-10 flex min-h-full flex-col items-center justify-end px-6 pb-16 pt-28 md:pb-20">
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex w-full max-w-md flex-col items-center text-center"
                >
                  <motion.div
                    initial={reduce ? false : { scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.05 }}
                    className="mb-7 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: ACCENT, boxShadow: `0 0 36px -4px ${ACCENT}` }}
                  >
                    <Check size={30} strokeWidth={3} className="text-accent-ink" />
                  </motion.div>
                  <h2 className="font-street text-[clamp(56px,11vw,96px)] leading-[0.9] tracking-[0.015em] text-ink uppercase">
                    You&apos;re in.
                  </h2>
                  <p className="mt-4 max-w-xs font-primary text-[14px] font-light leading-relaxed tracking-[0.02em] text-ink-muted">
                    Locked in, {firstName}. Your access code lands in your inbox before the drop.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-8 font-primary text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-faint underline underline-offset-[6px] transition-colors hover:text-ink"
                  >
                    Back to the site
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="w-full max-w-md"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {step === "name" ? (
                      /* ── Step 1 — name ── */
                      <motion.div
                        key="step-name"
                        variants={stepVariants}
                        initial="initial"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex w-full flex-col items-center text-center"
                      >
                        <h2 className={headingClass} style={headingStyle}>
                          Join The
                          <br />
                          Waitlist
                        </h2>
                        <p className={subClass} style={subStyle}>
                          Invite only. First access to every Stage One drop.
                        </p>

                        <form onSubmit={handleNameSubmit} className="mt-10 flex w-full flex-col gap-7">
                          <input
                            ref={nameRef}
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="given-name"
                            required
                            className={inputClass}
                          />
                          <button type="submit" disabled={!name.trim()} className={`${ctaClass} mt-2 w-full`}>
                            Next
                            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                          </button>
                        </form>
                      </motion.div>
                    ) : (
                      /* ── Step 2 — email ── */
                      <motion.div
                        key="step-email"
                        variants={stepVariants}
                        initial="initial"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex w-full flex-col items-center text-center"
                      >
                        <h2 className={headingClass} style={headingStyle}>
                          Hi, {firstName || "there"}
                        </h2>
                        <p className={subClass} style={subStyle}>
                          Add your email and you&apos;re locked in for first access.
                        </p>

                        <form onSubmit={handleEmailSubmit} className="mt-10 flex w-full flex-col gap-7">
                          <div className="relative">
                            <input
                              ref={emailRef}
                              type="email"
                              placeholder="you@email.com"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (status === "error") { setStatus("idle"); setErrorMsg(""); }
                              }}
                              autoComplete="email"
                              required
                              className={`${inputClass} pr-8`}
                            />
                            <AnimatePresence>
                              {isEmail(email) && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full"
                                  style={{ background: ACCENT }}
                                >
                                  <Check size={12} strokeWidth={3} className="text-accent-ink" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>

                          {status === "error" && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="-mt-3 font-primary text-[12px]"
                              style={{ color: "#F87171" }}
                            >
                              {errorMsg}
                            </motion.p>
                          )}

                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => { setStatus("idle"); setErrorMsg(""); setStep("name"); }}
                              aria-label="Back"
                              className="dusk-cta flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border text-ink-muted transition-colors hover:text-ink"
                            >
                              <ArrowLeft size={16} />
                            </button>
                            <button
                              type="submit"
                              disabled={status === "loading" || !isEmail(email)}
                              className={`${ctaClass} flex-1`}
                            >
                              {status === "loading" ? (
                                <span className="flex items-center gap-1.5">
                                  Joining
                                  <span className="flex gap-0.5">
                                    {[0, 1, 2].map((i) => (
                                      <motion.span
                                        key={i}
                                        className="h-1 w-1 rounded-full"
                                        style={{ background: ACCENT }}
                                        animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                                      />
                                    ))}
                                  </span>
                                </span>
                              ) : (
                                <>
                                  Join the drop
                                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
