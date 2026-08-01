"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import type { SerializedArray } from "@/lib/trace/types";
import { moveTransition, squashTransition, useMotionMode } from "@/lib/motion/timing";

interface StackRendererProps {
  varName: string;
}

/** master.md §9.4 + Phase 6: "Push/pop have weight." Push drops from -24px
 * and squashes-and-settles on landing; pop lifts +12px, fades, and rotates
 * +-4deg on the way out — and per master.md §12's palette (alarm =
 * "errors, pops/removals"), flashes alarm-tinted on the way out so a
 * removal reads distinctly from a write. Index-based keys are correct
 * here since a real stack only ever mutates at the top (last index). */
export default function StackRenderer({ varName }: StackRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();
  const step = steps[currentStep];
  if (!step) return null;

  const value = step.locals[varName];
  if (!Array.isArray(value)) return null;
  const stack = value as SerializedArray;

  return (
    <div className="flex flex-col gap-1">
      <div className="font-display text-[10px] uppercase tracking-tight text-ink/50">{varName}</div>
      <div className="flex flex-col-reverse gap-1 items-start min-h-[2.5rem]">
        <AnimatePresence initial={false}>
          {stack.map((item, i) => (
            <motion.div
              key={i}
              layout
              initial={{ y: -24, opacity: 0, scaleY: 0.8, backgroundColor: "#FDF6E3" }}
              animate={{ y: 0, opacity: 1, scaleY: [0.8, 1.15, 0.95, 1], backgroundColor: "#FDF6E3" }}
              exit={{ y: 12, opacity: 0, rotate: i % 2 === 0 ? 4 : -4, backgroundColor: "#EF4444" }}
              transition={{
                default: squashTransition(mode, speed),
                layout: moveTransition(mode, speed),
              }}
              className="font-mono text-sm px-3 py-1 border-2 border-ink shadow-neo-sm rounded-md bg-paper min-w-[3rem] text-center"
            >
              {formatValue(item)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
