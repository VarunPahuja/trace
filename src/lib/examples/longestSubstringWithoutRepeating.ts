import type { Example } from "@/lib/trace/meta";

export const longestSubstringWithoutRepeatingExample: Example = {
  id: "longest-substring-without-repeating",
  topic: "Sliding Window",
  name: "Longest Substring Without Repeating",
  difficulty: "Medium",
  code: `def lengthOfLongestSubstring(s):
    chars = list(s)
    window = set()
    left = 0
    best = 0
    for right in range(len(chars)):
        while chars[right] in window:
            window.remove(chars[left])
            left += 1
        window.add(chars[right])
        best = max(best, right - left + 1)
    return best

s = "abcabcbb"
result = lengthOfLongestSubstring(s)
`,
  input: 's = "abcabcbb"',
  intuition:
    "Grow the window by one character at a time, but the moment you'd add a repeat, shrink from the left until the duplicate is gone. The window's best-ever width is your answer.",
  meta: {
    topic: "Sliding Window",
    subPattern: "variable-size sliding window with a seen-set",
    roles: {
      chars: "mainArray",
      window: "other",
      left: "windowStart",
      right: "windowEnd",
      best: "resultVar",
      s: "other",
      result: "resultVar",
    },
    inputDescription: "A short string to scan for its longest repeat-free run.",
  },
};
