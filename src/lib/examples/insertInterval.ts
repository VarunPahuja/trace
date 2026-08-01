import type { Example } from "@/lib/trace/meta";

export const insertIntervalExample: Example = {
  id: "insert-interval",
  topic: "Intervals",
  name: "Insert Interval",
  difficulty: "Medium",
  code: `def insert(intervals, newInterval):
    result = []
    i = 0
    n = len(intervals)
    while i < n and intervals[i][1] < newInterval[0]:
        result.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= newInterval[1]:
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i += 1
    result.append(newInterval)
    while i < n:
        result.append(intervals[i])
        i += 1
    return result

intervals = [[1, 3], [4, 5], [6, 7], [8, 10]]
newInterval = [4, 8]
result = insert(intervals, newInterval)
`,
  input: "intervals = [[1,3], [4,5], [6,7], [8,10]], newInterval = [4,8]",
  intuition:
    "The list is already sorted and non-overlapping, so there are only three kinds of intervals relative to the new one: entirely before it (copy as-is), entirely after it (copy as-is later), or overlapping it (absorb them all into one bigger interval before moving on).",
  meta: {
    topic: "Intervals",
    subPattern: "three-phase sweep insert",
    roles: {
      intervals: "intervalList",
      result: "intervalList",
      newInterval: "other",
      i: "other",
      n: "other",
    },
    inputDescription: "A sorted list of non-overlapping intervals and one new interval to insert.",
    problemName: "Insert Interval (LeetCode 57)",
    problemSummary:
      "Given a sorted, non-overlapping list of intervals and a new interval, insert it into the list, merging any overlaps along the way.",
    constraints: ["intervals are sorted and non-overlapping before insertion", "0 <= intervals.length <= 10^4", "new interval may overlap zero, one, or many existing intervals"],
  },
};
