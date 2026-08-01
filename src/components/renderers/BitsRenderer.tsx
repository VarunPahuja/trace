"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";

interface BitsRendererProps {
  varNames: string[];
}

const BIT_COUNT = 16;

function toBits(n: number): number[] {
  return Array.from({ length: BIT_COUNT }, (_, i) => (n >> (BIT_COUNT - 1 - i)) & 1);
}

/** master.md §9.11 — fixed 16-bit-wide rows; a flipped bit rotates 180°
 * with a color change. AND/OR/XOR operand+result sweep highlighting is a
 * later polish item — stacking each bitValue-role variable as its own row
 * (e.g. both an XOR's running result and the operand being XORed in) still
 * shows the relationship without the extra animation. */
export default function BitsRenderer({ varNames }: BitsRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  if (!step) return null;

  const rows = varNames
    .map((name) => ({ name, value: step.locals[name] }))
    .filter((r): r is { name: string; value: number } => typeof r.value === "number");
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {rows.map(({ name, value }) => {
        const bits = toBits(value);
        const prevValue = prevStep?.locals[name];
        const prevBits = typeof prevValue === "number" ? toBits(prevValue) : null;
        return (
          <div key={name} className="flex flex-col gap-1">
            <div className="font-display text-[10px] uppercase tracking-tight text-ink/50">
              {name} = {value}
            </div>
            <div className="flex gap-0.5" style={{ perspective: 300 }}>
              {bits.map((bit, i) => {
                const changed = prevBits ? prevBits[i] !== bit : false;
                return (
                  <motion.div
                    key={i}
                    animate={changed ? { rotateX: [0, 180, 0], backgroundColor: ["#4F46E5", "#FDF6E3"] } : {}}
                    transition={{ duration: 0.3 }}
                    className="w-6 h-8 flex items-center justify-center border-2 border-ink shadow-neo-sm rounded font-mono text-xs text-ink"
                  >
                    {bit}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
