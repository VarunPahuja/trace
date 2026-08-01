import type { Example } from "@/lib/trace/meta";

export const containerWithMostWaterExample: Example = {
  id: "container-with-most-water",
  topic: "Two Pointers",
  name: "Container With Most Water",
  difficulty: "Medium",
  code: `def maxArea(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        area = (r - l) * min(height[l], height[r])
        best = max(best, area)
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best

height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
result = maxArea(height)
`,
  input: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
  intuition:
    "The water level is capped by your shorter wall, so moving the taller pointer inward can only shrink the width for free — it never helps. Only moving the shorter wall has a chance of finding something better.",
  meta: {
    topic: "Two Pointers",
    subPattern: "opposite-direction two pointers, greedy shrink",
    roles: {
      height: "mainArray",
      l: "pointer",
      r: "pointer",
      area: "other",
      best: "resultVar",
      result: "resultVar",
    },
    inputDescription: "A small list of wall heights.",
    problemName: "Container With Most Water (LeetCode 11)",
    problemSummary:
      "Given a list of vertical line heights, pick two lines that, together with the x-axis, form a container holding the most water.",
    constraints: ["2 <= height.length <= 10^5", "each height is non-negative", "container is bounded by the shorter of the two chosen lines"],
  },
};
