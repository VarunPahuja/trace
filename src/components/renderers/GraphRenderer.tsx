"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import { asDict, collectGraphEdges, collectGraphNodeKeys, computeCircularLayout } from "@/lib/renderers/graphLayout";
import type { SerializedSet, SerializedValue } from "@/lib/trace/types";
import { edgeLeadSeconds, edgeTransition, moveTransition, useMotionMode, writeTransition } from "@/lib/motion/timing";

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

function readVisited(value: SerializedValue | undefined): Set<string> {
  const set = new Set<string>();
  if (value && typeof value === "object" && !Array.isArray(value) && (value as SerializedSet).type === "set") {
    for (const item of (value as SerializedSet).values) set.add(formatValue(item));
  } else if (Array.isArray(value)) {
    for (const item of value) set.add(formatValue(item));
  }
  return set;
}

/** master.md §9.7 + Phase 6: circular layout for small graphs, computed
 * once (via useMemo) rather than per frame. The edge a traversal just
 * discovered a node through draws (stroke dash-in) BEFORE that node's fill
 * lights up — found by diffing the visited set against the previous step
 * and matching it to an edge from an already-visited node. Distance badges
 * (Dijkstra) flip-pulse when their value changes. */
export default function GraphRenderer({ graphVar, visitedVar, pointerVars, distanceVar }: GraphRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();

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
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;

  const dict = asDict(step.locals[graphVar]);
  const edges = dict ? collectGraphEdges(dict) : [];

  const visitedSet = visitedVar ? readVisited(step.locals[visitedVar]) : new Set<string>();
  const prevVisitedSet = visitedVar && prevStep ? readVisited(prevStep.locals[visitedVar]) : new Set<string>();
  const newlyVisited = new Set([...visitedSet].filter((k) => !prevVisitedSet.has(k)));

  const currentKeys = new Set<string>();
  for (const name of pointerVars) {
    const v = step.locals[name];
    if (v !== undefined && v !== null && typeof v !== "object") currentKeys.add(formatValue(v));
  }

  const distances = new Map<string, SerializedValue>();
  const prevDistances = new Map<string, SerializedValue>();
  if (distanceVar) {
    const d = asDict(step.locals[distanceVar]);
    if (d) for (const [k, v] of d.entries) distances.set(formatValue(k), v);
    const pd = prevStep ? asDict(prevStep.locals[distanceVar]) : null;
    if (pd) for (const [k, v] of pd.entries) prevDistances.set(formatValue(k), v);
  }

  const width = CX * 2;
  const height = CY * 2;
  const edgeLead = edgeLeadSeconds(mode, speed);

  return (
    <div className="relative" style={{ width, height }}>
      <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
        {edges.map(({ from, to }) => {
          const pa = positions.get(from);
          const pb = positions.get(to);
          if (!pa || !pb) return null;
          // Direction-agnostic (edges are deduped as undirected pairs):
          // active if this step's traversal just discovered either
          // endpoint through the other.
          const isActive =
            (newlyVisited.has(to) && prevVisitedSet.has(from)) || (newlyVisited.has(from) && prevVisitedSet.has(to));
          const coords = { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y };
          return (
            <motion.line
              key={isActive ? `${from}-${to}-${currentStep}` : `${from}-${to}`}
              initial={isActive ? { ...coords, pathLength: 0 } : { ...coords, pathLength: 1 }}
              animate={{ ...coords, pathLength: 1 }}
              transition={isActive ? edgeTransition(mode, speed) : moveTransition(mode, speed)}
              stroke="#111111"
              strokeWidth={2}
            />
          );
        })}
      </svg>
      {allNodeKeys.map((key) => {
        const pos = positions.get(key);
        if (!pos) return null;
        const isVisited = visitedSet.has(key);
        const isCurrent = currentKeys.has(key);
        const dist = distances.get(key);
        const distChanged = distanceVar && dist !== undefined && prevDistances.get(key) !== dist;
        const isNewlyVisited = newlyVisited.has(key);
        const hasIncomingActiveEdge = isNewlyVisited && edges.some(({ from, to }) => {
          const other = from === key ? to : to === key ? from : null;
          return other !== null && prevVisitedSet.has(other);
        });
        return (
          <motion.div
            key={key}
            animate={{
              left: pos.x - NODE_R,
              top: pos.y - NODE_R,
              backgroundColor: isCurrent ? "#4F46E5" : isVisited ? "#10B981" : "#FDF6E3",
            }}
            transition={{
              default: moveTransition(mode, speed),
              backgroundColor: { duration: 0.2, delay: hasIncomingActiveEdge ? edgeLead : 0 },
            }}
            className={`absolute flex items-center justify-center border-2 border-ink shadow-neo-sm rounded-full font-mono text-sm ${
              isCurrent || isVisited ? "text-paper" : "text-ink"
            }`}
            style={{ width: NODE_R * 2, height: NODE_R * 2 }}
          >
            {key}
            {dist !== undefined && (
              <motion.div
                key={`dist-${key}-${currentStep}`}
                initial={distChanged ? { scale: 1 } : false}
                animate={{ scale: distChanged ? [1, 1.3, 1] : 1 }}
                transition={writeTransition(mode, speed)}
                className="absolute -top-2 -right-2 bg-pop text-ink text-[9px] font-mono px-1 rounded-full border-2 border-ink shadow-neo-sm whitespace-nowrap"
              >
                {formatValue(dist)}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
