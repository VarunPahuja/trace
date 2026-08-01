// Serialized array elements carry no stable identity (they're plain JSON
// values), so a true swap can't be tracked via React keys the way node
// identity is for linked lists/trees. Instead we detect the shape of a swap
// heuristically: exactly two indices changed, and each took the other's old
// value. Renderers use this to draw a transient "ghost" overlay that arcs
// between the two positions (Phase 6: "Swaps arc. Cells travel past each
// other with +-14px vertical arc, squash on landing.") while the resting
// cells underneath update instantly.
import type { SerializedValue } from "@/lib/trace/types";

export interface SwapPair {
  i: number;
  j: number;
}

export function detectSwap(
  prev: SerializedValue[] | null | undefined,
  next: SerializedValue[] | null | undefined,
): SwapPair | null {
  if (!prev || !next || prev.length !== next.length) return null;
  const changed: number[] = [];
  for (let i = 0; i < next.length; i++) {
    if (JSON.stringify(prev[i]) !== JSON.stringify(next[i])) {
      changed.push(i);
      if (changed.length > 2) return null;
    }
  }
  if (changed.length !== 2) return null;
  const [a, b] = changed;
  if (
    JSON.stringify(prev[a]) === JSON.stringify(next[b]) &&
    JSON.stringify(prev[b]) === JSON.stringify(next[a]) &&
    JSON.stringify(prev[a]) !== JSON.stringify(prev[b])
  ) {
    return { i: a, j: b };
  }
  return null;
}
