import type { Example } from "@/lib/trace/meta";

export const longestCommonSubsequenceExample: Example = {
  id: "longest-common-subsequence",
  topic: "2-D DP",
  name: "Longest Common Subsequence",
  difficulty: "Medium",
  code: `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

text1 = "abcde"
text2 = "ace"
result = longestCommonSubsequence(text1, text2)
`,
  input: 'text1 = "abcde", text2 = "ace"',
  intuition:
    "When the current letters match, you extend whatever subsequence you'd already built diagonally — a free +1. When they don't, you carry forward the best answer from dropping a letter off either string, whichever was better.",
  meta: {
    topic: "2-D DP",
    subPattern: "grid string alignment",
    roles: {
      dp: "dpTable2D",
      i: "pointer",
      j: "pointer",
      text1: "other",
      text2: "other",
      m: "other",
      n: "other",
      result: "resultVar",
    },
    inputDescription: "Two short strings to compare.",
  },
};
