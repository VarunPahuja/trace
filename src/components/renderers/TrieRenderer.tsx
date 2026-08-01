"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import { asTrie, computeTrieLayout } from "@/lib/renderers/trieLayout";
import { nearestRelevantStepIndex } from "@/lib/renderers/stepScope";
import { edgeLeadSeconds, edgeTransition, moveTransition, pulseTransition, useMotionMode } from "@/lib/motion/timing";

interface TrieRendererProps {
  rootVars: string[];
  pointerVars: string[];
}

const NODE_R = 16;
const SPACING_X = 48;
const SPACING_Y = 56;
const TOP_PAD = 16;

/** master.md §9.6 n-ary variant + Phase 6: the root is a stable top-level
 * reference in both wired examples (never reassigned, only mutated in
 * place), so no cross-step merge is needed to reconstruct the shape — but
 * a brief dip into an unrelated frame (e.g. `TrieNode.__init__`, which has
 * neither `root` nor `node` as a local) still needs the same
 * nearest-relevant-step fallback LinkedListRenderer uses, or the whole
 * trie would flicker blank every time a node gets constructed. isWord
 * nodes get a filled dot; edges are labeled with the character consumed;
 * the edge into the current node draws before that node highlights, and a
 * brand-new node scales in from its parent's position. */
export default function TrieRenderer({ rootVars, pointerVars }: TrieRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();
  const allVars = useMemo(() => [...rootVars, ...pointerVars], [rootVars, pointerVars]);

  const step = steps[currentStep];
  if (!step) return null;

  const resolvedIndex = nearestRelevantStepIndex(steps, currentStep, allVars);
  const resolvedStep = steps[resolvedIndex];

  let trie = null;
  for (const name of rootVars) {
    const t = asTrie(resolvedStep.locals[name]);
    if (t && t.rootId !== null) {
      trie = t;
      break;
    }
  }
  if (!trie) return null;

  const prevIndex = resolvedIndex > 0 ? nearestRelevantStepIndex(steps, resolvedIndex - 1, allVars) : -1;
  const prevStep = prevIndex >= 0 ? steps[prevIndex] : null;
  let prevTrie = null;
  if (prevStep) {
    for (const name of rootVars) {
      const t = asTrie(prevStep.locals[name]);
      if (t && t.rootId !== null) {
        prevTrie = t;
        break;
      }
    }
  }
  const prevIds = new Set((prevTrie?.nodes ?? []).map((n) => n.id));

  const positions = computeTrieLayout(trie);
  if (positions.length === 0) return null;
  const posById = new Map(positions.map((p) => [p.id, p]));

  const parentOf = new Map<number, number>();
  for (const p of positions) {
    for (const [, childId] of p.children) parentOf.set(childId, p.id);
  }

  const currentIds = new Set<number>();
  for (const name of pointerVars) {
    const t = asTrie(resolvedStep.locals[name]);
    if (t && t.rootId !== null) currentIds.add(t.rootId);
  }

  const maxX = Math.max(...positions.map((p) => p.x));
  const maxY = Math.max(...positions.map((p) => p.y));
  const width = (maxX + 1) * SPACING_X;
  const height = (maxY + 1) * SPACING_Y + TOP_PAD + 20;
  const xPos = (x: number) => x * SPACING_X + SPACING_X / 2;
  const yPos = (y: number) => y * SPACING_Y + TOP_PAD;
  const edgeLead = edgeLeadSeconds(mode, speed);

  return (
    <div className="overflow-x-auto pb-6">
      <div className="relative" style={{ width, height }}>
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
          {positions.flatMap((p) =>
            p.children
              .filter(([, childId]) => posById.has(childId))
              .map(([label, childId]) => {
                const child = posById.get(childId)!;
                const x1 = xPos(p.x);
                const y1 = yPos(p.y);
                const x2 = xPos(child.x);
                const y2 = yPos(child.y);
                const isActive = currentIds.has(childId);
                return (
                  <g key={isActive ? `${p.id}-${childId}-${currentStep}` : `${p.id}-${childId}`}>
                    <motion.line
                      initial={isActive ? { x1, y1, x2, y2, pathLength: 0 } : { x1, y1, x2, y2, pathLength: 1 }}
                      animate={{ x1, y1, x2, y2, pathLength: 1 }}
                      transition={isActive ? edgeTransition(mode, speed) : moveTransition(mode, speed)}
                      stroke="#111111"
                      strokeWidth={2}
                    />
                    <motion.text
                      initial={{ x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 4 }}
                      animate={{ x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 4 }}
                      transition={moveTransition(mode, speed)}
                      fontSize={10}
                      fontFamily="monospace"
                      fill="#4F46E5"
                      textAnchor="middle"
                    >
                      {formatValue(label)}
                    </motion.text>
                  </g>
                );
              }),
          )}
        </svg>
        {positions.map((p) => {
          const isCurrent = currentIds.has(p.id);
          const pos = { left: xPos(p.x) - NODE_R, top: yPos(p.y) - NODE_R };
          const isNew = !prevIds.has(p.id);
          const parentId = parentOf.get(p.id);
          const parentPos = isNew && parentId !== undefined ? posById.get(parentId) : undefined;
          const flyFrom = parentPos ? { left: xPos(parentPos.x) - NODE_R, top: yPos(parentPos.y) - NODE_R } : pos;
          return (
            <motion.div
              key={p.id}
              initial={isNew ? { ...flyFrom, scale: 0.4, opacity: 0 } : false}
              animate={{ ...pos, scale: 1, opacity: 1 }}
              transition={moveTransition(mode, speed)}
              className={`absolute flex items-center justify-center rounded-full shadow-neo-sm font-mono text-[10px] ${
                isCurrent ? "border-2 border-accent bg-accent text-paper" : "border-2 border-ink bg-paper text-ink"
              } ${p.isWord ? "ring-2 ring-go ring-offset-1" : ""}`}
              style={{ width: NODE_R * 2, height: NODE_R * 2 }}
            >
              {isCurrent && (
                <motion.span
                  key={`ping-${p.id}-${currentStep}`}
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.5 }}
                  transition={{ ...pulseTransition(mode, speed), delay: edgeLead }}
                  className="absolute inset-0 rounded-full border-2 border-pop pointer-events-none"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
