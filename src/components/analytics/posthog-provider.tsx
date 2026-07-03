"use client";

import { Suspense, useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { capture, markAnalyticsInitialized } from "@/lib/analytics";

const CONSENT_KEY = "duskco-cookie-consent";

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    // No key yet (or already initialized) → run as a no-op.
    if (!key) return;
    if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;

    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // handled manually for the App Router
      capture_pageleave: true,
      // Don't track until the visitor accepts cookies.
      opt_out_capturing_by_default: true,
    });
    markAnalyticsInitialized();

    // Honour a previously stored consent choice.
    try {
      if (localStorage.getItem(CONSENT_KEY) === "accepted") {
        posthog.opt_in_capturing();
      }
    } catch {
      // localStorage unavailable — stay opted out
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
