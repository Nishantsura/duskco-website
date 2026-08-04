"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { setAnalyticsConsent } from "@/lib/analytics";

const CONSENT_KEY = "duskco-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        // Small delay so it doesn't fight the page's entrance animations.
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage unavailable (private mode) — don't nag.
    }
  }, []);

  function choose(value: "accepted" | "declined") {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignore write failures
    }
    setAnalyticsConsent(value === "accepted");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie notice"
          className="fixed inset-x-3 bottom-3 z-[55] mx-auto max-w-[520px] rounded-2xl bg-surface px-5 py-4 shadow-2xl border border-line sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
        >
          <p className="font-primary text-[12px] font-light leading-[1.6] tracking-[0.02em] text-ink-muted">
            We use essential cookies to keep your bag working, plus analytics to
            understand how the store is used. See our{" "}
            <Link
              href="/policies/privacy"
              className="text-ink underline underline-offset-2 transition-colors hover:text-ink-muted"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => choose("declined")}
              className="rounded-full px-3 py-1.5 font-primary text-[11px] font-medium tracking-[0.08em] text-ink-faint uppercase transition-colors hover:text-ink"
            >
              Decline
            </button>
            <button
              onClick={() => choose("accepted")}
              className="rounded-full bg-ink px-4 py-1.5 font-primary text-[11px] font-bold tracking-[0.08em] text-bg uppercase transition-opacity hover:opacity-80"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
