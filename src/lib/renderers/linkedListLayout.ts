import type { SerializedLinkedList, SerializedValue, TraceStep } from "@/lib/trace/types";

export function asLinkedList(value: SerializedValue | undefined): SerializedLinkedList | null {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as SerializedLinkedList).type === "linkedlist"
  ) {
    return value as SerializedLinkedList;
  }
  return null;
}

/** Stable left-to-right node order for the whole trace, in first-seen order
 * across every step and every relevant variable — so nodes never jump
 * around as pointers move or the list gets reversed in place. */
export function canonicalNodeOrder(steps: TraceStep[], varNames: string[]): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const step of steps) {
    for (const name of varNames) {
      const ll = asLinkedList(step.locals[name]);
      if (!ll) continue;
      for (const node of ll.nodes) {
        if (!seen.has(node.id)) {
          seen.add(node.id);
          order.push(node.id);
        }
      }
    }
  }
  return order;
}

export interface StepConnectivity {
  /** nodeId -> next nodeId, or null if this reference's walk ends there. */
  edges: Map<number, number | null>;
  reachable: Set<number>;
  valueById: Map<number, SerializedValue>;
  /** varName -> node id it currently points to (null if None this step). */
  headOf: Map<string, number | null>;
}

/** A node's `.next` is real mutable state on one shared object, so if two
 * variables' walks both pass through it, they necessarily agree — no
 * conflict resolution needed when merging edges across variables. */
export function computeStepConnectivity(step: TraceStep, varNames: string[]): StepConnectivity {
  const edges = new Map<number, number | null>();
  const reachable = new Set<number>();
  const valueById = new Map<number, SerializedValue>();
  const headOf = new Map<string, number | null>();

  for (const name of varNames) {
    const ll = asLinkedList(step.locals[name]);
    if (!ll || ll.nodes.length === 0) {
      headOf.set(name, null);
      continue;
    }
    headOf.set(name, ll.nodes[0].id);
    for (let i = 0; i < ll.nodes.length; i++) {
      const node = ll.nodes[i];
      reachable.add(node.id);
      valueById.set(node.id, node.val);
      edges.set(node.id, i < ll.nodes.length - 1 ? ll.nodes[i + 1].id : null);
    }
  }

  return { edges, reachable, valueById, headOf };
}
