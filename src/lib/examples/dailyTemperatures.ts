import type { Example } from "@/lib/trace/meta";

export const dailyTemperaturesExample: Example = {
  id: "daily-temperatures",
  topic: "Stack",
  name: "Daily Temperatures",
  difficulty: "Medium",
  code: `def dailyTemperatures(temperatures):
    result = [0] * len(temperatures)
    stack = []
    for i, t in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < t:
            prevIndex = stack.pop()
            result[prevIndex] = i - prevIndex
        stack.append(i)
    return result

temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
result = dailyTemperatures(temperatures)
`,
  input: "temperatures = [73, 74, 75, 71, 69, 72, 76, 73]",
  intuition:
    "Keep a stack of days still waiting for a warmer day. The moment today is warmer than the day on top of the stack, that day finally gets its answer — pop it off and record how many days it waited.",
  meta: {
    topic: "Stack",
    subPattern: "monotonic stack",
    roles: {
      temperatures: "mainArray",
      result: "resultVar",
      stack: "stack",
      i: "pointer",
      t: "other",
      prevIndex: "other",
    },
    inputDescription: "A small list of daily temperatures.",
  },
};
