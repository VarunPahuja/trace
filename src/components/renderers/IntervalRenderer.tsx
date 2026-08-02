"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { lastKnownArray } from "@/lib/renderers/lastKnownValue";
import type { SerializedValue } from "@/lib/trace/types";
import { moveTransition, useMotionMode } from "@/lib/motion/timing";

interface IntervalRendererProps {
  varName: string;
}

const SCALE = 18;
const BAR_HEIGHT = 24;
const ROW_GAP = 10;

/** master.md §9.10 — horizontal number line, one bar per row. Index-based
 * keys (not value-based) so a merge reads as bars sliding/resizing rather
 * than a hard cut — true identity-tracked fusion is a later polish item,
 * same scope call as array swap-slide. */
export default function IntervalRenderer({ varName }: IntervalRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();
  const step = steps[currentStep];
  if (!step) return null;

  const value = lastKnownArray<SerializedValue>(steps, currentStep, varName);
  if (!value) return null;
  const intervals = value.filter(
    (v): v is [SerializedValue, SerializedValue] => Array.isArray(v) && v.length === 2,
  );
  if (intervals.length === 0) return null;

  const allNums = intervals.flatMap((iv) => iv.filter((n): n is number => typeof n === "number"));
  if (allNums.length === 0) return null;
  const minVal = Math.min(0, ...allNums);
  const maxVal = Math.max(...allNums, minVal + 1);
  const xOf = (n: number) => (n - minVal) * SCALE;

  return (
    <div className="flex flex-col gap-1">
      <div className="font-display text-[10px] uppercase tracking-tight text-ink/60">{varName}</div>
      <div
        className="relative"
        style={{ width: xOf(maxVal) + 40, height: intervals.length * (BAR_HEIGHT + ROW_GAP) }}
      >
        <AnimatePresence>
          {intervals.map((iv, i) => {
            const [start, end] = iv;
            if (typeof start !== "number" || typeof end !== "number") return null;
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  left: xOf(start),
                  width: Math.max(xOf(end) - xOf(start), 8),
                  top: i * (BAR_HEIGHT + ROW_GAP),
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={moveTransition(mode, speed)}
                className="absolute flex items-center justify-center border-2 border-ink shadow-neo-sm rounded-full bg-accent/20 font-mono text-xs whitespace-nowrap px-1"
                style={{ height: BAR_HEIGHT }}
              >
                [{start}, {end}]
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
