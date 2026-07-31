"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import type { SerializedValue } from "@/lib/trace/types";

interface GridRendererProps {
  varName: string;
}

const CELL = 36;

/** master.md §9.8 — 2-D matrix of cells; write = fill flash. Dependency
 * arrows are a later polish item, scoped out for the time budget here. */
export default function GridRenderer({ varName }: GridRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  if (!step) return null;

  const value = step.locals[varName];
  if (!Array.isArray(value) || value.length === 0 || !Array.isArray(value[0])) return null;
  const grid = value as SerializedValue[][];

  const prevValue = prevStep?.locals[varName];
  const prevGrid =
    Array.isArray(prevValue) && Array.isArray(prevValue[0]) ? (prevValue as SerializedValue[][]) : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-xs text-ink/50">{varName}</div>
      <div className="inline-flex flex-col gap-1">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => {
              const changed =
                prevGrid?.[r]?.[c] !== undefined && JSON.stringify(prevGrid[r][c]) !== JSON.stringify(cell);
              return (
                <motion.div
                  key={c}
                  animate={{ backgroundColor: changed ? ["#4F46E5", "#FDF6E3"] : "#FDF6E3" }}
                  transition={{ duration: 0.24 }}
                  className="flex items-center justify-center border-2 border-ink rounded-md font-mono text-xs text-ink"
                  style={{ width: CELL, height: CELL }}
                >
                  {formatValue(cell)}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
