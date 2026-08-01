"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { formatValue } from "@/lib/trace/format";
import type { SerializedArray, SerializedValue } from "@/lib/trace/types";
import { chipTransition, pulseTransition, staggerDelay, useMotionMode, writeTransition } from "@/lib/motion/timing";
import { detectSwap } from "@/lib/renderers/swapDetect";
import { ARRAY_CELL_GAP_PX, ARRAY_CELL_SIZE_PX } from "@/lib/renderers/layoutConstants";

interface ArrayRendererProps {
  varName: string;
  overlay?: React.ReactNode;
  dimRangeStartVar?: string;
  dimRangeEndVar?: string;
}

const STRIDE = ARRAY_CELL_SIZE_PX + ARRAY_CELL_GAP_PX;

/** master.md §9.1 + Phase 6 animation pass:
 * - Read: outline "ping" pulse (240ms, speed/mode-scaled) on any cell a
 *   pointer rests on this step.
 * - Write: fill spring + scale 1 -> 1.12 -> 1 on any cell whose value
 *   changed from the previous step; multi-cell writes in one step stagger
 *   40ms apart so simultaneous changes still read left-to-right.
 * - Swap: serialized values carry no stable identity, so a true swap is
 *   detected heuristically (exactly two indices traded values) and drawn
 *   as a pair of transient "ghost" cells arcing between the two positions
 *   on top of the (instantly-updated) resting cells underneath — see
 *   detectSwap + the ghost overlay below.
 * - Pointer chips (`layoutId`) glide with a springier "flicked" transition
 *   than general movement.
 */
export default function ArrayRenderer({ varName, overlay, dimRangeStartVar, dimRangeEndVar }: ArrayRendererProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const meta = useTraceStore((s) => s.meta);
  const { mode, speed } = useMotionMode();

  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;
  if (!step) return null;

  const value = step.locals[varName];
  if (!Array.isArray(value)) return null;
  const array = value as SerializedArray;

  const prevValue = prevStep?.locals[varName];
  const prevArray = Array.isArray(prevValue) ? (prevValue as SerializedArray) : null;

  const pointerNames = meta
    ? Object.entries(meta.roles)
        .filter(([, role]) => role === "pointer" || role === "windowStart" || role === "windowEnd")
        .map(([name]) => name)
    : [];

  const pointersByIndex = new Map<number, string[]>();
  for (const name of pointerNames) {
    const v = step.locals[name];
    if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < array.length) {
      const list = pointersByIndex.get(v) ?? [];
      list.push(name);
      pointersByIndex.set(v, list);
    }
  }

  const dimStart = dimRangeStartVar ? step.locals[dimRangeStartVar] : undefined;
  const dimEnd = dimRangeEndVar ? step.locals[dimRangeEndVar] : undefined;
  const hasDimRange = typeof dimStart === "number" && typeof dimEnd === "number";

  const swap = detectSwap(prevArray, array);
  const changedIndices: number[] = [];
  if (prevArray) {
    for (let i = 0; i < array.length; i++) {
      if (JSON.stringify(prevArray[i]) !== JSON.stringify(array[i])) changedIndices.push(i);
    }
  }

  return (
    <div className="flex flex-col gap-1 pb-5">
      <div className="font-display text-[10px] uppercase tracking-tight text-ink/50">{varName}</div>
      <div className="relative flex gap-1">
        {overlay}
        {array.map((cell, i) => {
          const isSwapCell = swap !== null && (i === swap.i || i === swap.j);
          const changed = !isSwapCell && changedIndices.includes(i);
          const pointers = pointersByIndex.get(i) ?? [];
          const isRead = pointers.length > 0;
          const isDimmed = hasDimRange && (i < (dimStart as number) || i > (dimEnd as number));
          const delay = changed ? staggerDelay(changedIndices.indexOf(i), mode, speed) : 0;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-1">
              <motion.div
                key={`cell-${i}-${currentStep}`}
                initial={false}
                animate={{
                  backgroundColor: changed ? ["#4F46E5", "#FDF6E3"] : "#FDF6E3",
                  scale: changed ? [1, 1.12, 1] : 1,
                  opacity: isDimmed ? 0.3 : isSwapCell ? 0 : 1,
                }}
                transition={changed ? { ...writeTransition(mode, speed), delay } : { duration: 0.15 }}
                className={`w-10 h-10 flex items-center justify-center border-2 rounded-md shadow-neo-sm font-mono text-sm relative ${
                  isRead ? "border-pop ring-2 ring-pop" : "border-ink"
                }`}
              >
                {formatValue(cell)}
                {isRead && (
                  <motion.span
                    key={`ping-${i}-${currentStep}`}
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.4 }}
                    transition={pulseTransition(mode, speed)}
                    className="absolute inset-0 rounded-md border-2 border-pop pointer-events-none"
                  />
                )}
                {pointers.length > 0 && (
                  <div className="absolute -bottom-6 flex gap-0.5">
                    {pointers.map((p) => (
                      <motion.span
                        layoutId={`ptr-${p}`}
                        key={p}
                        transition={chipTransition(mode, speed)}
                        className="text-[10px] font-display bg-accent text-paper px-1 rounded"
                      >
                        {p}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>
              <div className="text-[10px] font-mono text-ink/40">{i}</div>
            </div>
          );
        })}
        {swap && prevArray && (
          <SwapGhosts
            key={`swap-${currentStep}`}
            swap={swap}
            array={array}
            mode={mode}
            speed={speed}
          />
        )}
      </div>
    </div>
  );
}

/** Phase 6: "Swaps arc. Cells travel past each other with +-14px vertical
 * arc, squash on landing." Two absolutely-positioned ghost cells slide
 * between the swapped indices' x-positions while the real (index-keyed)
 * cells underneath have already snapped to their final values. */
function SwapGhosts({
  swap,
  array,
  mode,
  speed,
}: {
  swap: { i: number; j: number };
  array: SerializedValue[];
  mode: ReturnType<typeof useMotionMode>["mode"];
  speed: number;
}) {
  const pairs = [
    { from: swap.j, to: swap.i, value: array[swap.i] },
    { from: swap.i, to: swap.j, value: array[swap.j] },
  ];
  const transition = writeTransition(mode, speed);
  return (
    <>
      {pairs.map((p, idx) => (
        <motion.div
          key={idx}
          initial={{ left: p.from * STRIDE, y: 0, scaleY: 1, opacity: 1 }}
          animate={{
            left: p.to * STRIDE,
            y: [0, -14, 0],
            scaleY: [1, 1, 0.85, 1],
            opacity: [1, 1, 1, 0],
          }}
          transition={transition}
          className="absolute z-20 top-0 w-10 h-10 flex items-center justify-center border-2 border-accent bg-accent text-paper rounded-md shadow-neo-sm font-mono text-sm pointer-events-none"
        >
          {formatValue(p.value)}
        </motion.div>
      ))}
    </>
  );
}
