"use client";

// Phase 6 hard rules (see project brief, not master.md — this predates the
// animation pass): "All timings / speed multiplier. Step-mode = 150ms
// compressed versions of the same animations. Scrub = jump-render, zero
// animation." Every renderer should source its transitions from here
// instead of hand-rolling `{ type: "spring", stiffness, damping }` so the
// three playback modes (play / step / scrub) stay consistent everywhere.
import type { Transition } from "framer-motion";
import { useTraceStore, type PlaybackMode } from "@/lib/store/traceStore";

export type { PlaybackMode };

type Kind = "move" | "chip" | "pulse" | "write" | "edge" | "squash";

// Base durations (seconds) before the speed multiplier is applied. "play"
// values roughly track master.md §12 (240ms pulses, ~300/24 springs settle
// around 300-400ms); "step" is the flat 150ms compressed variant.
const BASE: Record<Kind, { play: number; step: number }> = {
  move: { play: 0.35, step: 0.15 },
  chip: { play: 0.4, step: 0.15 },
  pulse: { play: 0.24, step: 0.15 },
  write: { play: 0.3, step: 0.15 },
  edge: { play: 0.2, step: 0.15 },
  squash: { play: 0.3, step: 0.15 },
};

/** Seconds for a given animation kind, mode and speed multiplier. Scrub is
 * always 0 (jump-render, no animation). */
export function scaledSeconds(kind: Kind, mode: PlaybackMode, speed: number): number {
  if (mode === "scrub") return 0;
  const base = mode === "step" ? BASE[kind].step : BASE[kind].play;
  return base / Math.max(speed, 0.0001);
}

/** General movement/layout spring — array cell shifts, tree/graph node
 * repositioning, list node moves. */
export function moveTransition(mode: PlaybackMode, speed: number, bounce = 0.15): Transition {
  const duration = scaledSeconds("move", mode, speed);
  if (duration === 0) return { duration: 0 };
  return { type: "spring", duration, bounce };
}

/** Pointer chip glide — spec: "flicked, not slid," springier overshoot than
 * general movement. */
export function chipTransition(mode: PlaybackMode, speed: number): Transition {
  const duration = scaledSeconds("chip", mode, speed);
  if (duration === 0) return { duration: 0 };
  return { type: "spring", duration, bounce: 0.4 };
}

/** Read: outline pulse, 240ms tween. */
export function pulseTransition(mode: PlaybackMode, speed: number): Transition {
  return { duration: scaledSeconds("pulse", mode, speed) };
}

/** Write: fill + scale 1.0 -> 1.12 -> 1.0. A 3-keyframe pulse, so this has
 * to be a tween — Framer Motion springs only support two keyframes
 * (https://motion.dev/troubleshooting/spring-two-frames). */
export function writeTransition(mode: PlaybackMode, speed: number): Transition {
  return { duration: scaledSeconds("write", mode, speed), ease: "easeOut", times: [0, 0.5, 1] };
}

/** Tree/graph active-edge stroke draw — must finish BEFORE the target node
 * highlight starts (caller is responsible for the sequencing delay). */
export function edgeTransition(mode: PlaybackMode, speed: number): Transition {
  return { duration: scaledSeconds("edge", mode, speed), ease: "easeInOut" };
}

/** Push/pop squash-and-settle weight — another multi-keyframe pulse, so
 * tween rather than spring (see writeTransition). */
export function squashTransition(mode: PlaybackMode, speed: number): Transition {
  return {
    duration: scaledSeconds("squash", mode, speed),
    ease: "easeOut",
    times: [0, 0.4, 0.7, 1],
  };
}

/** Delay (seconds) for the Nth element in a multi-change step's stagger. */
export function staggerDelay(index: number, mode: PlaybackMode, speed: number): number {
  if (mode === "scrub") return 0;
  const baseMs = mode === "step" ? 15 : 40;
  return (baseMs / 1000) * index / Math.max(speed, 0.0001);
}

/** How long the edge-draw takes before the node-light delay should fire,
 * in seconds — used to offset the node highlight's own `delay`. */
export function edgeLeadSeconds(mode: PlaybackMode, speed: number): number {
  return scaledSeconds("edge", mode, speed);
}

export function useMotionMode(): { mode: PlaybackMode; speed: number } {
  const mode = useTraceStore((s) => s.playbackMode);
  const speed = useTraceStore((s) => s.speed);
  return { mode, speed };
}
