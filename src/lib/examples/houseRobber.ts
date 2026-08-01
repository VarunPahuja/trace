import type { Example } from "@/lib/trace/meta";

export const houseRobberExample: Example = {
  id: "house-robber",
  topic: "1-D DP",
  name: "House Robber",
  difficulty: "Medium",
  code: `def rob(nums):
    if len(nums) == 1:
        return nums[0]
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, len(nums)):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[-1]

nums = [2, 7, 9, 3, 1]
result = rob(nums)
`,
  input: "nums = [2, 7, 9, 3, 1]",
  intuition:
    "At every house you make one choice: skip it and keep whatever you'd already banked, or rob it and add it to whatever you had two houses back (since you can't hit neighbors). dp[i] just remembers the best of those two options so far.",
  meta: {
    topic: "1-D DP",
    subPattern: "bottom-up tabulation with a skip constraint",
    roles: {
      nums: "mainArray",
      dp: "dpTable1D",
      i: "pointer",
      result: "resultVar",
    },
    inputDescription: "A small list of house values to rob.",
    problemName: "House Robber (LeetCode 198)",
    problemSummary:
      "Given the amount of money stashed in a row of houses, find the maximum you can rob without ever robbing two adjacent houses.",
    constraints: ["1 <= nums.length <= 100", "house values are non-negative", "can't rob two directly adjacent houses"],
  },
};
