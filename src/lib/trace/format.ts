import type { SerializedValue } from "./types";

/** Compact single-line display string for any serialized value — used by
 * the variables strip and any renderer that needs a quick label. */
export function formatValue(value: SerializedValue | undefined): string {
  if (value === undefined) return "?";
  if (value === null) return "None";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (Array.isArray(value)) return `[${value.map(formatValue).join(", ")}]`;
  if (value.type === "dict") {
    return `{${value.entries.map(([k, v]) => `${formatValue(k)}: ${formatValue(v)}`).join(", ")}}`;
  }
  if (value.type === "set") {
    return `{${value.values.map(formatValue).join(", ")}}`;
  }
  if (value.type === "linkedlist") {
    return value.nodes.map((n) => formatValue(n.val)).join(" → ") + (value.cycleTo !== undefined ? " ↺" : "");
  }
  if (value.type === "tree") {
    return `tree(${value.nodes.length} nodes)`;
  }
  if (value.type === "opaque") {
    return value.repr;
  }
  return String(value);
}
