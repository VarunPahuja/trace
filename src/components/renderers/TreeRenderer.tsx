"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import { computeMergedTree, computeTreeLayout, currentNodeId } from "@/lib/renderers/treeLayout";
import { chipTransition, edgeLeadSeconds, edgeTransition, moveTransition, pulseTransition, useMotionMode } from "@/lib/motion/timing";

interface TreeRendererProps {
  rootVars: string[];
  pointerVars: string[];
}

const NODE_R = 20;
const SPACING_X = 56;
const SPACING_Y = 64;
const TOP_PAD = 20;

/** master.md §9.6 + Phase 6: tidy layout (in-order x, depth y), no force
 * simulation. The edge into the current node draws (stroke dash-in) BEFORE
 * that node's fill lights up, so a traversal step reads as "travel along
 * this edge, then arrive" rather than two things popping at once. A newly
 * inserted node scales in FROM its parent's position rather than from
 * nowhere. Nodes a pointer merely passes over (not the terminal one this
 * step) get a read ring-pulse instead of the current node's solid fill.
 */
export default function TreeRenderer({ rootVars, pointerVars }: TreeRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();

  const tree = useMemo(() => computeMergedTree(steps, rootVars, currentStep), [steps, rootVars, currentStep]);
  const prevTree = useMemo(
    () => (currentStep > 0 ? computeMergedTree(steps, rootVars, currentStep - 1) : null),
    [steps, rootVars, currentStep],
  );

  const step = steps[currentStep];
  if (!step || !tree || tree.rootId === null) return null;

  const positions = computeTreeLayout(tree);
  if (positions.length === 0) return null;
  const posById = new Map(positions.map((p) => [p.id, p]));
  const prevIds = new Set((prevTree?.nodes ?? []).map((n) => n.id));

  const parentOf = new Map<number, number>();
  for (const p of positions) {
    if (p.leftId !== null) parentOf.set(p.leftId, p.id);
    if (p.rightId !== null) parentOf.set(p.rightId, p.id);
  }

  const currentIds = new Set<number>();
  for (const name of pointerVars) {
    const id = currentNodeId(step.locals[name]);
    if (id !== null && posById.has(id)) currentIds.add(id);
  }

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
  const edgeLead = edgeLeadSeconds(mode, speed);

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
                // Redraw (dash-in) whenever traversal just arrived at this
                // child via this edge; otherwise it's already-established
                // structure and stays fully drawn without replaying.
                const isActive = currentIds.has(childId);
                return (
                  <motion.line
                    key={isActive ? `${p.id}-${childId}-${currentStep}` : `${p.id}-${childId}`}
                    initial={isActive ? { ...coords, pathLength: 0 } : { ...coords, pathLength: 1 }}
                    animate={{ ...coords, pathLength: 1 }}
                    transition={isActive ? edgeTransition(mode, speed) : moveTransition(mode, speed)}
                    stroke="#111111"
                    strokeWidth={2}
                  />
                );
              }),
          )}
        </svg>
        {positions.map((p) => {
          const chips = chipsByNode.get(p.id) ?? [];
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
              animate={{
                ...pos,
                scale: 1,
                opacity: 1,
                backgroundColor: isCurrent ? "#4F46E5" : "#FDF6E3",
              }}
              transition={{
                default: moveTransition(mode, speed),
                backgroundColor: { duration: pulseTransition(mode, speed).duration, delay: isCurrent ? edgeLead : 0 },
              }}
              className={`absolute flex items-center justify-center border-2 shadow-neo-sm rounded-full font-mono text-sm ${
                isCurrent ? "border-accent text-paper" : "border-ink text-ink"
              }`}
              style={{ width: NODE_R * 2, height: NODE_R * 2 }}
            >
              {formatValue(p.val)}
              {isCurrent && (
                <motion.span
                  key={`ping-${p.id}-${currentStep}`}
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.4 }}
                  transition={{ ...pulseTransition(mode, speed), delay: edgeLead }}
                  className="absolute inset-0 rounded-full border-2 border-pop pointer-events-none"
                />
              )}
              {chips.length > 0 && (
                <div className="absolute -bottom-6 flex gap-0.5">
                  {chips.map((c) => (
                    <motion.span
                      layoutId={`treeptr-${c}`}
                      key={c}
                      transition={chipTransition(mode, speed)}
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
