import type { SerializedTree, SerializedValue, TraceStep } from "@/lib/trace/types";

export function asTree(value: SerializedValue | undefined): SerializedTree | null {
  if (value && typeof value === "object" && !Array.isArray(value) && (value as SerializedTree).type === "tree") {
    return value as SerializedTree;
  }
  return null;
}

/** The node id a tree-shaped pointer variable currently points at. */
export function currentNodeId(value: SerializedValue | undefined): number | null {
  const t = asTree(value);
  return t ? t.rootId : null;
}

export interface TreeNodePosition {
  id: number;
  /** In-order index — master.md §9.6 tidy layout: in-order x, depth y. */
  x: number;
  y: number;
  val: SerializedValue;
  leftId: number | null;
  rightId: number | null;
  /** n-ary children (Tries) — when present, layout ignores leftId/rightId. */
  childIds?: number[];
}

/** During recursion, a treeRoot/pointer variable is very often `None` in
 * the *current* frame (e.g. the parameter is null at a leaf call) even
 * though the overall tree still exists via an outer frame we can't see in
 * a single-frame snapshot. Node ids are stable and a node's children only
 * ever get filled in (never unset) by these algorithms, so merging every
 * node ever seen — up to and including the current step, later steps
 * overwriting earlier ones — reconstructs the true accumulated shape. The
 * root is whichever merged node nobody else lists as a child. */
export function computeMergedTree(steps: TraceStep[], varNames: string[], uptoStep: number): SerializedTree | null {
  const byId = new Map<number, { val: SerializedValue; left: number | null; right: number | null }>();
  for (let i = 0; i <= uptoStep && i < steps.length; i++) {
    for (const name of varNames) {
      const t = asTree(steps[i].locals[name]);
      if (!t) continue;
      for (const n of t.nodes) byId.set(n.id, { val: n.val, left: n.left, right: n.right });
    }
  }
  if (byId.size === 0) return null;

  const childIds = new Set<number>();
  for (const n of byId.values()) {
    if (n.left !== null) childIds.add(n.left);
    if (n.right !== null) childIds.add(n.right);
  }
  const rootId = [...byId.keys()].find((id) => !childIds.has(id)) ?? null;
  const nodes = [...byId.entries()].map(([id, n]) => ({ id, val: n.val, left: n.left, right: n.right }));
  return { type: "tree", nodes, rootId };
}

/** Binary tree: recomputed fresh each step from the current shape — correct
 * (not a limitation) since a growing BST's in-order positions genuinely
 * shift as nodes are inserted; a static traversal-only tree just stays put. */
export function computeTreeLayout(tree: SerializedTree): TreeNodePosition[] {
  const byId = new Map(tree.nodes.map((n) => [n.id, n]));
  const positions: TreeNodePosition[] = [];
  const visited = new Set<number>();
  let xCounter = 0;

  function visit(id: number | null, depth: number) {
    if (id === null || visited.has(id)) return;
    visited.add(id);
    const node = byId.get(id);
    if (!node) return;
    visit(node.left, depth + 1);
    const x = xCounter++;
    positions.push({ id, x, y: depth, val: node.val, leftId: node.left, rightId: node.right });
    visit(node.right, depth + 1);
  }

  if (tree.rootId !== null) visit(tree.rootId, 0);
  return positions;
}
