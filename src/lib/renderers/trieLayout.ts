import type { SerializedTrie, SerializedValue } from "@/lib/trace/types";

export function asTrie(value: SerializedValue | undefined): SerializedTrie | null {
  if (value && typeof value === "object" && !Array.isArray(value) && (value as SerializedTrie).type === "trie") {
    return value as SerializedTrie;
  }
  return null;
}

export interface TrieNodePosition {
  id: number;
  x: number;
  y: number;
  isWord?: boolean;
  /** [edgeLabel, childId] pairs, same order as the source node. */
  children: [SerializedValue, number][];
}

/** Tidy n-ary layout (master.md §9.6): leaves get sequential x in traversal
 * order, each parent's x is the mean of its children's — no force sim,
 * same approach as the backtracking call tree. */
export function computeTrieLayout(trie: SerializedTrie): TrieNodePosition[] {
  const byId = new Map(trie.nodes.map((n) => [n.id, n]));
  const positions: TrieNodePosition[] = [];
  const visited = new Set<number>();
  let leafCounter = 0;

  function visit(id: number, depth: number): number {
    if (visited.has(id)) return 0;
    visited.add(id);
    const node = byId.get(id);
    if (!node) return 0;

    let x: number;
    if (node.children.length === 0) {
      x = leafCounter++;
    } else {
      const childXs = node.children.map(([, childId]) => visit(childId, depth + 1));
      x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
    }
    positions.push({ id, x, y: depth, isWord: node.isWord, children: node.children });
    return x;
  }

  if (trie.rootId !== null) visit(trie.rootId, 0);
  return positions;
}
