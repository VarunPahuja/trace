"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { computeCallTree, computeCallTreeLayout, flattenCallTree, type CallTreeNode } from "@/lib/renderers/callTree";

const NODE_W = 64;
const NODE_H = 28;
const SPACING_X = 76;
const SPACING_Y = 52;
const TOP_PAD = 16;

/** master.md §9.6 Backtracking variant: recursion tree built from call
 * events. Active-path nodes (still on the call stack) fill accent; a node
 * fills green for the one step it returns on; everything else that has
 * already returned fades to 30% — de-emphasizing explored branches while
 * keeping the current path legible. */
export default function CallTreeRenderer() {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);

  const roots = useMemo(() => computeCallTree(steps, currentStep), [steps, currentStep]);
  const positions = useMemo(() => computeCallTreeLayout(roots), [roots]);
  const nodes = useMemo(() => flattenCallTree(roots), [roots]);

  if (nodes.length === 0) return null;

  // computeCallTree only processes steps up to currentStep, so any
  // returnedAtStep it recorded is already <= currentStep — "active" (on
  // the current call stack) simply means "hasn't returned yet."
  const activeNodeIds = new Set(nodes.filter((node) => node.returnedAtStep === null).map((node) => node.id));

  const parentOf = new Map<number, number>();
  function linkParents(list: CallTreeNode[], parentId: number | null) {
    for (const node of list) {
      if (parentId !== null) parentOf.set(node.id, parentId);
      linkParents(node.children, node.id);
    }
  }
  linkParents(roots, null);

  const maxX = Math.max(...[...positions.values()].map((p) => p.x));
  const maxY = Math.max(...[...positions.values()].map((p) => p.y));
  const width = (maxX + 1) * SPACING_X;
  const height = (maxY + 1) * SPACING_Y + TOP_PAD + 20;
  const xPos = (x: number) => x * SPACING_X + SPACING_X / 2;
  const yPos = (y: number) => y * SPACING_Y + TOP_PAD;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative" style={{ width, height }}>
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
          {nodes.map((node) => {
            const parentId = parentOf.get(node.id);
            if (parentId === undefined) return null;
            const p = positions.get(parentId);
            const c = positions.get(node.id);
            if (!p || !c) return null;
            const coords = { x1: xPos(p.x), y1: yPos(p.y), x2: xPos(c.x), y2: yPos(c.y) };
            return (
              <motion.line
                key={node.id}
                initial={coords}
                animate={coords}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                stroke="#111111"
                strokeWidth={2}
              />
            );
          })}
        </svg>
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const justReturned = node.returnedAtStep === currentStep;
          const isActive = activeNodeIds.has(node.id);
          const isFaded = !isActive && !justReturned;
          const cx = { left: xPos(pos.x) - NODE_W / 2, top: yPos(pos.y) - NODE_H / 2 };
          return (
            <motion.div
              key={node.id}
              initial={{ ...cx, scale: 0.5, opacity: 0 }}
              animate={{ ...cx, scale: 1, opacity: isFaded ? 0.3 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`absolute flex items-center justify-center border-2 border-ink shadow-neo-sm rounded-md font-mono text-[10px] whitespace-nowrap px-1 ${
                justReturned ? "bg-go text-paper" : isActive ? "bg-accent text-paper" : "bg-paper text-ink"
              }`}
              style={{ width: NODE_W, height: NODE_H }}
              title={node.fn}
            >
              {node.label || node.fn}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
