"use client";

import { useEffect, useRef } from "react";
import { useTraceStore } from "@/lib/store/traceStore";
import { usePlaybackTicker } from "@/lib/store/usePlaybackTicker";
import { computeStepDiffs } from "@/lib/trace/diff";
import { DEMO_TRACE_STEPS } from "@/lib/examples/demoTrace";
import { twoSumExample } from "@/lib/examples/twoSum";
import VisualizationStage from "@/components/VisualizationStage";
import VariablesStrip from "@/components/VariablesStrip";
import CodePreview from "./CodePreview";

const LOOP_PAUSE_MS = 1100;

/**
 * The landing-page centerpiece: the REAL visualization stage (same
 * VisualizationStage/renderer components the workspace uses), seeded with
 * a statically-baked real trace (src/lib/examples/demoTrace.ts) instead of
 * a live Pyodide run — Phase 7 brief: "the real visualization stage
 * running Two Sum ... on loop with real trace data. No video, no mock."
 *
 * This drives the app's single global trace store (there's no per-page
 * store instance — every renderer reads `useTraceStore` directly), so on
 * unmount it resets the store back to its pristine idle state. Without
 * that, navigating from "/" to "/app" (a soft client-side transition,
 * same JS module state) would land the workspace already mid-loop on the
 * demo trace instead of the clean empty state a first visit should show.
 */
export default function DemoStage() {
  usePlaybackTicker();
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const playing = useTraceStore((s) => s.playing);
  const play = useTraceStore((s) => s.play);

  const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    useTraceStore.setState({
      code: twoSumExample.code,
      input: twoSumExample.input,
      activeExample: twoSumExample,
      meta: twoSumExample.meta,
      status: "ready",
      errorMessage: null,
      errorLine: null,
      steps: DEMO_TRACE_STEPS,
      diffs: computeStepDiffs(DEMO_TRACE_STEPS),
      truncated: false,
      currentStep: 0,
      playing: true,
      speed: 1,
      playbackMode: "play",
    });

    return () => {
      if (loopTimer.current) clearTimeout(loopTimer.current);
      useTraceStore.setState({
        code: "",
        input: "",
        activeExample: null,
        meta: null,
        status: "idle",
        errorMessage: null,
        errorLine: null,
        steps: [],
        diffs: [],
        truncated: false,
        currentStep: 0,
        playing: false,
        speed: 1,
        playbackMode: "scrub",
      });
    };
  }, []);

  // The store's own playback stops (rather than wraps) at the last step —
  // correct for the real product, but the demo needs to loop, so restart
  // it after a short pause once it naturally finishes.
  useEffect(() => {
    if (playing || steps.length === 0 || currentStep !== steps.length - 1) return;
    loopTimer.current = setTimeout(() => play(), LOOP_PAUSE_MS);
    return () => {
      if (loopTimer.current) clearTimeout(loopTimer.current);
    };
  }, [playing, currentStep, steps.length, play]);

  const currentLine = steps[currentStep]?.line || null;

  return (
    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 w-full">
      <CodePreview code={twoSumExample.code} currentLine={currentLine} />
      <div className="flex flex-col gap-4">
        <div className="card-neo flex flex-col min-h-[220px]">
          <VisualizationStage />
        </div>
        <VariablesStrip />
      </div>
    </div>
  );
}
