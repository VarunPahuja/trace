import type { Example } from "@/lib/trace/meta";

export const jumpGameExample: Example = {
  id: "jump-game",
  topic: "Greedy",
  name: "Jump Game",
  difficulty: "Medium",
  code: `def canJumpGame(nums):
    goal = len(nums) - 1
    for i in range(len(nums) - 1, -1, -1):
        if i + nums[i] >= goal:
            goal = i
    return goal == 0

nums = [2, 3, 1, 1, 4]
result = canJumpGame(nums)
`,
  input: "nums = [2, 3, 1, 1, 4]",
  intuition:
    "Work backward from the finish line and keep a movable goalpost. If some position can reach the current goal, that position becomes the new goal — a strictly easier target to reach from earlier on. If the goal ever slides all the way back to the start, you know it's reachable.",
  meta: {
    topic: "Greedy",
    subPattern: "backward reachability sweep",
    roles: {
      nums: "mainArray",
      goal: "other",
      i: "pointer",
      result: "resultVar",
    },
    inputDescription: "A small array of max-jump-lengths per position.",
    problemName: "Jump Game (LeetCode 55)",
    problemSummary:
      "Given an array where each element is the maximum jump length from that position, determine whether it's possible to reach the last index starting from the first.",
    constraints: ["1 <= nums.length <= 10^4", "each value is the max jump distance from that index", "only forward jumps are allowed"],
  },
};
