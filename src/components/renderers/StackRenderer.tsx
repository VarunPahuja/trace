"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import type { SerializedArray } from "@/lib/trace/types";

interface StackRendererProps {
  varName: string;
}

/** master.md §9.4 — push falls in from above with squash-and-settle, pop
 * lifts and fades. Index-based keys are correct here since a real stack
 * only ever mutates at the top (last index). */
export default function StackRenderer({ varName }: StackRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const step = steps[currentStep];
  if (!step) return null;

  const value = step.locals[varName];
  if (!Array.isArray(value)) return null;
  const stack = value as SerializedArray;

  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-xs text-ink/50">{varName}</div>
      <div className="flex flex-col-reverse gap-1 items-start min-h-[2.5rem]">
        <AnimatePresence initial={false}>
          {stack.map((item, i) => (
            <motion.div
              key={i}
              layout
              initial={{ y: -16, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="font-mono text-sm px-3 py-1 border-2 border-ink rounded-md bg-paper min-w-[3rem] text-center"
            >
              {formatValue(item)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
