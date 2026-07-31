import { formatValue } from "@/lib/trace/format";
import type { SerializedValue, TraceStep } from "@/lib/trace/types";

function isOpaque(v: SerializedValue): boolean {
  return typeof v === "object" && v !== null && !Array.isArray(v) && v.type === "opaque";
}

export interface CallTreeNode {
  /** Step index of the 'call' event that created this node — stable id. */
  id: number;
  fn: string;
  label: string;
  depth: number;
  returnedAtStep: number | null;
  children: CallTreeNode[];
}

function truncateLabel(s: string, max = 12): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/** At a 'call' event, frame.f_locals already holds the bound parameters
 * (no line has executed yet) — so the raw locals *are* the call's key
 * argument values, no separate parameter-name bookkeeping needed. Skips
 * opaque values: a nested function's f_locals includes every free
 * variable it closes over (e.g. a recursive backtrack() call's locals
 * include the enclosing function object itself, and often the running
 * result accumulator too), which are never useful as a call label and
 * would otherwise eat the whole truncation budget. */
function labelForCallStep(step: TraceStep): string {
  const parts = Object.values(step.locals)
    .filter((v) => !isOpaque(v))
    .map((v) => formatValue(v));
  return truncateLabel(parts.join(","));
}

/** Builds the call tree purely from call/return events up to uptoStep —
 * this is master.md §9.6's Backtracking variant: "decision tree grows as
 * recursion proceeds, built from call events." No force simulation; tidy
 * layout (computeCallTreeLayout below) handles positioning. */
export function computeCallTree(steps: TraceStep[], uptoStep: number): CallTreeNode[] {
  const roots: CallTreeNode[] = [];
  const stack: CallTreeNode[] = [];
  const last = Math.min(uptoStep, steps.length - 1);

  for (let i = 0; i <= last; i++) {
    const step = steps[i];
    if (step.event === "call") {
      const node: CallTreeNode = {
        id: i,
        fn: step.callStack[step.callStack.length - 1]?.fn ?? "?",
        label: labelForCallStep(step),
        depth: step.depth,
        returnedAtStep: null,
        children: [],
      };
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node);
      } else {
        roots.push(node);
      }
      stack.push(node);
    } else if (step.event === "return") {
      const node = stack.pop();
      if (node) node.returnedAtStep = i;
    }
  }

  return roots;
}

export interface CallTreePosition {
  x: number;
  y: number;
}

/** Tidy n-ary layout: leaves get sequential x left-to-right in traversal
 * order, each parent's x is the mean of its children's — no force sim. */
export function computeCallTreeLayout(roots: CallTreeNode[]): Map<number, CallTreePosition> {
  const positions = new Map<number, CallTreePosition>();
  let leafCounter = 0;

  function visit(node: CallTreeNode): number {
    let x: number;
    if (node.children.length === 0) {
      x = leafCounter++;
    } else {
      const childXs = node.children.map(visit);
      x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
    }
    positions.set(node.id, { x, y: node.depth });
    return x;
  }

  for (const root of roots) visit(root);
  return positions;
}

export function flattenCallTree(roots: CallTreeNode[]): CallTreeNode[] {
  const out: CallTreeNode[] = [];
  function visit(node: CallTreeNode) {
    out.push(node);
    node.children.forEach(visit);
  }
  roots.forEach(visit);
  return out;
}
