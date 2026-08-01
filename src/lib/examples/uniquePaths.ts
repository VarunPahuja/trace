import type { Example } from "@/lib/trace/meta";

export const uniquePathsExample: Example = {
  id: "unique-paths",
  topic: "2-D DP",
  name: "Unique Paths",
  difficulty: "Medium",
  code: `def uniquePaths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]

m, n = 3, 3
result = uniquePaths(m, n)
`,
  input: "m = 3, n = 3",
  intuition:
    "You can only move right or down, so the only way to reach a cell is from directly above it or directly to its left. The number of paths to a cell is just the sum of the paths to those two neighbors — the whole top row and left column start at 1 for free.",
  meta: {
    topic: "2-D DP",
    subPattern: "grid path counting",
    roles: {
      dp: "dpTable2D",
      i: "pointer",
      j: "pointer",
      m: "other",
      n: "other",
      result: "resultVar",
    },
    inputDescription: "A small grid's width and height.",
    problemName: "Unique Paths (LeetCode 62)",
    problemSummary:
      "Given the dimensions of a grid, count how many distinct paths there are from the top-left corner to the bottom-right corner, moving only right or down.",
    constraints: ["1 <= m, n <= 100", "movement is restricted to right or down", "answer fits in a 32-bit integer"],
  },
};
