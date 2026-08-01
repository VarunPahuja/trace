import type { Example } from "@/lib/trace/meta";

export const dijkstraExample: Example = {
  id: "dijkstra",
  topic: "Advanced Graphs",
  name: "Dijkstra",
  difficulty: "Medium",
  code: `import heapq

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    visited = set()
    pq = [(0, start)]
    while pq:
        d, node = heapq.heappop(pq)
        if node in visited:
            continue
        visited.add(node)
        for neighbor, weight in graph[node]:
            newDist = d + weight
            if newDist < dist[neighbor]:
                dist[neighbor] = newDist
                heapq.heappush(pq, (newDist, neighbor))
    return dist

graph = {
    0: [(1, 4), (2, 1)],
    1: [(3, 1)],
    2: [(1, 2), (3, 5)],
    3: [(4, 3)],
    4: [],
}
result = dijkstra(graph, 0)
`,
  input: "graph = weighted adjacency list, 5 nodes, start = 0",
  intuition:
    "Always expand whichever frontier node is currently cheapest to reach — a min-heap hands you that for free. Every time you relax an edge and find a shorter path to a neighbor, update its distance and push it back in; once a node is popped as visited, its distance is final.",
  meta: {
    topic: "Advanced Graphs",
    subPattern: "Dijkstra shortest path with a min-heap",
    roles: {
      graph: "graph",
      dist: "hashMap",
      visited: "visitedSet",
      pq: "queue",
      d: "other",
      node: "pointer",
      neighbor: "other",
      weight: "other",
      newDist: "other",
      start: "other",
      result: "resultVar",
    },
    inputDescription: "A small weighted directed graph and a start node.",
    problemName: "Dijkstra's Shortest Path Algorithm",
    problemSummary:
      "Finds the shortest distance from a start node to every other node in a weighted graph by always expanding the currently-cheapest reachable node next.",
    constraints: ["edge weights are non-negative", "graph given as a weighted adjacency list", "unreachable nodes keep a distance of infinity"],
  },
};
