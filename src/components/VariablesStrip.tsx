"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";

const STRIP_ROLES = new Set(["other", "counter", "resultVar"]);

export default function VariablesStrip() {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const diffs = useTraceStore((s) => s.diffs);
  const meta = useTraceStore((s) => s.meta);

  const step = steps[currentStep];
  if (!step) return null;

  const diff = diffs[currentStep];
  const changed = new Set([...(diff?.added ?? []), ...(diff?.changed ?? [])]);

  const names = Object.keys(step.locals).filter((name) => {
    const role = meta?.roles[name];
    return role === undefined || STRIP_ROLES.has(role);
  });

  if (names.length === 0) return null;

  return (
    <div className="card-neo p-3 flex flex-wrap gap-2">
      {names.map((name) => (
        <motion.div
          key={name}
          animate={changed.has(name) ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.24 }}
          className={`font-mono text-xs px-2 py-1 rounded-full border-2 border-ink ${
            changed.has(name) ? "bg-pop" : "bg-paper"
          }`}
        >
          <span className="text-ink/60">{name}:</span> {formatValue(step.locals[name])}
        </motion.div>
      ))}
    </div>
  );
}
