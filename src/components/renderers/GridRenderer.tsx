"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import type { SerializedValue } from "@/lib/trace/types";
import { pulseTransition, staggerDelay, useMotionMode, writeTransition } from "@/lib/motion/timing";

interface GridRendererProps {
  varName: string;
  rowVar?: string;
  colVar?: string;
}

const CELL = 36;

/** master.md §9.8 + Phase 6: 2-D matrix of cells. Write = fill + scale
 * spring (matches ArrayRenderer's write language); the current row/col
 * pointer cell gets a read ping instead of a static ring so "we're looking
 * here" reads as a pulse, not a permanent decoration. Multiple cells
 * written in the same step (e.g. a flood-fill frontier) stagger 40ms
 * apart. Dependency arrows are a later polish item, scoped out for now. */
export default function GridRenderer({ varName, rowVar, colVar }: GridRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();
  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  if (!step) return null;

  const value = step.locals[varName];
  if (!Array.isArray(value) || value.length === 0 || !Array.isArray(value[0])) return null;
  const grid = value as SerializedValue[][];

  const prevValue = prevStep?.locals[varName];
  const prevGrid =
    Array.isArray(prevValue) && Array.isArray(prevValue[0]) ? (prevValue as SerializedValue[][]) : null;

  const curRow = rowVar ? step.locals[rowVar] : undefined;
  const curCol = colVar ? step.locals[colVar] : undefined;
  const hasCurrent = typeof curRow === "number" && typeof curCol === "number";

  const changedCells: string[] = [];
  if (prevGrid) {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (prevGrid[r]?.[c] !== undefined && JSON.stringify(prevGrid[r][c]) !== JSON.stringify(grid[r][c])) {
          changedCells.push(`${r},${c}`);
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="font-display text-[10px] uppercase tracking-tight text-ink/60">{varName}</div>
      <div className="inline-flex flex-col gap-1">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => {
              const changeIndex = changedCells.indexOf(`${r},${c}`);
              const changed = changeIndex !== -1;
              const isCurrent = hasCurrent && curRow === r && curCol === c;
              const delay = changed ? staggerDelay(changeIndex, mode, speed) : 0;
              return (
                <motion.div
                  key={c}
                  animate={{
                    backgroundColor: changed ? ["#4F46E5", "#FDF6E3"] : "#FDF6E3",
                    scale: changed ? [1, 1.12, 1] : 1,
                  }}
                  transition={changed ? { ...writeTransition(mode, speed), delay } : { duration: 0.15 }}
                  className={`relative flex items-center justify-center border-2 rounded-md shadow-neo-sm font-mono text-xs text-ink ${
                    isCurrent ? "border-pop ring-2 ring-pop" : "border-ink"
                  }`}
                  style={{ width: CELL, height: CELL }}
                >
                  {formatValue(cell)}
                  {isCurrent && (
                    <motion.span
                      key={`ping-${r}-${c}-${currentStep}`}
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.4 }}
                      transition={pulseTransition(mode, speed)}
                      className="absolute inset-0 rounded-md border-2 border-pop pointer-events-none"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
