"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import { asDict, collectGraphEdges, collectGraphNodeKeys, computeCircularLayout } from "@/lib/renderers/graphLayout";
import type { SerializedSet, SerializedValue } from "@/lib/trace/types";

interface GraphRendererProps {
  graphVar: string;
  visitedVar?: string;
  pointerVars: string[];
  distanceVar?: string;
}

const RADIUS = 90;
const CX = 110;
const CY = 110;
const NODE_R = 18;

/** master.md §9.7 — circular layout for small graphs, computed once (via
 * useMemo) rather than per frame. Visited nodes fill go-green, the current
 * pointer's node fills accent, and a distance-role dict (Dijkstra) renders
 * small badges — everything else is derived per step from the adjacency
 * dict already handled generically by the tracer's dict serialization. */
export default function GraphRenderer({ graphVar, visitedVar, pointerVars, distanceVar }: GraphRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);

  // The node set is static across the trace in our examples; merging across
  // every step is a robust way to get the full set regardless of which step
  // we memoize from.
  const allNodeKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const step of steps) {
      const dict = asDict(step.locals[graphVar]);
      if (!dict) continue;
      for (const k of collectGraphNodeKeys(dict)) keys.add(k);
    }
    return [...keys].sort();
  }, [steps, graphVar]);

  const positions = useMemo(() => computeCircularLayout(allNodeKeys, RADIUS, CX, CY), [allNodeKeys]);

  const step = steps[currentStep];
  if (!step || allNodeKeys.length === 0) return null;

  const dict = asDict(step.locals[graphVar]);
  const edges = dict ? collectGraphEdges(dict) : [];

  const visitedSet = new Set<string>();
  if (visitedVar) {
    const v = step.locals[visitedVar];
    if (v && typeof v === "object" && !Array.isArray(v) && (v as SerializedSet).type === "set") {
      for (const item of (v as SerializedSet).values) visitedSet.add(formatValue(item));
    } else if (Array.isArray(v)) {
      for (const item of v) visitedSet.add(formatValue(item));
    }
  }

  const currentKeys = new Set<string>();
  for (const name of pointerVars) {
    const v = step.locals[name];
    if (v !== undefined && v !== null && typeof v !== "object") currentKeys.add(formatValue(v));
  }

  const distances = new Map<string, SerializedValue>();
  if (distanceVar) {
    const d = asDict(step.locals[distanceVar]);
    if (d) for (const [k, v] of d.entries) distances.set(formatValue(k), v);
  }

  const width = CX * 2;
  const height = CY * 2;

  return (
    <div className="relative" style={{ width, height }}>
      <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
        {edges.map(({ from, to }) => {
          const pa = positions.get(from);
          const pb = positions.get(to);
          if (!pa || !pb) return null;
          return <line key={`${from}-${to}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#111111" strokeWidth={2} />;
        })}
      </svg>
      {allNodeKeys.map((key) => {
        const pos = positions.get(key);
        if (!pos) return null;
        const isVisited = visitedSet.has(key);
        const isCurrent = currentKeys.has(key);
        const dist = distances.get(key);
        return (
          <motion.div
            key={key}
            animate={{
              left: pos.x - NODE_R,
              top: pos.y - NODE_R,
              backgroundColor: isCurrent ? "#4F46E5" : isVisited ? "#10B981" : "#FDF6E3",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`absolute flex items-center justify-center border-2 border-ink shadow-neo-sm rounded-full font-mono text-sm ${
              isCurrent || isVisited ? "text-paper" : "text-ink"
            }`}
            style={{ width: NODE_R * 2, height: NODE_R * 2 }}
          >
            {key}
            {dist !== undefined && (
              <div className="absolute -top-2 -right-2 bg-pop text-ink text-[9px] font-mono px-1 rounded-full border-2 border-ink shadow-neo-sm whitespace-nowrap">
                {formatValue(dist)}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
