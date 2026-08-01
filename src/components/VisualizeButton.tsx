"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTraceStore } from "@/lib/store/traceStore";

/** Phase 6 chrome micro-delight: "Visualize button jolts on trace-ready."
 * Edge-triggered on the preprocessing/warming/running -> ready transition
 * (not on every render while status stays "ready"), via a pulse counter
 * that remounts the inner motion.span so the jolt replays every time. */
export default function VisualizeButton() {
  const visualize = useTraceStore((s) => s.visualize);
  const status = useTraceStore((s) => s.status);
  const busy = status === "preprocessing" || status === "warming" || status === "running";

  const [pulseKey, setPulseKey] = useState(0);
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current !== "ready" && status === "ready") {
      setPulseKey((k) => k + 1);
    }
    prevStatus.current = status;
  }, [status]);

  return (
    <button
      type="button"
      onClick={() => void visualize()}
      disabled={busy}
      className="btn-neo-accent disabled:opacity-60 disabled:cursor-wait"
    >
      <motion.span
        key={pulseKey}
        className="inline-block"
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: [1, 1.18, 0.94, 1], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {busy ? "Visualizing…" : "Visualize"}
      </motion.span>
    </button>
  );
}
