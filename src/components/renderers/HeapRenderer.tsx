"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import ArrayRenderer from "./ArrayRenderer";
import type { SerializedValue } from "@/lib/trace/types";

interface HeapRendererProps {
  varName: string;
}

const ROW_HEIGHT = 52;
const NODE_R = 18;
const BOTTOM_SPACING = 40;

/** master.md §9.6 Heap variant: tree view + the underlying array (reusing
 * ArrayRenderer directly) shown below, synced by construction — both read
 * the same `varName` array each render, so a swap animates in both at
 * once without any extra plumbing. Python's heapq operates on a plain
 * list, so parent/child is pure index arithmetic (2i+1, 2i+2) — no new
 * harness serialization needed, and no force simulation either. */
function computeHeapPositions(n: number): Map<number, { x: number; y: number }> {
  const positions = new Map<number, { x: number; y: number }>();
  if (n === 0) return positions;
  const maxDepth = Math.floor(Math.log2(n));
  const bottomRowSize = 2 ** maxDepth;
  const totalWidth = bottomRowSize * BOTTOM_SPACING;
  for (let i = 0; i < n; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    const rowStart = 2 ** depth - 1;
    const rowSize = 2 ** depth;
    const posInRow = i - rowStart;
    const x = ((posInRow + 0.5) / rowSize) * totalWidth;
    positions.set(i, { x, y: depth * ROW_HEIGHT });
  }
  return positions;
}

export default function HeapRenderer({ varName }: HeapRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  if (!step) return null;

  const value = step.locals[varName];
  if (!Array.isArray(value)) return null;
  const heap = value as SerializedValue[];

  if (heap.length === 0) {
    return <ArrayRenderer varName={varName} />;
  }

  const prevValue = prevStep?.locals[varName];
  const prevHeap = Array.isArray(prevValue) ? (prevValue as SerializedValue[]) : null;

  const positions = computeHeapPositions(heap.length);
  const maxX = Math.max(...[...positions.values()].map((p) => p.x));
  const maxY = Math.max(...[...positions.values()].map((p) => p.y));
  const width = maxX + NODE_R * 2 + 20;
  const height = maxY + NODE_R * 2 + 20;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-x-auto" style={{ width, height }}>
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
          {heap.map((_, i) => {
            if (i === 0) return null;
            const parentIndex = Math.floor((i - 1) / 2);
            const p = positions.get(parentIndex);
            const c = positions.get(i);
            if (!p || !c) return null;
            const coords = { x1: p.x + NODE_R, y1: p.y + NODE_R, x2: c.x + NODE_R, y2: c.y + NODE_R };
            return (
              <motion.line
                key={i}
                initial={coords}
                animate={coords}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                stroke="#111111"
                strokeWidth={2}
              />
            );
          })}
        </svg>
        {heap.map((val, i) => {
          const pos = positions.get(i);
          if (!pos) return null;
          const changed = prevHeap ? JSON.stringify(prevHeap[i]) !== JSON.stringify(val) : false;
          return (
            <motion.div
              key={i}
              animate={{
                left: pos.x,
                top: pos.y,
                backgroundColor: changed ? ["#4F46E5", "#FDF6E3"] : "#FDF6E3",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="absolute flex items-center justify-center border-2 border-ink shadow-neo-sm rounded-full font-mono text-xs text-ink"
              style={{ width: NODE_R * 2, height: NODE_R * 2 }}
            >
              {formatValue(val)}
            </motion.div>
          );
        })}
      </div>
      <ArrayRenderer varName={varName} />
    </div>
  );
}
