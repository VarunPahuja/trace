import type { Example } from "@/lib/trace/meta";

export const climbingStairsExample: Example = {
  id: "climbing-stairs",
  topic: "1-D DP",
  name: "Climbing Stairs",
  difficulty: "Easy",
  code: `def climbStairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

n = 6
result = climbStairs(n)
`,
  input: "n = 6",
  intuition:
    "To reach step i you arrived either from step i-1 (one hop) or step i-2 (a skip) — no other way in. So the number of ways to reach i is just the sum of the ways to reach those two steps before it. That's Fibonacci wearing a staircase costume.",
  meta: {
    topic: "1-D DP",
    subPattern: "bottom-up tabulation",
    roles: {
      dp: "dpTable1D",
      i: "pointer",
      n: "other",
      result: "resultVar",
    },
    inputDescription: "A small number of stairs.",
  },
};
