import type { Example } from "@/lib/trace/meta";

export const countingBitsExample: Example = {
  id: "counting-bits",
  topic: "Bit Manipulation",
  name: "Counting Bits",
  difficulty: "Easy",
  code: `def countBits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp

n = 5
result = countBits(n)
`,
  input: "n = 5",
  intuition:
    "Shifting i right by one bit just drops the last bit — so i's popcount is exactly i>>1's popcount, plus 1 more if that dropped bit was a 1. You've already computed the answer for every smaller number, so this is free.",
  meta: {
    topic: "Bit Manipulation",
    subPattern: "bottom-up popcount via right shift",
    roles: {
      dp: "dpTable1D",
      i: "bitValue",
      n: "other",
      result: "resultVar",
    },
    inputDescription: "An upper bound n; counts set bits for every number from 0 to n.",
    problemName: "Counting Bits (LeetCode 338)",
    problemSummary:
      "Given a non-negative integer n, return an array where each index i holds the number of 1 bits in the binary representation of i, for every i from 0 to n.",
    constraints: ["0 <= n <= 10^5", "output length is n+1", "should run in linear time"],
  },
};
