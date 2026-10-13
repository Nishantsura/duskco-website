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
          className="fixed inset-x-3 bottom-3 z-[55] mx-auto max-w-[480px] border border-line bg-bg px-5 py-4 text-ink sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="t-body text-ink-muted">
            We use essential cookies to keep your bag working, plus analytics to
            understand how the store is used. See our{" "}
            <Link
              href="/policies/privacy"
              className="link text-ink"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => choose("declined")}
              className="btn h-9 px-4 text-ink-muted hover:text-ink"
            >
              Decline
            </button>
            <button
              onClick={() => choose("accepted")}
              className="btn btn-primary h-9 px-5"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
