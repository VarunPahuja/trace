"use client";

import { useEffect } from "react";
import { useTraceStore } from "./traceStore";
import { SPEEDS } from "./playbackSpeeds";

/** master.md §11: space = play/pause, ←/→ = step, [ ] = speed down/up.
 * Ignored while focus is in the editor or any text input so normal typing
 * (spaces, arrow-key cursor movement) isn't hijacked. */
export function useKeyboardShortcuts() {
  useEffect(() => {
    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest(".cm-editor")) return true;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      const state = useTraceStore.getState();
      if (state.steps.length === 0) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (state.playing) state.pause();
          else state.play();
          break;
        case "ArrowRight":
          e.preventDefault();
          state.stepForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          state.stepBack();
          break;
        case "[": {
          e.preventDefault();
          const idx = SPEEDS.indexOf(state.speed as (typeof SPEEDS)[number]);
          const next = SPEEDS[Math.max(idx - 1, 0)];
          state.setSpeed(next);
          break;
        }
        case "]": {
          e.preventDefault();
          const idx = SPEEDS.indexOf(state.speed as (typeof SPEEDS)[number]);
          const next = SPEEDS[Math.min(idx + 1, SPEEDS.length - 1)];
          state.setSpeed(next);
          break;
        }
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
