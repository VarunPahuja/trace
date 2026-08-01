import type { Example } from "@/lib/trace/meta";

export const kthLargestExample: Example = {
  id: "kth-largest",
  topic: "Heap/Priority Queue",
  name: "Kth Largest via Min-Heap",
  difficulty: "Medium",
  code: `import heapq

def findKthLargest(nums, k):
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]

nums = [3, 2, 1, 5, 6, 4]
k = 2
result = findKthLargest(nums, k)
`,
  input: "nums = [3, 2, 1, 5, 6, 4], k = 2",
  intuition:
    "Keep a min-heap of only the k largest numbers seen so far. Anything smaller than the heap's minimum can't possibly be the kth largest, so the moment the heap grows past size k, evict the smallest — whatever survives at the root when you're done is your answer.",
  meta: {
    topic: "Heap/Priority Queue",
    subPattern: "bounded min-heap for kth-largest",
    roles: {
      nums: "mainArray",
      heap: "heap",
      num: "other",
      k: "other",
      result: "resultVar",
    },
    inputDescription: "A small unsorted array and k.",
    problemName: "Kth Largest Element in an Array (LeetCode 215)",
    problemSummary:
      "Given an unsorted array and an integer k, find the kth largest element, using a bounded min-heap instead of sorting the whole array.",
    constraints: ["1 <= k <= nums.length <= 10^4", "k is always valid for the given array", "duplicates are counted by position, not deduplicated"],
  },
};
