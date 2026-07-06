"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { capture, identifyUser } from "@/lib/analytics";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "name" | "email";

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const firstName = name.trim().split(" ")[0] || "";

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setErrorMsg("");
    setStatus("idle");
    setStep("email");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

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
    "w-full rounded-[0.2rem] border border-neutral-200 bg-neutral-50 px-5 py-3.5 font-primary text-[13px] tracking-[0.03em] text-black placeholder:text-neutral-400 outline-none focus:border-black transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-white px-8 py-10">
              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
              >
                <X size={16} />
              </button>

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-4 text-center"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h2 className="font-street text-[36px] leading-none tracking-[0.02em] text-black uppercase">
                      You&apos;re on the list.
                    </h2>
                    <p className="mt-3 font-primary text-[13px] font-light tracking-[0.04em] text-neutral-500">
                      Thanks, {firstName}. We&apos;ll be in touch before the drop.
                      <br />Wear the difference.
                    </p>
                  </motion.div>
                ) : (
                  <div key="form">
                    <h2 className="font-street text-[42px] leading-none tracking-[0.02em] text-black uppercase">
                      Join The<br />Waitlist
                    </h2>

                    <AnimatePresence mode="wait" initial={false}>
                      {step === "name" ? (
                        <motion.div
                          key="step-name"
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -24 }}
                          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                        >
                          <p className="mt-5 font-primary text-[12px] font-light tracking-[0.04em] text-neutral-500">
                            First, what should we call you?
                          </p>
                          <form onSubmit={handleNameSubmit} className="mt-4 flex flex-col gap-3">
                            <input
                              type="text"
                              placeholder="Your name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              autoFocus
                              required
                              className={inputClass}
                            />
                            <button
                              type="submit"
                              disabled={!name.trim()}
                              className="mt-1 flex w-full items-center justify-center gap-2 rounded-[0.2rem] bg-black py-4 font-primary text-[11px] font-medium tracking-[0.12em] text-white uppercase transition-all hover:bg-[#FF4500] disabled:opacity-40"
                            >
                              Continue
                              <ArrowRight size={14} />
                            </button>
                          </form>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="step-email"
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -24 }}
                          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                        >
                          <p className="mt-5 font-primary text-[12px] font-light tracking-[0.04em] text-neutral-500">
                            Nice to meet you, {firstName}. Drop your email to be first on every drop.
                          </p>
                          <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-3">
                            <input
                              type="email"
                              placeholder="Your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              autoFocus
                              required
                              className={inputClass}
                            />

                            {status === "error" && (
                              <p className="px-1 font-primary text-[12px] text-red-500">{errorMsg}</p>
                            )}

                            <div className="mt-1 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setStatus("idle");
                                  setErrorMsg("");
                                  setStep("name");
                                }}
                                aria-label="Back"
                                className="flex h-[52px] shrink-0 items-center justify-center rounded-[0.2rem] border border-neutral-200 px-4 text-neutral-500 transition-colors hover:border-black hover:text-black"
                              >
                                <ArrowLeft size={16} />
                              </button>
                              <button
                                type="submit"
                                disabled={status === "loading" || !email.trim()}
                                className="flex-1 rounded-[0.2rem] bg-black py-4 font-primary text-[11px] font-medium tracking-[0.12em] text-white uppercase transition-all hover:bg-[#FF4500] disabled:opacity-40"
                              >
                                {status === "loading" ? "Joining..." : "Join Now"}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
