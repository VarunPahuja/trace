import type { Topic } from "@/lib/trace/meta";

// Best-effort mapping from LeetCode's topic tag names to TRACE's 18 topics.
// Ambiguous or uncovered tags (Sorting, Design, Simulation, Recursion, ...)
// are left unmapped rather than guessed — the Add Problem modal keeps the
// topic field manually editable, so an unmapped tag just means the user
// picks it themselves instead of getting a wrong autofill.
export const LEETCODE_TAG_TO_TOPIC: Record<string, Topic> = {
  Array: "Arrays & Hashing",
  "Hash Table": "Arrays & Hashing",
  "Two Pointers": "Two Pointers",
  Stack: "Stack",
  "Monotonic Stack": "Stack",
  "Binary Search": "Binary Search",
  "Sliding Window": "Sliding Window",
  "Linked List": "Linked List",
  Tree: "Trees",
  "Binary Tree": "Trees",
  "Binary Search Tree": "Trees",
  Trie: "Tries",
  "Heap (Priority Queue)": "Heap/Priority Queue",
  Backtracking: "Backtracking",
  Graph: "Graphs",
  "Depth-First Search": "Graphs",
  "Breadth-First Search": "Graphs",
  "Union Find": "Advanced Graphs",
  "Topological Sort": "Advanced Graphs",
  "Shortest Path": "Advanced Graphs",
  "Dynamic Programming": "1-D DP",
  Interval: "Intervals",
  Greedy: "Greedy",
  "Bit Manipulation": "Bit Manipulation",
  Math: "Math & Geometry",
  Geometry: "Math & Geometry",
};

export function mapLeetCodeTopic(tags: { name: string }[]): Topic | null {
  for (const tag of tags) {
    const mapped = LEETCODE_TAG_TO_TOPIC[tag.name];
    if (mapped) return mapped;
  }
  return null;
}
