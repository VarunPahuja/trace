"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import type { SerializedArray } from "@/lib/trace/types";

interface ArrayRendererProps {
  varName: string;
  overlay?: React.ReactNode;
  dimRangeStartVar?: string;
  dimRangeEndVar?: string;
}

/** master.md §9.1 — cell highlight pulse on read, fill-color spring on
 * write, pointer chips glide via layoutId. Swap-slide (value-identity
 * tracking across positions) is a later polish item — none of Phase 2's
 * wired examples swap in place, so it's not load-bearing yet. */
export default function ArrayRenderer({ varName, overlay, dimRangeStartVar, dimRangeEndVar }: ArrayRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const meta = useTraceStore((s) => s.meta);

  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  if (!step) return null;

  const value = step.locals[varName];
  if (!Array.isArray(value)) return null;
  const array = value as SerializedArray;

  const prevValue = prevStep?.locals[varName];
  const prevArray = Array.isArray(prevValue) ? (prevValue as SerializedArray) : null;

  const pointerNames = meta
    ? Object.entries(meta.roles)
        .filter(([, role]) => role === "pointer" || role === "windowStart" || role === "windowEnd")
        .map(([name]) => name)
    : [];

  const pointersByIndex = new Map<number, string[]>();
  for (const name of pointerNames) {
    const v = step.locals[name];
    if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < array.length) {
      const list = pointersByIndex.get(v) ?? [];
      list.push(name);
      pointersByIndex.set(v, list);
    }
  }

  const dimStart = dimRangeStartVar ? step.locals[dimRangeStartVar] : undefined;
  const dimEnd = dimRangeEndVar ? step.locals[dimRangeEndVar] : undefined;
  const hasDimRange = typeof dimStart === "number" && typeof dimEnd === "number";

  return (
    <div className="flex flex-col gap-1 pb-5">
      <div className="font-display text-[10px] uppercase tracking-tight text-ink/50">{varName}</div>
      <div className="relative flex gap-1">
        {overlay}
        {array.map((cell, i) => {
          const changed = prevArray ? JSON.stringify(prevArray[i]) !== JSON.stringify(cell) : false;
          const pointers = pointersByIndex.get(i) ?? [];
          const isRead = pointers.length > 0;
          const isDimmed = hasDimRange && (i < (dimStart as number) || i > (dimEnd as number));

          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-1">
              <motion.div
                layout
                animate={{
                  backgroundColor: changed ? ["#4F46E5", "#FDF6E3"] : "#FDF6E3",
                  opacity: isDimmed ? 0.3 : 1,
                }}
                transition={{ duration: 0.24 }}
                className={`w-10 h-10 flex items-center justify-center border-2 rounded-md shadow-neo-sm font-mono text-sm relative ${
                  isRead ? "border-pop ring-2 ring-pop" : "border-ink"
                }`}
              >
                {formatValue(cell)}
                {pointers.length > 0 && (
                  <div className="absolute -bottom-6 flex gap-0.5">
                    {pointers.map((p) => (
                      <motion.span
                        layoutId={`ptr-${p}`}
                        key={p}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="text-[10px] font-display bg-accent text-paper px-1 rounded"
                      >
                        {p}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>
              <div className="text-[10px] font-mono text-ink/40">{i}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
