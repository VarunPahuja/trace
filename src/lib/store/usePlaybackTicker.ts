"use client";

import { useEffect } from "react";
import { useTraceStore } from "./traceStore";

const BASE_STEP_INTERVAL_MS = 450;

/** Drives auto-advance while `playing` is true. Mount once near the control deck. */
export function usePlaybackTicker() {
  const playing = useTraceStore((s) => s.playing);
  const speed = useTraceStore((s) => s.speed);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      const state = useTraceStore.getState();
      if (!state.playing) return;
      if (state.currentStep >= state.steps.length - 1) {
        useTraceStore.setState({ playing: false });
        return;
      }
      useTraceStore.setState({ currentStep: state.currentStep + 1 });
    }, BASE_STEP_INTERVAL_MS / speed);
    return () => clearInterval(interval);
  }, [playing, speed]);
}
