// Hardcoded Two Sum source for Phase 1 execution-core validation.
// Full example objects (with meta/intuition/etc, per master.md §13) land in Phase 3.
export const TWO_SUM_SOURCE = `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

nums = [2, 7, 11, 15]
target = 9
result = twoSum(nums, target)
`;
