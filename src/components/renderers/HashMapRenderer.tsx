"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import type { SerializedDict } from "@/lib/trace/types";

interface HashMapRendererProps {
  varName: string;
}

function asDict(value: unknown): SerializedDict | null {
  if (value && typeof value === "object" && !Array.isArray(value) && (value as SerializedDict).type === "dict") {
    return value as SerializedDict;
  }
  return null;
}

/** master.md §9.3 — new entries drop in, value updates flip-pulse. */
export default function HashMapRenderer({ varName }: HashMapRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);

  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  if (!step) return null;

  const dict = asDict(step.locals[varName]);
  if (!dict) return null;

  const prevDict = prevStep ? asDict(prevStep.locals[varName]) : null;
  const prevEntries = new Map((prevDict?.entries ?? []).map(([k, v]) => [formatValue(k), formatValue(v)]));

  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-xs text-ink/50">{varName}</div>
      <div className="flex flex-wrap gap-1">
        <AnimatePresence>
          {dict.entries.map(([k, v]) => {
            const keyStr = formatValue(k);
            const valStr = formatValue(v);
            const isChanged = prevEntries.has(keyStr) && prevEntries.get(keyStr) !== valStr;
            return (
              <motion.div
                key={keyStr}
                layout
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1, scale: isChanged ? [1, 1.15, 1] : 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="font-mono text-xs px-2 py-1 rounded-full border-2 border-ink bg-paper"
              >
                {keyStr}: {valStr}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
