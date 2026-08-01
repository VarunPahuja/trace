"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { staggerDelay, useMotionMode, writeTransition } from "@/lib/motion/timing";

interface BitsRendererProps {
  varNames: string[];
}

const BIT_COUNT = 16;
const CELL_W = 24; // w-6 = 24px

function toBits(n: number): number[] {
  return Array.from({ length: BIT_COUNT }, (_, i) => (n >> (BIT_COUNT - 1 - i)) & 1);
}

/** master.md §9.11 + Phase 6: fixed 16-bit-wide rows; a flipped bit rotates
 * 180deg with a color change. A detected right/left shift slides the whole
 * row laterally as a visual cue (the fixed-width column layout means a
 * shift is really "which bits landed where" rather than literal cell
 * movement, so the row nudges in the shift direction rather than each cell
 * translating independently). When 2+ bitValue rows are present at once
 * (an AND/OR/XOR's operands + result, all wired to bitValue roles), the
 * changed row's bit flips stagger left-to-right so the operation reads as
 * a sweep rather than all 16 bits popping at once. */
export default function BitsRenderer({ varNames }: BitsRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();
  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  if (!step) return null;

  const rows = varNames
    .map((name) => ({ name, value: step.locals[name] }))
    .filter((r): r is { name: string; value: number } => typeof r.value === "number");
  if (rows.length === 0) return null;

  const isSweep = rows.length >= 2;

  return (
    <div className="flex flex-col gap-3">
      {rows.map(({ name, value }) => {
        const bits = toBits(value);
        const prevValue = prevStep?.locals[name];
        const prevBits = typeof prevValue === "number" ? toBits(prevValue) : null;
        const isShiftRight = typeof prevValue === "number" && value === prevValue >> 1;
        const isShiftLeft = typeof prevValue === "number" && (value & 0xffff) === ((prevValue << 1) & 0xffff);
        const rowShift = isShiftRight ? CELL_W / 2 : isShiftLeft ? -CELL_W / 2 : 0;
        return (
          <div key={name} className="flex flex-col gap-1">
            <div className="font-display text-[10px] uppercase tracking-tight text-ink/50">
              {name} = {value}
            </div>
            <motion.div
              className="flex gap-0.5"
              style={{ perspective: 300 }}
              animate={{ x: rowShift ? [0, rowShift, 0] : 0 }}
              transition={writeTransition(mode, speed)}
            >
              {bits.map((bit, i) => {
                const changed = prevBits ? prevBits[i] !== bit : false;
                const delay = changed && isSweep ? staggerDelay(i, mode, speed) : 0;
                return (
                  <motion.div
                    key={i}
                    animate={
                      changed ? { rotateX: [0, 180, 0], backgroundColor: ["#4F46E5", "#FDF6E3"] } : {}
                    }
                    transition={{ ...writeTransition(mode, speed), delay }}
                    className="w-6 h-8 flex items-center justify-center border-2 border-ink shadow-neo-sm rounded font-mono text-xs text-ink"
                  >
                    {bit}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
