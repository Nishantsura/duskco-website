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
          <tr className="border-b border-line-strong">
            <th className="t-label py-2.5 pr-4 font-medium text-ink-muted">
              Size
            </th>
            {chart.columns.map((col) => (
              <th
                key={col}
                className="t-label py-2.5 pr-4 font-medium text-ink-muted"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.rows.map((row) => (
            <tr key={row.size} className="border-b border-line">
              <td className="t-body py-2.5 pr-4 font-medium">
                {row.size}
              </td>
              {row.values.map((val, i) => (
                <td
                  key={i}
                  className="t-body py-2.5 pr-4 tabular-nums text-ink-muted"
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
      <div className="absolute inset-0 bg-black/30" />

      {/* ── Centered popup ── */}
      <div
        className="relative z-10 flex w-full max-w-[440px] flex-col border border-line bg-bg text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="t-label">Size guide</h3>
          <div className="flex items-center gap-4">
            {/* Unit toggle */}
            <div className="flex border border-line">
              <button
                onClick={() => setUnit("IN")}
                className={`t-label px-3 py-1 transition-colors ${
                  unit === "IN"
                    ? "bg-ink text-bg"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                IN
              </button>
              <button
                onClick={() => setUnit("CM")}
                className={`t-label px-3 py-1 transition-colors ${
                  unit === "CM"
                    ? "bg-ink text-bg"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                CM
              </button>
            </div>
            <button
              onClick={onClose}
              aria-label="Close size guide"
              className="t-label transition-opacity hover:opacity-60"
            >
              Close
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <SizeTable chart={chart} unit={unit} />
        </div>
      </div>
    </div>
  );
}
