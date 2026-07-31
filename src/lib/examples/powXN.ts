import type { Example } from "@/lib/trace/meta";

export const powXNExample: Example = {
  id: "pow-x-n",
  topic: "Math & Geometry",
  name: "Pow(x, n)",
  difficulty: "Medium",
  code: `def myPow(x, n):
    if n < 0:
        x = 1 / x
        n = -n
    result = 1
    base = x
    while n > 0:
        if n % 2 == 1:
            result *= base
        base *= base
        n //= 2
    return result

x = 2.0
n = 10
result = myPow(x, n)
`,
  input: "x = 2.0, n = 10",
  intuition:
    "Squaring the base and halving the exponent gets you to the answer in O(log n) instead of n multiplications. Only fold the current base into the result when the current bit of the exponent is 1 — exactly like binary representation.",
  meta: {
    topic: "Math & Geometry",
    subPattern: "fast exponentiation by squaring",
    roles: {
      x: "other",
      n: "other",
      base: "other",
      result: "resultVar",
    },
    inputDescription: "A base and an exponent.",
  },
};
