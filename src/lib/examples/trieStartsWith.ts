import type { Example } from "@/lib/trace/meta";

export const trieStartsWithExample: Example = {
  id: "trie-starts-with",
  topic: "Tries",
  name: "StartsWith Prefix Demo",
  difficulty: "Medium",
  code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

def insert(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_word = True

def startsWith(root, prefix):
    node = root
    for ch in prefix:
        if ch not in node.children:
            return False
        node = node.children[ch]
    return True

root = TrieNode()
for w in ["apple", "app", "apricot"]:
    insert(root, w)

result = startsWith(root, "ap")
`,
  input: 'words = ["apple", "app", "apricot"], startsWith("ap")',
  intuition:
    "A prefix check is just an insert-shaped walk that never needs to build anything — if you can follow every letter of the prefix down existing branches without falling off the trie, that prefix exists, whether or not it's a complete word on its own.",
  meta: {
    topic: "Tries",
    subPattern: "trie prefix search",
    roles: {
      root: "treeRoot",
      node: "pointer",
      word: "other",
      ch: "other",
      w: "other",
      prefix: "other",
      result: "resultVar",
    },
    inputDescription: "A small set of words inserted into a trie, then a prefix check.",
  },
};
