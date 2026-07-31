"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import { asTrie, computeTrieLayout } from "@/lib/renderers/trieLayout";

interface TrieRendererProps {
  rootVars: string[];
  pointerVars: string[];
}

const NODE_R = 16;
const SPACING_X = 48;
const SPACING_Y = 56;
const TOP_PAD = 16;

/** master.md §9.6 n-ary variant. The root is a stable top-level reference
 * in both wired examples (never reassigned, only mutated in place), so —
 * unlike the binary Tree/LinkedList cases — no cross-step merge is needed
 * here; a direct per-step lookup is always valid. isWord nodes get a
 * filled dot; edges are labeled with the character consumed. */
export default function TrieRenderer({ rootVars, pointerVars }: TrieRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const step = steps[currentStep];
  if (!step) return null;

  let trie = null;
  for (const name of rootVars) {
    const t = asTrie(step.locals[name]);
    if (t && t.rootId !== null) {
      trie = t;
      break;
    }
  }
  if (!trie) return null;

  const positions = computeTrieLayout(trie);
  if (positions.length === 0) return null;
  const posById = new Map(positions.map((p) => [p.id, p]));

  const currentIds = new Set<number>();
  for (const name of pointerVars) {
    const t = asTrie(step.locals[name]);
    if (t && t.rootId !== null) currentIds.add(t.rootId);
  }

  const maxX = Math.max(...positions.map((p) => p.x));
  const maxY = Math.max(...positions.map((p) => p.y));
  const width = (maxX + 1) * SPACING_X;
  const height = (maxY + 1) * SPACING_Y + TOP_PAD + 20;
  const xPos = (x: number) => x * SPACING_X + SPACING_X / 2;
  const yPos = (y: number) => y * SPACING_Y + TOP_PAD;

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
                return (
                  <g key={`${p.id}-${childId}`}>
                    <motion.line
                      initial={{ x1, y1, x2, y2 }}
                      animate={{ x1, y1, x2, y2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      stroke="#111111"
                      strokeWidth={2}
                    />
                    <motion.text
                      initial={{ x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 4 }}
                      animate={{ x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
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
          return (
            <motion.div
              key={p.id}
              initial={{ ...pos, scale: 0.5, opacity: 0 }}
              animate={{ ...pos, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`absolute flex items-center justify-center rounded-full font-mono text-[10px] ${
                isCurrent ? "border-2 border-accent bg-accent text-paper" : "border-2 border-ink bg-paper text-ink"
              } ${p.isWord ? "ring-2 ring-go ring-offset-1" : ""}`}
              style={{ width: NODE_R * 2, height: NODE_R * 2 }}
            />
          );
        })}
      </div>
    </div>
  );
}
