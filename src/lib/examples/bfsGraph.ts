import type { Example } from "@/lib/trace/meta";

export const bfsGraphExample: Example = {
  id: "bfs-graph",
  topic: "Graphs",
  name: "BFS on Small Graph",
  difficulty: "Easy",
  code: `def bfs(graph, start):
    visited = {start}
    queue = [start]
    order = []
    while queue:
        node = queue.pop(0)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

graph = {
    0: [1, 2],
    1: [0, 3],
    2: [0, 3],
    3: [1, 2, 4],
    4: [3],
}
result = bfs(graph, 0)
`,
  input: "graph = {0:[1,2], 1:[0,3], 2:[0,3], 3:[1,2,4], 4:[3]}, start = 0",
  intuition:
    "BFS explores in rings: everyone one step away, then everyone two steps away, and so on. A queue enforces that ordering for free — you always process the oldest-discovered node next, and a visited set keeps you from ever re-adding the same node twice.",
  meta: {
    topic: "Graphs",
    subPattern: "breadth-first search with a queue",
    roles: {
      graph: "graph",
      visited: "visitedSet",
      queue: "queue",
      order: "resultVar",
      node: "pointer",
      neighbor: "other",
      start: "other",
      result: "resultVar",
    },
    inputDescription: "A small undirected graph given as an adjacency list, and a start node.",
    problemName: "Breadth-First Search Traversal",
    problemSummary:
      "Traverses a graph outward from a start node one ring of distance at a time, using a queue to guarantee nodes are visited in order of increasing distance from the start.",
    constraints: ["graph given as an adjacency list", "works on connected or disconnected graphs", "each node is visited exactly once"],
  },
};
