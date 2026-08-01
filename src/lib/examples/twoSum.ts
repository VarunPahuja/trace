import type { Example } from "@/lib/trace/meta";

export const twoSumExample: Example = {
  id: "two-sum",
  topic: "Arrays & Hashing",
  name: "Two Sum",
  difficulty: "Easy",
  code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

nums = [2, 7, 11, 15]
target = 9
result = twoSum(nums, target)
`,
  input: "nums = [2, 7, 11, 15], target = 9",
  intuition:
    "You could check every pair, but your hash map has a better memory than you do. Walk the array once, and for each number ask the map \"have I already seen your missing half?\" The moment it says yes, you're done.",
  meta: {
    topic: "Arrays & Hashing",
    subPattern: "hash map complement lookup",
    roles: {
      nums: "mainArray",
      target: "target",
      seen: "hashMap",
      i: "pointer",
      num: "other",
      complement: "other",
      result: "resultVar",
    },
    inputDescription: "A small integer array and a target sum.",
    problemName: "Two Sum (LeetCode 1)",
    problemSummary:
      "Given an array of integers and a target sum, find the indices of the two numbers that add up to the target. Each input has exactly one valid pair.",
    constraints: ["2 <= nums.length <= 10^4", "exactly one valid answer exists", "can't reuse the same element twice"],
  },
};
