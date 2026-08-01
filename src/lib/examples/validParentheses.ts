import type { Example } from "@/lib/trace/meta";

export const validParenthesesExample: Example = {
  id: "valid-parentheses",
  topic: "Stack",
  name: "Valid Parentheses",
  difficulty: "Easy",
  code: `def isValid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return len(stack) == 0

s = "{[()]}"
result = isValid(s)
`,
  input: 's = "{[()]}"',
  intuition:
    "Every opening bracket owes a debt that only its exact matching closer can settle, and debts get paid off in reverse order — last opened, first closed. A stack is just a pile of open IOUs; if a closer shows up that doesn't match the top of the pile, something's broken.",
  meta: {
    topic: "Stack",
    subPattern: "stack matching",
    roles: {
      s: "other",
      stack: "stack",
      pairs: "other",
      c: "other",
      result: "resultVar",
    },
    inputDescription: "A short string of brackets to validate.",
    problemName: "Valid Parentheses (LeetCode 20)",
    problemSummary:
      "Given a string of just the characters (){}[], determine whether every bracket is closed in the correct order by the matching bracket type.",
    constraints: ["1 <= s.length <= 10^4", "string contains only bracket characters", "open brackets must close in the right order"],
  },
};
