import type { Example } from "@/lib/trace/meta";

export const binarySearchExample: Example = {
  id: "binary-search",
  topic: "Binary Search",
  name: "Binary Search",
  difficulty: "Easy",
  code: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1

nums = [-1, 0, 3, 5, 9, 12]
target = 9
result = search(nums, target)
`,
  input: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
  intuition:
    "The array is sorted, so it's already telling you which half to throw away. Check the middle, and if it's not your target, you just eliminated half the haystack for free. Keep halving until there's nowhere left to hide.",
  meta: {
    topic: "Binary Search",
    subPattern: "classic binary search",
    roles: {
      nums: "mainArray",
      target: "target",
      l: "pointer",
      r: "pointer",
      mid: "pointer",
      result: "resultVar",
    },
    inputDescription: "A small sorted integer array and a target value.",
  },
};
