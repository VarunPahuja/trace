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
import { bstInsertInorderExample } from "./bstInsertInorder";
import { maxDepthExample } from "./maxDepth";
import { climbingStairsExample } from "./climbingStairs";
import { houseRobberExample } from "./houseRobber";
import { uniquePathsExample } from "./uniquePaths";
import { longestCommonSubsequenceExample } from "./longestCommonSubsequence";
import { bfsGraphExample } from "./bfsGraph";
import { numberOfIslandsExample } from "./numberOfIslands";
import { dijkstraExample } from "./dijkstra";
import { topologicalSortExample } from "./topologicalSort";
import { mergeIntervalsExample } from "./mergeIntervals";
import { insertIntervalExample } from "./insertInterval";
import { jumpGameExample } from "./jumpGame";
import { maximumSubarrayExample } from "./maximumSubarray";
import { singleNumberExample } from "./singleNumber";
import { countingBitsExample } from "./countingBits";
import { rotateImageExample } from "./rotateImage";
import { powXNExample } from "./powXN";

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
  bstInsertInorderExample,
  maxDepthExample,
  climbingStairsExample,
  houseRobberExample,
  uniquePathsExample,
  longestCommonSubsequenceExample,
  bfsGraphExample,
  numberOfIslandsExample,
  dijkstraExample,
  topologicalSortExample,
  mergeIntervalsExample,
  insertIntervalExample,
  jumpGameExample,
  maximumSubarrayExample,
  singleNumberExample,
  countingBitsExample,
  rotateImageExample,
  powXNExample,
];

export function groupExamplesByTopic(examples: Example[]): Map<string, Example[]> {
  const groups = new Map<string, Example[]>();
  for (const topic of TOPICS) {
    const list = examples.filter((e) => e.topic === topic);
    if (list.length > 0) groups.set(topic, list);
  }
  return groups;
}
