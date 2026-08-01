"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { computeCallTree, computeCallTreeLayout, flattenCallTree, type CallTreeNode } from "@/lib/renderers/callTree";
import { edgeLeadSeconds, edgeTransition, moveTransition, squashTransition, useMotionMode } from "@/lib/motion/timing";

const NODE_W = 64;
const NODE_H = 28;
const SPACING_X = 76;
const SPACING_Y = 52;
const TOP_PAD = 16;

/** master.md §9.6 Backtracking variant: recursion tree built from call
 * events. Active-path nodes (still on the call stack) fill accent; a node
 * fills green for the one step it returns on; everything else that has
 * already returned fades to 30% — de-emphasizing explored branches while
 * keeping the current path legible. Phase 6: a call "pushes" a new node —
 * it drops in from above with squash-and-settle, and the edge into it
 * draws first. A return "pops" — a one-shot lift+fade+rotate flourish on
 * the exact step it returns, then it settles into the permanent faded
 * state. `node.id` is literally the call event's step index, so "is this
 * brand new" is just `node.id === currentStep` — no extra bookkeeping. */
export default function CallTreeRenderer() {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();

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
  const edgeLead = edgeLeadSeconds(mode, speed);

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
            const isNew = node.id === currentStep;
            return (
              <motion.line
                key={node.id}
                initial={isNew ? { ...coords, pathLength: 0 } : { ...coords, pathLength: 1 }}
                animate={{ ...coords, pathLength: 1 }}
                transition={isNew ? edgeTransition(mode, speed) : moveTransition(mode, speed)}
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
          const isNew = node.id === currentStep;
          const cx = { left: xPos(pos.x) - NODE_W / 2, top: yPos(pos.y) - NODE_H / 2 };
          const targetOpacity = isFaded ? 0.3 : 1;

          return (
            <motion.div
              key={node.id}
              initial={isNew ? { ...cx, y: -24, scaleY: 0.8, opacity: 0 } : false}
              animate={
                justReturned
                  ? { ...cx, y: [0, -12, 0], rotate: [0, node.id % 2 === 0 ? 4 : -4, 0], opacity: [1, 1, 0.3] }
                  : isNew
                    ? { ...cx, y: 0, scaleY: [0.8, 1.15, 0.95, 1], opacity: targetOpacity, rotate: 0 }
                    : { ...cx, y: 0, scaleY: 1, opacity: targetOpacity, rotate: 0 }
              }
              transition={{
                // justReturned/isNew animate 3+ keyframe arrays (squash,
                // lift-fade-rotate) which springs can't do — only two
                // keyframes are supported there (see
                // motion.dev/troubleshooting/spring-two-frames) — so those
                // cases use the tween-based squashTransition instead. A
                // settled node (neither) only ever targets plain scalar
                // values, so the spring is safe for it.
                default: isNew || justReturned ? squashTransition(mode, speed) : moveTransition(mode, speed),
                left: { ...moveTransition(mode, speed), delay: isNew ? edgeLead : 0 },
                top: { ...moveTransition(mode, speed), delay: isNew ? edgeLead : 0 },
              }}
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
