"use client";

import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";
import { ARRAY_CELL_GAP_PX, ARRAY_CELL_SIZE_PX } from "@/lib/renderers/layoutConstants";

interface WindowOverlayProps {
  startVar?: string;
  endVar?: string;
}

/** master.md §9.2 — rendered as a sibling inside ArrayRenderer's relative
 * cell row (passed via its `overlay` prop) so left/width line up exactly. */
export default function WindowOverlay({ startVar, endVar }: WindowOverlayProps) {
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const step = steps[currentStep];
  if (!step || !startVar || !endVar) return null;

  const start = step.locals[startVar];
  const end = step.locals[endVar];
  if (typeof start !== "number" || typeof end !== "number" || end < start) return null;

  // Pad past the cells' own bounds so the band reads as a visible frame
  // rather than being fully hidden behind the cells' opaque fill (they sit
  // above it in z-order, covering everything but the inter-cell gaps).
  const pad = 5;
  const stride = ARRAY_CELL_SIZE_PX + ARRAY_CELL_GAP_PX;
  const left = start * stride - pad;
  const width = (end - start + 1) * stride - ARRAY_CELL_GAP_PX + pad * 2;

  return (
    <motion.div
      className="absolute rounded-lg bg-accent/20 border-2 border-accent pointer-events-none z-0"
      style={{ top: -pad, height: ARRAY_CELL_SIZE_PX + pad * 2 }}
      animate={{ left, width }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    />
  );
}
