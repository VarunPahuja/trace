// Step diffing — master.md §8: "The playback engine derives diffs between
// consecutive steps (changed variables, moved pointers, added/removed
// nodes) at load time and stores them alongside steps, so renderers
// animate transitions rather than re-render from scratch."
import type { SerializedValue, TraceStep } from "./types";

export interface StepDiff {
  added: string[];
  removed: string[];
  changed: string[];
}

const EMPTY_DIFF: StepDiff = { added: [], removed: [], changed: [] };

function valuesEqual(a: SerializedValue | undefined, b: SerializedValue | undefined): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffLocals(
  prev: Record<string, SerializedValue>,
  next: Record<string, SerializedValue>,
): StepDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  for (const key of Object.keys(next)) {
    if (!(key in prev)) {
      added.push(key);
    } else if (!valuesEqual(prev[key], next[key])) {
      changed.push(key);
    }
  }
  for (const key of Object.keys(prev)) {
    if (!(key in next)) removed.push(key);
  }
  return { added, removed, changed };
}

/** diffs[i] describes the change from steps[i-1] to steps[i]; diffs[0] is always empty. */
export function computeStepDiffs(steps: TraceStep[]): StepDiff[] {
  const diffs: StepDiff[] = [];
  for (let i = 0; i < steps.length; i++) {
    if (i === 0) {
      diffs.push(EMPTY_DIFF);
      continue;
    }
    diffs.push(diffLocals(steps[i - 1].locals, steps[i].locals));
  }
  return diffs;
}
