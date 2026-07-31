import type { Example } from "@/lib/trace/meta";
import { twoSumExample } from "./twoSum";
import { groupAnagramsExample } from "./groupAnagrams";
import { validPalindromeExample } from "./validPalindrome";
import { validParenthesesExample } from "./validParentheses";
import { binarySearchExample } from "./binarySearch";
import { bestTimeToBuySellStockExample } from "./bestTimeToBuySellStock";

// Phase 2 wires the array-family examples; the remaining 30 (of 36, per
// master.md §13) land in Phase 3 as their renderers are built.
export const EXAMPLES: Example[] = [
  twoSumExample,
  groupAnagramsExample,
  validPalindromeExample,
  validParenthesesExample,
  binarySearchExample,
  bestTimeToBuySellStockExample,
];

export function groupExamplesByTopic(examples: Example[]): Map<string, Example[]> {
  const groups = new Map<string, Example[]>();
  for (const example of examples) {
    const list = groups.get(example.topic) ?? [];
    list.push(example);
    groups.set(example.topic, list);
  }
  return groups;
}
