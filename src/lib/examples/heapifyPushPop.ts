import type { Example } from "@/lib/trace/meta";

export const heapifyPushPopExample: Example = {
  id: "heapify-push-pop",
  topic: "Heap/Priority Queue",
  name: "Heapify + Push/Pop Demo",
  difficulty: "Easy",
  code: `import heapq

heap = [5, 3, 8, 1, 9, 2]
heapq.heapify(heap)
heapq.heappush(heap, 0)
popped = heapq.heappop(heap)
result = heap
`,
  input: "heap = [5, 3, 8, 1, 9, 2]",
  intuition:
    "A min-heap is just an array that promises: every parent is smaller than its children. heapify hammers an unordered array into that shape; push adds at the end and bubbles up; pop removes the smallest (the root) and bubbles the replacement down. Python's heapq does all of it in place on a plain list.",
  meta: {
    topic: "Heap/Priority Queue",
    subPattern: "heapify, push, pop on an array-backed min-heap",
    roles: {
      heap: "heap",
      popped: "resultVar",
      result: "resultVar",
    },
    inputDescription: "A small unordered array turned into a heap.",
  },
};
