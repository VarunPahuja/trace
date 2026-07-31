import { TOPICS, type Example } from "@/lib/trace/meta";
import { twoSumExample } from "./twoSum";
import { groupAnagramsExample } from "./groupAnagrams";
import { validPalindromeExample } from "./validPalindrome";
import { containerWithMostWaterExample } from "./containerWithMostWater";
import { validParenthesesExample } from "./validParentheses";
import { dailyTemperaturesExample } from "./dailyTemperatures";
import { binarySearchExample } from "./binarySearch";
import { searchRotatedSortedArrayExample } from "./searchRotatedSortedArray";
import { bestTimeToBuySellStockExample } from "./bestTimeToBuySellStock";
import { longestSubstringWithoutRepeatingExample } from "./longestSubstringWithoutRepeating";
import { reverseLinkedListExample } from "./reverseLinkedList";
import { mergeTwoSortedListsExample } from "./mergeTwoSortedLists";

// Grows toward all 36 (per master.md §13) as each renderer lands in Phase 3.
export const EXAMPLES: Example[] = [
  twoSumExample,
  groupAnagramsExample,
  validPalindromeExample,
  containerWithMostWaterExample,
  validParenthesesExample,
  dailyTemperaturesExample,
  binarySearchExample,
  searchRotatedSortedArrayExample,
  bestTimeToBuySellStockExample,
  longestSubstringWithoutRepeatingExample,
  reverseLinkedListExample,
  mergeTwoSortedListsExample,
];

export function groupExamplesByTopic(examples: Example[]): Map<string, Example[]> {
  const groups = new Map<string, Example[]>();
  for (const topic of TOPICS) {
    const list = examples.filter((e) => e.topic === topic);
    if (list.length > 0) groups.set(topic, list);
  }
  return groups;
}
