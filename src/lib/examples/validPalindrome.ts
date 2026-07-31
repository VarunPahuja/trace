import type { Example } from "@/lib/trace/meta";

export const validPalindromeExample: Example = {
  id: "valid-palindrome",
  topic: "Two Pointers",
  name: "Valid Palindrome",
  difficulty: "Easy",
  code: `def isPalindrome(s):
    filtered = [c.lower() for c in s if c.isalnum()]
    l, r = 0, len(filtered) - 1
    while l < r:
        if filtered[l] != filtered[r]:
            return False
        l += 1
        r -= 1
    return True

s = "A man a plan a canal Panama"
result = isPalindrome(s)
`,
  input: 's = "A man a plan a canal Panama"',
  intuition:
    "Strip away the punctuation and casing until only letters remain, then send two pointers marching toward each other from both ends. If they ever disagree, it's not a palindrome — if they meet in the middle without a fight, it is.",
  meta: {
    topic: "Two Pointers",
    subPattern: "opposite-direction two pointers",
    roles: {
      filtered: "mainArray",
      l: "pointer",
      r: "pointer",
      s: "other",
      c: "other",
      result: "resultVar",
    },
    inputDescription: "A short sentence to check as a palindrome, ignoring case and punctuation.",
  },
};
