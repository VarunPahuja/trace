import type { Example } from "@/lib/trace/meta";

export const groupAnagramsExample: Example = {
  id: "group-anagrams",
  topic: "Arrays & Hashing",
  name: "Group Anagrams",
  difficulty: "Medium",
  code: `def groupAnagrams(strs):
    groups = {}
    for s in strs:
        key = "".join(sorted(s))
        if key in groups:
            groups[key].append(s)
        else:
            groups[key] = [s]
    return list(groups.values())

strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
result = groupAnagrams(strs)
`,
  input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]',
  intuition:
    "Anagrams are the same letters wearing different outfits. Sort each word's letters and they all end up in the same disguise — that sorted string becomes the hash map key everyone with the same letters shares.",
  meta: {
    topic: "Arrays & Hashing",
    subPattern: "frequency/sorted-key grouping",
    roles: {
      strs: "mainArray",
      groups: "hashMap",
      s: "other",
      key: "other",
      result: "resultVar",
    },
    inputDescription: "A small list of lowercase words.",
  },
};
