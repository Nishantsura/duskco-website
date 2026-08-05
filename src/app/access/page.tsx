import type { Metadata } from "next";
import { Suspense } from "react";
import { AccessGate } from "@/components/access/access-gate";

export const metadata: Metadata = {
  title: "Access — DUSK&CO",
  description: "Enter your access code to view the Stage One drop.",
  robots: { index: false, follow: false },
};

export default function AccessPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-bg" />}>
      <AccessGate />
    </Suspense>
  );
}
