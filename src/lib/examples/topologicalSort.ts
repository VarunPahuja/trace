import type { Example } from "@/lib/trace/meta";

export const topologicalSortExample: Example = {
  id: "topological-sort",
  topic: "Advanced Graphs",
  name: "Topological Sort (Kahn's)",
  difficulty: "Medium",
  code: `def topologicalSort(graph, numNodes):
    inDegree = [0] * numNodes
    for node in graph:
        for neighbor in graph[node]:
            inDegree[neighbor] += 1

    queue = [n for n in range(numNodes) if inDegree[n] == 0]
    order = []
    while queue:
        node = queue.pop(0)
        order.append(node)
        for neighbor in graph[node]:
            inDegree[neighbor] -= 1
            if inDegree[neighbor] == 0:
                queue.append(neighbor)
    return order

graph = {
    0: [1, 2],
    1: [3],
    2: [3],
    3: [4],
    4: [],
}
result = topologicalSort(graph, 5)
`,
  input: "graph = 5-node DAG adjacency list",
  intuition:
    "A node with zero prerequisites left is safe to schedule right now. Kahn's algorithm just keeps peeling those off: process a ready node, tell its neighbors they have one fewer prerequisite, and any neighbor that hits zero joins the ready queue.",
  meta: {
    topic: "Advanced Graphs",
    subPattern: "Kahn's algorithm (in-degree queue)",
    roles: {
      graph: "graph",
      inDegree: "mainArray",
      queue: "queue",
      order: "resultVar",
      node: "pointer",
      neighbor: "other",
      numNodes: "other",
      n: "other",
      result: "resultVar",
    },
    inputDescription: "A small directed acyclic graph.",
    problemName: "Topological Sort (Kahn's Algorithm)",
    problemSummary:
      "Given a directed acyclic graph, produces a linear ordering of its nodes such that every directed edge points from an earlier node to a later one — commonly used to schedule tasks with prerequisites.",
    constraints: ["graph must be acyclic for a valid ordering to exist", "graph given as an adjacency list", "multiple valid orderings may exist"],
  },
};
