import { formatValue } from "@/lib/trace/format";
import type { SerializedDict, SerializedValue } from "@/lib/trace/types";

export function asDict(value: SerializedValue | undefined): SerializedDict | null {
  if (value && typeof value === "object" && !Array.isArray(value) && (value as SerializedDict).type === "dict") {
    return value as SerializedDict;
  }
  return null;
}

interface Neighbor {
  neighbor: SerializedValue;
  weight?: SerializedValue;
}

/** Adjacency values are either a plain neighbor list (BFS-style) or a list
 * of [neighbor, weight] pairs (Dijkstra-style) — detected structurally
 * since both are legal Python adjacency-list shapes we can't tell apart
 * from the role alone. */
function neighborsOf(value: SerializedValue): Neighbor[] {
  if (!Array.isArray(value)) return [];
  return value.map((item): Neighbor => {
    if (Array.isArray(item) && item.length === 2) {
      return { neighbor: item[0], weight: item[1] };
    }
    return { neighbor: item };
  });
}

export function collectGraphNodeKeys(dict: SerializedDict): string[] {
  const keys = new Set<string>();
  for (const [k, v] of dict.entries) {
    keys.add(formatValue(k));
    for (const { neighbor } of neighborsOf(v)) keys.add(formatValue(neighbor));
  }
  return [...keys];
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: SerializedValue;
}

export function collectGraphEdges(dict: SerializedDict): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  for (const [k, v] of dict.entries) {
    const from = formatValue(k);
    for (const { neighbor, weight } of neighborsOf(v)) {
      const to = formatValue(neighbor);
      const edgeKey = [from, to].sort().join("|");
      if (seen.has(edgeKey)) continue;
      seen.add(edgeKey);
      edges.push({ from, to, weight });
    }
  }
  return edges;
}

export function computeCircularLayout(
  nodeKeys: string[],
  radius: number,
  cx: number,
  cy: number,
): Map<string, { x: number; y: number }> {
  const n = nodeKeys.length;
  const positions = new Map<string, { x: number; y: number }>();
  nodeKeys.forEach((key, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions.set(key, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  });
  return positions;
}
