"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";

const HOLD_MS = 650;
// A press released before the fill reaches this point is treated as a normal
// tap (instant add), never a cancelled hold — so a slow click never gets lost.
const TAP_THRESHOLD = 30; // percent

type Phase = "idle" | "charging" | "done";

/**
 * Add-to-cart button with two coexisting input modes on every device:
 *  - Tap / click (or keyboard) fires `onAdd` instantly — the original behaviour,
 *    fully preserved on web and mobile.
 *  - Press-and-hold (when `canHold`) charges an on-brand fill; completing the
 *    charge fires `onAdd` with a burst + haptic. Releasing mid-charge cancels.
 * When `canHold` is false (needs a size, sold out, already in bag, pending) the
 * hold is disabled and only the plain tap remains, so the caller can react.
 */
export function HoldToAddButton({
  onAdd,
  disabled = false,
  canHold,
  idleLabel,
  holdLabel = "Hold",
  className,
  fillClassName = "bg-accent-orange",
}: {
  onAdd: () => void;
  disabled?: boolean;
  canHold: boolean;
  idleLabel: React.ReactNode;
  holdLabel?: string;
  className: string;
  fillClassName?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const fill = useMotionValue(0);
  const width = useMotionTemplate`${fill}%`;

  const controls = useRef<AnimationPlaybackControls | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // A single press spans pointerdown → (pointerup | leave | cancel). This guards
  // against the same press ending twice (e.g. pointerup then pointerleave).
  const active = useRef(false);
  // Suppress the click that trails a pointer interaction. Keyboard activation
  // has no preceding pointerdown, so it still falls through to `onAdd`.
  const pointerHandled = useRef(false);

  const enableHold = canHold && !disabled;

  useEffect(() => {
    return () => {
      controls.current?.stop();
      clearTimeout(resetTimer.current);
    };
  }, []);

  function vibrate(pattern: number | number[]) {
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* unsupported — no-op */
    }
  }

  function rewind(duration: number) {
    animate(fill, 0, { duration, ease: [0.4, 0, 0.2, 1] });
  }

  function complete() {
    setPhase("done");
    vibrate([14, 40, 22]);
    onAdd();
    resetTimer.current = setTimeout(() => {
      setPhase("idle");
      rewind(0.25);
    }, 850);
  }

  function startHold() {
    setPhase("charging");
    fill.set(0);
    vibrate(8);
    controls.current = animate(fill, 100, {
      duration: HOLD_MS / 1000,
      ease: "linear",
      onComplete: complete,
    });
  }

  function endPress() {
    if (!active.current) return;
    active.current = false;
    if (disabled || phase === "done") return;

    controls.current?.stop();

    // Engaged the hold, then released before completion → cancel, no add.
    if (phase === "charging" && fill.get() >= TAP_THRESHOLD) {
      setPhase("idle");
      rewind(0.2);
      return;
    }

    // Quick tap, or a non-hold state → original instant add.
    if (phase === "charging") {
      setPhase("idle");
      rewind(0.18);
    }
    onAdd();
  }

  function onPointerDown(e: React.PointerEvent) {
    if (disabled) return;
    // Ignore secondary mouse buttons; touch/pen always engage.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    active.current = true;
    pointerHandled.current = true;
    if (enableHold) startHold();
  }

  function onClick() {
    // The pointer path already added; only keyboard activation reaches here
    // without a preceding pointerdown.
    if (pointerHandled.current) {
      pointerHandled.current = false;
      return;
    }
    if (disabled) return;
    onAdd();
  }

  const showCharge = phase === "charging";
  const showDone = phase === "done";

  return (
    <button
      type="button"
      disabled={disabled}
      aria-busy={showDone || undefined}
      onPointerDown={onPointerDown}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      onPointerCancel={endPress}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative touch-none overflow-hidden select-none ${className}`}
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      {/* Charge fill */}
      <motion.span
        aria-hidden
        style={{ width, opacity: showDone ? 1 : undefined }}
        className={`pointer-events-none absolute inset-y-0 left-0 ${fillClassName}`}
      >
        {/* Moving techwear hazard stripes */}
        {(showCharge || showDone) && (
          <span className="hold-stripes absolute inset-0" />
        )}
        {/* Bright leading edge that rides the charge */}
        {showCharge && (
          <span className="absolute inset-y-0 right-0 w-[2px] bg-white/85 shadow-[0_0_10px_2px_rgba(255,255,255,0.6)]" />
        )}
      </motion.span>

      {/* Completion burst — white flash + expanding ring */}
      <AnimatePresence>
        {showDone && (
          <>
            <motion.span
              key="flash"
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-white"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
            <motion.span
              key="ring"
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Label */}
      <span className="relative z-10 flex w-full items-center justify-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {showDone ? (
            <motion.span
              key="done"
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path
                  d="M3 8.5L6.5 12L13 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Added
            </motion.span>
          ) : showCharge ? (
            <motion.span
              key="hold"
              className="font-street text-[13px] tracking-[0.22em]"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              {holdLabel}
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {idleLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
