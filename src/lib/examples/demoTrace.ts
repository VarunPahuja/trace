import type { TraceStep } from "@/lib/trace/types";

// Real Two Sum trace captured once via the actual Pyodide pipeline (Phase
// 7 landing-page demo — master.md doesn't cover this route, see the
// project brief). Baked in statically so the landing page's auto-playing
// demo shows genuine execution data with zero Pyodide/worker load. If the
// Two Sum example's code ever changes, recapture: load it in /app, press
// Visualize, and dump `useTraceStore.getState().steps` to JSON.
export const DEMO_TRACE_STEPS: TraceStep[] = [
  { i: 0, line: 0, event: "call", depth: 1, callStack: [{ fn: "<module>", line: 0 }], locals: {} },
  { i: 1, line: 1, event: "line", depth: 1, callStack: [{ fn: "<module>", line: 1 }], locals: {} },
  {
    i: 2,
    line: 10,
    event: "line",
    depth: 1,
    callStack: [{ fn: "<module>", line: 10 }],
    locals: { twoSum: { type: "opaque", repr: "<function twoSum at 0x120f560>" } },
  },
  {
    i: 3,
    line: 11,
    event: "line",
    depth: 1,
    callStack: [{ fn: "<module>", line: 11 }],
    locals: { twoSum: { type: "opaque", repr: "<function twoSum at 0x120f560>" }, nums: [2, 7, 11, 15] },
  },
  {
    i: 4,
    line: 12,
    event: "line",
    depth: 1,
    callStack: [{ fn: "<module>", line: 12 }],
    locals: {
      twoSum: { type: "opaque", repr: "<function twoSum at 0x120f560>" },
      nums: [2, 7, 11, 15],
      target: 9,
    },
  },
  {
    i: 5,
    line: 1,
    event: "call",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 1 },
    ],
    locals: { nums: [2, 7, 11, 15], target: 9 },
  },
  {
    i: 6,
    line: 2,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 2 },
    ],
    locals: { nums: [2, 7, 11, 15], target: 9 },
  },
  {
    i: 7,
    line: 3,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 3 },
    ],
    locals: { nums: [2, 7, 11, 15], target: 9, seen: { type: "dict", entries: [] } },
  },
  {
    i: 8,
    line: 4,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 4 },
    ],
    locals: { nums: [2, 7, 11, 15], target: 9, seen: { type: "dict", entries: [] }, i: 0, num: 2 },
  },
  {
    i: 9,
    line: 5,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 5 },
    ],
    locals: {
      nums: [2, 7, 11, 15],
      target: 9,
      seen: { type: "dict", entries: [] },
      i: 0,
      num: 2,
      complement: 7,
    },
  },
  {
    i: 10,
    line: 7,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 7 },
    ],
    locals: {
      nums: [2, 7, 11, 15],
      target: 9,
      seen: { type: "dict", entries: [] },
      i: 0,
      num: 2,
      complement: 7,
    },
  },
  {
    i: 11,
    line: 3,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 3 },
    ],
    locals: {
      nums: [2, 7, 11, 15],
      target: 9,
      seen: { type: "dict", entries: [[2, 0]] },
      i: 0,
      num: 2,
      complement: 7,
    },
  },
  {
    i: 12,
    line: 4,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 4 },
    ],
    locals: {
      nums: [2, 7, 11, 15],
      target: 9,
      seen: { type: "dict", entries: [[2, 0]] },
      i: 1,
      num: 7,
      complement: 7,
    },
  },
  {
    i: 13,
    line: 5,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 5 },
    ],
    locals: {
      nums: [2, 7, 11, 15],
      target: 9,
      seen: { type: "dict", entries: [[2, 0]] },
      i: 1,
      num: 7,
      complement: 2,
    },
  },
  {
    i: 14,
    line: 6,
    event: "line",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 6 },
    ],
    locals: {
      nums: [2, 7, 11, 15],
      target: 9,
      seen: { type: "dict", entries: [[2, 0]] },
      i: 1,
      num: 7,
      complement: 2,
    },
  },
  {
    i: 15,
    line: 6,
    event: "return",
    depth: 2,
    callStack: [
      { fn: "<module>", line: 12 },
      { fn: "twoSum", line: 6 },
    ],
    locals: {
      nums: [2, 7, 11, 15],
      target: 9,
      seen: { type: "dict", entries: [[2, 0]] },
      i: 1,
      num: 7,
      complement: 2,
    },
    returned: [0, 1],
  },
  {
    i: 16,
    line: 12,
    event: "return",
    depth: 1,
    callStack: [{ fn: "<module>", line: 12 }],
    locals: {
      twoSum: { type: "opaque", repr: "<function twoSum at 0x120f560>" },
      nums: [2, 7, 11, 15],
      target: 9,
      result: [0, 1],
    },
    returned: null,
  },
];
