import type { TraceStep } from "@/lib/trace/types";

/** A variable can be transiently absent from the *current* frame's locals
 * (e.g. inside a sort key lambda, or any helper call) even though its
 * value hasn't conceptually changed — same class of issue fixed for
 * LinkedList/Tree, but here we just want the most recent snapshot rather
 * than a structural merge, since plain lists/dicts are wholesale replaced
 * by assignment rather than grown by shared node identity. */
export function lastKnownArray<T = unknown>(
  steps: TraceStep[],
  currentStep: number,
  varName: string,
): T[] | null {
  for (let i = currentStep; i >= 0; i--) {
    const v = steps[i]?.locals[varName];
    if (Array.isArray(v)) return v as T[];
  }
  return null;
}
