"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import { asLinkedList, canonicalNodeOrder, computeStepConnectivity } from "@/lib/renderers/linkedListLayout";

interface LinkedListRendererProps {
  headVars: string[];
  pointerVars: string[];
}

const NODE_W = 56;
const NODE_H = 40;
const GAP = 40;
const ROW_TOP = 20;

/** master.md §9.5 — nodes stay at a fixed canonical x position for the
 * whole trace; only the arrows between them change as pointers move or
 * the list reverses in place, which reads naturally as arrows flipping
 * direction rather than nodes rearranging. */
export default function LinkedListRenderer({ headVars, pointerVars }: LinkedListRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
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

  const conn = computeStepConnectivity(step, allVars);
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

  return (
    <div className="flex flex-col gap-1 pb-6 overflow-x-auto">
      <div className="relative" style={{ width, height: svgHeight }}>
        <svg className="absolute inset-0 pointer-events-none" width={width} height={svgHeight}>
          <defs>
            <marker id="ll-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#111111" />
            </marker>
          </defs>
          {order.map((id) => {
            if (!conn.reachable.has(id)) return null;
            const nextId = conn.edges.get(id);
            if (nextId === null || nextId === undefined) return null;
            const nextIndex = indexOf.get(nextId);
            if (nextIndex === undefined) return null;
            const x1 = (indexOf.get(id) ?? 0) * stride + NODE_W;
            const x2 = nextIndex * stride;
            const y = ROW_TOP + NODE_H / 2;
            return (
              <motion.line
                key={id}
                initial={{ x1, x2, y1: y, y2: y }}
                animate={{ x1, x2, y1: y, y2: y }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                stroke="#111111"
                strokeWidth={2}
                markerEnd="url(#ll-arrow)"
              />
            );
          })}
        </svg>
        {order.map((id, i) => {
          if (!everSeen.has(id)) return null;
          const isReachable = conn.reachable.has(id);
          const chips = chipsByNode.get(id) ?? [];
          return (
            <motion.div
              key={id}
              animate={{ left: i * stride, top: isReachable ? ROW_TOP : ROW_TOP + 10, opacity: isReachable ? 1 : 0.3 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
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
