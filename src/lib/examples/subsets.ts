import type { Example } from "@/lib/trace/meta";

export const subsetsExample: Example = {
  id: "subsets",
  topic: "Backtracking",
  name: "Subsets",
  difficulty: "Medium",
  code: `def subsets(nums):
    result = []

    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return result

nums = [1, 2, 3]
result = subsets(nums)
`,
  input: "nums = [1, 2, 3]",
  intuition:
    "Every prefix you've built so far is already a valid subset — record it, then branch: try adding each remaining number one at a time. Popping after each recursive call undoes that choice so the next sibling branch starts clean.",
  meta: {
    topic: "Backtracking",
    subPattern: "include/exclude recursion tree",
    roles: {
      nums: "mainArray",
      result: "resultVar",
      path: "mainArray",
      start: "other",
      i: "pointer",
    },
    inputDescription: "A small array to generate all subsets of.",
    problemName: "Subsets (LeetCode 78)",
    problemSummary:
      "Given an array of distinct integers, return every possible subset (the power set), including the empty set and the full array.",
    constraints: ["1 <= nums.length <= 10", "all elements are distinct", "output may be in any order"],
  },
};
