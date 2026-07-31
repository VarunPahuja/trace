import type { Example } from "@/lib/trace/meta";

export const singleNumberExample: Example = {
  id: "single-number",
  topic: "Bit Manipulation",
  name: "Single Number",
  difficulty: "Easy",
  code: `def singleNumber(nums):
    result = 0
    for num in nums:
        result = result ^ num
    return result

nums = [4, 1, 2, 1, 2]
result = singleNumber(nums)
`,
  input: "nums = [4, 1, 2, 1, 2]",
  intuition:
    "XOR cancels a number with itself — x ^ x is always 0, and x ^ 0 is always x. So XOR every number together and every pair wipes itself out, leaving only the one number with no partner.",
  meta: {
    topic: "Bit Manipulation",
    subPattern: "XOR cancellation",
    roles: {
      nums: "mainArray",
      result: "bitValue",
      num: "bitValue",
    },
    inputDescription: "A small array where every number appears twice except one.",
  },
};
