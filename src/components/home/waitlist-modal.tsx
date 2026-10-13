"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { capture, identifyUser } from "@/lib/analytics";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const firstName = name.trim().split(" ")[0] || "";
  const done = status === "success";
  const canSubmit = name.trim().length > 0 && isEmail(email) && status !== "loading";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => nameRef.current?.focus(), 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      const cleanEmail = email.trim();
      identifyUser(cleanEmail, { email: cleanEmail, name: name.trim() });
      capture("waitlist_signup", { email: cleanEmail });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
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
          className="fixed inset-0 z-[60] overflow-y-auto bg-bg/75 text-ink backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <button
            onClick={handleClose}
            className="t-label absolute right-5 top-4 z-10 transition-opacity hover:opacity-60 sm:right-10"
          >
            Close
          </button>

          <div className="flex min-h-full items-center justify-center px-5 py-24">
            <div className="w-full max-w-sm">
              <p className="t-label text-ink-muted">Waitlist</p>

              {done ? (
                <>
                  <h2 className="t-title mt-4">You&apos;re on the list</h2>
                  <p className="t-body mt-4 text-ink-muted">
                    Thank you{firstName ? `, ${firstName}` : ""}. Your access code will be sent to{" "}
                    <span className="text-ink">{email.trim()}</span> before the drop opens.
                  </p>
                  <button onClick={handleClose} className="btn btn-outline mt-10 w-full">
                    Close
                  </button>
                </>
              ) : (
                <>
                  <h2 className="t-title mt-4">Join the waitlist</h2>
                  <p className="t-body mt-4 text-ink-muted">
                    Stage One is invite only. Leave your name and email and we will send your
                    personal access code before the drop opens.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6" noValidate>
                    <label className="block">
                      <span className="t-label text-ink-muted">Name</span>
                      <input
                        ref={nameRef}
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          clearError();
                        }}
                        autoComplete="given-name"
                        required
                        className="field mt-1"
                      />
                    </label>
                    <label className="block">
                      <span className="t-label text-ink-muted">Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError();
                        }}
                        autoComplete="email"
                        required
                        className="field mt-1"
                      />
                    </label>

                    {status === "error" && (
                      <p className="t-body text-danger" role="alert">
                        {errorMsg}
                      </p>
                    )}

                    <button type="submit" disabled={!canSubmit} className="btn btn-primary mt-4 w-full">
                      {status === "loading" ? "Joining" : "Join"}
                    </button>
                  </form>

                  <p className="t-body mt-8 text-ink-muted">
                    Already have a code?{" "}
                    <Link href="/access" className="link text-ink">
                      Enter it here
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
