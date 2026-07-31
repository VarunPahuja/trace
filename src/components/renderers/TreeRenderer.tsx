"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import { computeMergedTree, computeTreeLayout, currentNodeId } from "@/lib/renderers/treeLayout";

interface TreeRendererProps {
  rootVars: string[];
  pointerVars: string[];
}

const NODE_R = 20;
const SPACING_X = 56;
const SPACING_Y = 64;
const TOP_PAD = 20;

/** master.md §9.6 — tidy layout (in-order x, depth y), no force simulation.
 * Current node (any pointer var pointing at it this step) fills accent. */
export default function TreeRenderer({ rootVars, pointerVars }: TreeRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);

  const tree = useMemo(
    () => computeMergedTree(steps, rootVars, currentStep),
    [steps, rootVars, currentStep],
  );

  const step = steps[currentStep];
  if (!step || !tree || tree.rootId === null) return null;

  const positions = computeTreeLayout(tree);
  if (positions.length === 0) return null;
  const posById = new Map(positions.map((p) => [p.id, p]));

  const chipsByNode = new Map<number, string[]>();
  for (const name of pointerVars) {
    const id = currentNodeId(step.locals[name]);
    if (id === null || !posById.has(id)) continue;
    const list = chipsByNode.get(id) ?? [];
    list.push(name);
    chipsByNode.set(id, list);
  }

  const maxX = Math.max(...positions.map((p) => p.x));
  const maxY = Math.max(...positions.map((p) => p.y));
  const width = (maxX + 1) * SPACING_X;
  const height = (maxY + 1) * SPACING_Y + TOP_PAD + 24;
  const xPos = (x: number) => x * SPACING_X + SPACING_X / 2;
  const yPos = (y: number) => y * SPACING_Y + TOP_PAD;

  return (
    <div className="overflow-x-auto pb-6">
      <div className="relative" style={{ width, height }}>
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
          {positions.flatMap((p) =>
            [p.leftId, p.rightId]
              .filter((childId): childId is number => childId !== null && posById.has(childId))
              .map((childId) => {
                const child = posById.get(childId)!;
                const coords = { x1: xPos(p.x), y1: yPos(p.y), x2: xPos(child.x), y2: yPos(child.y) };
                return (
                  <motion.line
                    key={`${p.id}-${childId}`}
                    initial={coords}
                    animate={coords}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    stroke="#111111"
                    strokeWidth={2}
                  />
                );
              }),
          )}
        </svg>
        {positions.map((p) => {
          const chips = chipsByNode.get(p.id) ?? [];
          const isCurrent = chips.length > 0;
          const pos = { left: xPos(p.x) - NODE_R, top: yPos(p.y) - NODE_R };
          return (
            <motion.div
              key={p.id}
              initial={{ ...pos, scale: 0.5, opacity: 0 }}
              animate={{ ...pos, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`absolute flex items-center justify-center border-2 rounded-full font-mono text-sm ${
                isCurrent ? "border-accent bg-accent text-paper" : "border-ink bg-paper"
              }`}
              style={{ width: NODE_R * 2, height: NODE_R * 2 }}
            >
              {formatValue(p.val)}
              {chips.length > 0 && (
                <div className="absolute -bottom-6 flex gap-0.5">
                  {chips.map((c) => (
                    <motion.span
                      layoutId={`treeptr-${c}`}
                      key={c}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className="text-[10px] font-display bg-accent text-paper px-1 rounded whitespace-nowrap"
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
