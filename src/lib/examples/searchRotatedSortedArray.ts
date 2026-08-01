import type { Example } from "@/lib/trace/meta";

export const searchRotatedSortedArrayExample: Example = {
  id: "search-rotated-sorted-array",
  topic: "Binary Search",
  name: "Search Rotated Sorted Array",
  difficulty: "Medium",
  code: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        if nums[l] <= nums[mid]:
            if nums[l] <= target < nums[mid]:
                r = mid - 1
            else:
                l = mid + 1
        else:
            if nums[mid] < target <= nums[r]:
                l = mid + 1
            else:
                r = mid - 1
    return -1

nums = [4, 5, 6, 7, 0, 1, 2]
target = 0
result = search(nums, target)
`,
  input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 0",
  intuition:
    "The array got snapped in half and swapped, but one half around the midpoint is still guaranteed sorted. Figure out which half that is, check if your target could be hiding in it, and throw away the other half exactly like classic binary search.",
  meta: {
    topic: "Binary Search",
    subPattern: "rotated array binary search",
    roles: {
      nums: "mainArray",
      target: "target",
      l: "pointer",
      r: "pointer",
      mid: "pointer",
      result: "resultVar",
    },
    inputDescription: "A small rotated sorted array and a target value.",
    problemName: "Search in Rotated Sorted Array (LeetCode 33)",
    problemSummary:
      "Given an array that was sorted and then rotated at some unknown pivot, find the index of a target value in better than linear time.",
    constraints: ["1 <= nums.length <= 5000", "all values are distinct", "array was originally sorted before the rotation"],
  },
};
