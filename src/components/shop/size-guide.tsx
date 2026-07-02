"use client";

import { useState, useEffect } from "react";
import type { SizeChart } from "@/lib/shopify/types";

function toMetric(inches: number): number {
  return Math.round(inches * 2.54 * 100) / 100;
}

function SizeTable({
  chart,
  unit,
}: {
  chart: SizeChart;
  unit: "IN" | "CM";
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-black/10">
            <th className="py-2.5 pr-4 font-primary text-[11px] font-medium tracking-[0.06em] text-neutral-400 uppercase">
              Size
            </th>
            {chart.columns.map((col) => (
              <th
                key={col}
                className="py-2.5 pr-4 font-primary text-[11px] font-medium tracking-[0.06em] text-neutral-400 uppercase"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.rows.map((row) => (
            <tr key={row.size} className="border-b border-black/5">
              <td className="py-2.5 pr-4 font-primary text-[13px] font-medium text-neutral-800">
                {row.size}
              </td>
              {row.values.map((val, i) => (
                <td
                  key={i}
                  className="py-2.5 pr-4 font-primary text-[13px] font-light text-neutral-600"
                >
                  {unit === "CM" ? toMetric(val) : val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeGuide({
  chart,
  open,
  onClose,
}: {
  chart: SizeChart;
  open: boolean;
  onClose: () => void;
}) {
  const [unit, setUnit] = useState<"IN" | "CM">("IN");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />

      {/* ── Centered popup ── */}
      <div
        className="relative z-10 flex w-full max-w-[440px] flex-col rounded-[0.2rem] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h3 className="font-primary text-[15px] font-medium text-neutral-900">
            Size guide
          </h3>
          <div className="flex items-center gap-4">
            {/* Unit toggle */}
            <div className="flex overflow-hidden rounded-full border border-neutral-200">
              <button
                onClick={() => setUnit("IN")}
                className={`px-4 py-1.5 font-primary text-[12px] font-medium transition-colors ${
                  unit === "IN"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                IN
              </button>
              <button
                onClick={() => setUnit("CM")}
                className={`px-4 py-1.5 font-primary text-[12px] font-medium transition-colors ${
                  unit === "CM"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                CM
              </button>
            </div>
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close size guide"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <SizeTable chart={chart} unit={unit} />
        </div>
      </div>
    </div>
  );
}
