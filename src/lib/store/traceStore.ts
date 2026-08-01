"use client";

import { create } from "zustand";
import type { TraceResult, TraceStep } from "@/lib/trace/types";
import { computeStepDiffs, type StepDiff } from "@/lib/trace/diff";
import type { Example, PreprocessMeta } from "@/lib/trace/meta";
import { getPyodideClient } from "@/lib/trace/pyodideClient";

export type RunStatus = "idle" | "preprocessing" | "warming" | "running" | "ready" | "error";

interface TraceState {
  code: string;
  // Human-readable input description shown in the Input field. Hand-authored
  // examples embed their actual input values directly in `code` (per the
  // LLM contract's "single entry call" convention, §6) — this field doesn't
  // feed back into `code` for those; live user-input substitution is a
  // Phase 4 (LLM preprocess) concern, not this store's.
  input: string;
  activeExample: Example | null;
  meta: PreprocessMeta | null;

  status: RunStatus;
  errorMessage: string | null;
  errorLine: number | null;

  steps: TraceStep[];
  diffs: StepDiff[];
  truncated: boolean;

  currentStep: number;
  playing: boolean;
  speed: number;

  setCode: (code: string) => void;
  setInput: (input: string) => void;
  loadExample: (example: Example) => void;
  visualize: () => Promise<void>;

  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBack: () => void;
  seek: (index: number) => void;
  setSpeed: (speed: number) => void;
}

export const useTraceStore = create<TraceState>((set, get) => ({
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

  setCode: (code) => set({ code, activeExample: null }),
  setInput: (input) => set({ input }),

  loadExample: (example) => {
    set({
      code: example.code,
      input: example.input,
      activeExample: example,
      meta: example.meta,
      steps: [],
      diffs: [],
      currentStep: 0,
      playing: false,
      status: "idle",
      errorMessage: null,
      errorLine: null,
    });
  },

  visualize: async () => {
    const { code, activeExample, input } = get();
    if (!code.trim()) {
      set({ status: "error", errorMessage: "Paste some Python code first.", errorLine: null });
      return;
    }

    let codeToRun = code;
    let meta = activeExample?.meta ?? get().meta;

    // Clear the previous run's trace immediately — otherwise the control
    // deck/stage keep showing stale step data (e.g. "1/17" from the last
    // run) while a new preprocess/trace is in flight, which reads as a
    // finished result even though status is still preprocessing/warming.
    // Same reasoning applies to `meta` for arbitrary code: without clearing
    // it, the Problem card keeps showing the previous run's problem while
    // the LLM pass is still in flight. Built-in examples already have the
    // right meta set by loadExample, so leave it alone in that case.
    set({ steps: [], diffs: [], currentStep: 0, truncated: false, meta: activeExample ? get().meta : null });

    // Built-in examples ship hand-authored meta and never need the LLM
    // pass (§5); anything else (pasted/edited code) goes through
    // /api/preprocess first so the trace binds to the right renderers.
    if (!activeExample) {
      set({ status: "preprocessing", playing: false, errorMessage: null, errorLine: null });
      try {
        const res = await fetch("/api/preprocess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, userInput: input || undefined }),
        });
        const data = await res.json();
        if (!res.ok) {
          set({ status: "error", errorMessage: data.message ?? "Couldn't read that code.", errorLine: null });
          return;
        }
        codeToRun = data.normalizedCode;
        meta = {
          topic: data.topic,
          subPattern: data.subPattern,
          roles: data.roles,
          inputDescription: data.inputDescription,
          problemName: data.problemName,
          problemSummary: data.problemSummary,
          constraints: data.constraints,
        };
        // Swap the editor to the normalized source so line-highlighting
        // during playback points at the code that actually ran.
        set({ code: codeToRun });
      } catch {
        set({ status: "error", errorMessage: "Couldn't reach the preprocessing service.", errorLine: null });
        return;
      }
    }

    set({ status: "warming", playing: false, errorMessage: null, errorLine: null });

    const client = getPyodideClient();
    if (client.getStatus() !== "ready") {
      await new Promise<void>((resolve) => {
        const offReady = client.onReady(() => {
          offReady();
          offErr();
          resolve();
        });
        const offErr = client.onError((msg) => {
          offReady();
          offErr();
          set({ status: "error", errorMessage: `Python engine failed to load: ${msg}`, errorLine: null });
          resolve();
        });
        client.ensureStarted();
      });
      if (get().status === "error") return;
    }

    set({ status: "running" });
    const result: TraceResult = await client.runTrace(codeToRun);

    if (result.error) {
      set({
        status: "error",
        errorMessage: result.error.message,
        errorLine: result.error.line,
        steps: [],
        diffs: [],
      });
      return;
    }

    set({
      status: "ready",
      steps: result.steps,
      diffs: computeStepDiffs(result.steps),
      truncated: result.truncated,
      currentStep: 0,
      meta,
    });
  },

  play: () => {
    const { steps, currentStep } = get();
    if (steps.length === 0) return;
    set({ playing: true, currentStep: currentStep >= steps.length - 1 ? 0 : currentStep });
  },
  pause: () => set({ playing: false }),
  stepForward: () =>
    set((s) => {
      const next = Math.min(s.currentStep + 1, Math.max(s.steps.length - 1, 0));
      return { currentStep: next, playing: next >= s.steps.length - 1 ? false : s.playing };
    }),
  stepBack: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0), playing: false })),
  seek: (index) =>
    set((s) => ({
      currentStep: Math.min(Math.max(index, 0), Math.max(s.steps.length - 1, 0)),
      playing: false,
    })),
  setSpeed: (speed) => set({ speed }),
}));
