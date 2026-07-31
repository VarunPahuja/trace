import type { Example } from "@/lib/trace/meta";

export const permutationsExample: Example = {
  id: "permutations",
  topic: "Backtracking",
  name: "Permutations",
  difficulty: "Medium",
  code: `def permute(nums):
    result = []

    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        for i in range(len(remaining)):
            path.append(remaining[i])
            backtrack(path, remaining[:i] + remaining[i+1:])
            path.pop()

    backtrack([], nums)
    return result

nums = [1, 2, 3]
result = permute(nums)
`,
  input: "nums = [1, 2, 3]",
  intuition:
    "At each step, try every remaining number as the next pick, recurse with everything else left over, then undo and try the next one. A full permutation is found exactly when nothing remains to place.",
  meta: {
    topic: "Backtracking",
    subPattern: "choose-one-of-remaining recursion tree",
    roles: {
      nums: "mainArray",
      result: "resultVar",
      path: "mainArray",
      remaining: "other",
      i: "pointer",
    },
    inputDescription: "A small array to generate all permutations of.",
  },
};
