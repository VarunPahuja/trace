// Trace data contract — master.md §8.
// These are the JSON-safe shapes the Pyodide worker emits and the
// playback engine / renderers consume. Never import Pyodide types here;
// this file has zero runtime dependencies so it can be shared by the
// worker, the store, and every renderer.

export type SerializedPrimitive = number | string | boolean | null;

/** Lists/tuples serialize as plain JS arrays, recursively (depth-capped at 4 in the tracer). */
export type SerializedArray = SerializedValue[];

export interface SerializedDict {
  type: "dict";
  entries: [SerializedValue, SerializedValue][];
}

export interface SerializedSet {
  type: "set";
  values: SerializedValue[];
}

export interface SerializedLinkedListNode {
  id: number;
  val: SerializedValue;
}

export interface SerializedLinkedList {
  type: "linkedlist";
  nodes: SerializedLinkedListNode[];
  cycleTo?: number;
}

export interface SerializedTreeNode {
  id: number;
  val: SerializedValue;
  left: number | null;
  right: number | null;
}

export interface SerializedTree {
  type: "tree";
  nodes: SerializedTreeNode[];
  rootId: number | null;
}

/** n-ary tree node (Tries) — master.md §9.6 "n-ary variant: children array". */
export interface SerializedTrieNode {
  id: number;
  val: SerializedValue;
  /** [edgeLabel, childId] pairs — e.g. [char, nodeId] for a Trie. */
  children: [SerializedValue, number][];
  isWord?: boolean;
}

export interface SerializedTrie {
  type: "trie";
  nodes: SerializedTrieNode[];
  rootId: number | null;
}

export interface SerializedOpaque {
  type: "opaque";
  repr: string;
}

export type SerializedValue =
  | SerializedPrimitive
  | SerializedArray
  | SerializedDict
  | SerializedSet
  | SerializedLinkedList
  | SerializedTree
  | SerializedTrie
  | SerializedOpaque;

export type TraceEventKind = "line" | "call" | "return";

export interface CallStackFrame {
  fn: string;
  line: number;
}

export interface TraceStep {
  i: number;
  line: number;
  event: TraceEventKind;
  depth: number;
  callStack: CallStackFrame[];
  locals: Record<string, SerializedValue>;
  returned?: SerializedValue;
}

/** Python exception surfaced from the tracer harness, pointing at the offending line. */
export interface PythonExecutionError {
  message: string;
  line: number | null;
}

export interface TraceResult {
  steps: TraceStep[];
  truncated: boolean;
  error?: PythonExecutionError;
}

export const TRACE_STEP_CAP = 3000;
export const TRACE_WALLCLOCK_CAP_MS = 8000;
