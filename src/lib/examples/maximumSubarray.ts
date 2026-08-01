import type { Example } from "@/lib/trace/meta";

export const maximumSubarrayExample: Example = {
  id: "maximum-subarray",
  topic: "Greedy",
  name: "Maximum Subarray",
  difficulty: "Medium",
  code: `def maxSubArray(nums):
    best = nums[0]
    current = nums[0]
    for i in range(1, len(nums)):
        current = max(nums[i], current + nums[i])
        best = max(best, current)
    return best

nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
result = maxSubArray(nums)
`,
  input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
  intuition:
    "A running sum that's gone negative can only drag down whatever comes next, so the moment it does, it's cheaper to abandon it and restart fresh at the current number. Kadane's algorithm is just tracking that running sum and remembering the best it ever got.",
  meta: {
    topic: "Greedy",
    subPattern: "Kadane's algorithm",
    roles: {
      nums: "mainArray",
      best: "resultVar",
      current: "other",
      i: "pointer",
      result: "resultVar",
    },
    inputDescription: "A small array of positive and negative integers.",
    problemName: "Maximum Subarray (LeetCode 53)",
    problemSummary:
      "Given an array of integers, find the contiguous subarray with the largest sum and return that sum.",
    constraints: ["1 <= nums.length <= 10^5", "array may contain negative numbers", "subarray must be contiguous and non-empty"],
  },
};
