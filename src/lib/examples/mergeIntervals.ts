import type { Example } from "@/lib/trace/meta";

export const mergeIntervalsExample: Example = {
  id: "merge-intervals",
  topic: "Intervals",
  name: "Merge Intervals",
  difficulty: "Medium",
  code: `def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)
        else:
            merged.append([start, end])
    return merged

intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]
result = merge(intervals)
`,
  input: "intervals = [[1,3], [2,6], [8,10], [15,18]]",
  intuition:
    "Sort by start time and the problem becomes a single sweep: if the next interval starts before your last merged one ends, they overlap — stretch the last one to cover both. If not, it's a genuinely new interval.",
  meta: {
    topic: "Intervals",
    subPattern: "sort then sweep-merge",
    roles: {
      intervals: "intervalList",
      merged: "intervalList",
      start: "other",
      end: "other",
      last: "other",
      result: "resultVar",
    },
    inputDescription: "A small list of [start, end] intervals.",
    problemName: "Merge Intervals (LeetCode 56)",
    problemSummary:
      "Given a list of intervals that may overlap, merge all overlapping intervals and return the resulting set of non-overlapping intervals.",
    constraints: ["1 <= intervals.length <= 10^4", "each interval is [start, end] with start <= end", "output must be sorted and non-overlapping"],
  },
};
