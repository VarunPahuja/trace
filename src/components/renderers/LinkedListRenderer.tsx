"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import { asLinkedList, canonicalNodeOrder, computeStepConnectivity } from "@/lib/renderers/linkedListLayout";
import { nearestRelevantStepIndex } from "@/lib/renderers/stepScope";
import { chipTransition, moveTransition, useMotionMode } from "@/lib/motion/timing";

interface LinkedListRendererProps {
  headVars: string[];
  pointerVars: string[];
}

const NODE_W = 56;
const NODE_H = 40;
const GAP = 40;
const ROW_TOP = 20;
const DETACHED_DRIFT_PX = 28;

/** master.md §9.5 + Phase 6: nodes stay at a fixed canonical x position for
 * the whole trace; only the arrows between them change as pointers move or
 * the list reverses in place, which reads naturally as arrows flipping
 * direction rather than nodes rearranging. Detached nodes (no longer
 * reachable from any tracked variable) drift down and fade rather than
 * snapping away. Edges are keyed by their *unordered* node pair so a
 * reversal (A->B becomes B->A) animates the same line element flipping
 * endpoints instead of one arrow vanishing and an unrelated one appearing.
 */
export default function LinkedListRenderer({ headVars, pointerVars }: LinkedListRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const { mode, speed } = useMotionMode();
  const allVars = useMemo(() => [...headVars, ...pointerVars], [headVars, pointerVars]);

  const order = useMemo(() => canonicalNodeOrder(steps, allVars), [steps, allVars]);

  // A node's .val is set once at construction and never reassigned by these
  // algorithms, so the last value seen for a node (even in an earlier step,
  // once it's out of scope) is still its correct value — falling back to
  // "current step only" would show a misleading "None" for any node not
  // reachable from a variable in the *current* frame (e.g. a sentinel/dummy
  // node built in a different function than the one currently executing).
  const { everSeen, lastKnownValueById } = useMemo(() => {
    const set = new Set<number>();
    const values = new Map<number, (typeof steps)[number]["locals"][string]>();
    for (let i = 0; i <= currentStep && i < steps.length; i++) {
      for (const name of allVars) {
        const ll = asLinkedList(steps[i].locals[name]);
        if (!ll) continue;
        for (const n of ll.nodes) {
          set.add(n.id);
          values.set(n.id, n.val);
        }
      }
    }
    return { everSeen: set, lastKnownValueById: values };
  }, [steps, currentStep, allVars]);

  const step = steps[currentStep];
  if (!step || order.length === 0) return null;

  const connStep = steps[nearestRelevantStepIndex(steps, currentStep, allVars)];
  const conn = computeStepConnectivity(connStep, allVars);
  const stride = NODE_W + GAP;
  const indexOf = new Map(order.map((id, i) => [id, i]));

  const chipsByNode = new Map<number, string[]>();
  for (const [name, id] of conn.headOf) {
    if (id === null) continue;
    const list = chipsByNode.get(id) ?? [];
    list.push(name);
    chipsByNode.set(id, list);
  }

  const width = order.length * stride;
  const svgHeight = NODE_H + ROW_TOP + 8;

  const edgeEntries: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const [id, nextId] of conn.edges) {
    if (nextId === null || nextId === undefined) continue;
    const iFrom = indexOf.get(id);
    const iTo = indexOf.get(nextId);
    if (iFrom === undefined || iTo === undefined) continue;
    const forward = iFrom <= iTo;
    const [loId, hiId] = forward ? [id, nextId] : [nextId, id];
    edgeEntries.push({
      key: `${loId}-${hiId}`,
      x1: iFrom * stride + NODE_W,
      y1: ROW_TOP + NODE_H / 2,
      x2: iTo * stride,
      y2: ROW_TOP + NODE_H / 2,
    });
  }

  return (
    <div className="flex flex-col gap-1 pb-6 overflow-x-auto">
      <div className="relative" style={{ width, height: svgHeight }}>
        <svg className="absolute inset-0 pointer-events-none" width={width} height={svgHeight}>
          <defs>
            <marker id="ll-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#111111" />
            </marker>
          </defs>
          <AnimatePresence initial={false}>
            {edgeEntries.map(({ key, x1, y1, x2, y2 }) => (
              <motion.line
                key={key}
                initial={{ x1, x2, y1, y2, opacity: 0 }}
                animate={{ x1, x2, y1, y2, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={moveTransition(mode, speed)}
                stroke="#111111"
                strokeWidth={2}
                markerEnd="url(#ll-arrow)"
              />
            ))}
          </AnimatePresence>
        </svg>
        {order.map((id, i) => {
          if (!everSeen.has(id)) return null;
          const isReachable = conn.reachable.has(id);
          const chips = chipsByNode.get(id) ?? [];
          return (
            <motion.div
              key={id}
              animate={{
                left: i * stride,
                top: isReachable ? ROW_TOP : ROW_TOP + DETACHED_DRIFT_PX,
                opacity: isReachable ? 1 : 0,
              }}
              transition={moveTransition(mode, speed)}
              className="absolute flex items-center justify-center border-2 border-ink shadow-neo-sm rounded-md bg-paper font-mono text-sm"
              style={{ width: NODE_W, height: NODE_H }}
            >
              {formatValue(lastKnownValueById.get(id) ?? null)}
              {chips.length > 0 && (
                <div className="absolute -bottom-6 flex gap-0.5">
                  {chips.map((c) => (
                    <motion.span
                      layoutId={`llptr-${c}`}
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
