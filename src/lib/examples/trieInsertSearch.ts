import type { Example } from "@/lib/trace/meta";

export const trieInsertSearchExample: Example = {
  id: "trie-insert-search",
  topic: "Tries",
  name: "Insert + Search Words",
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

def search(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            return False
        node = node.children[ch]
    return node.is_word

root = TrieNode()
for w in ["cat", "car", "dog"]:
    insert(root, w)

result = search(root, "car")
`,
  input: 'words = ["cat", "car", "dog"], search("car")',
  intuition:
    "Each node is a fork in the road, one branch per next letter. Inserting just walks the word letter by letter, building any forks that don't exist yet, and marks the final node as a real word — not just a prefix someone passed through.",
  meta: {
    topic: "Tries",
    subPattern: "trie insert + search",
    roles: {
      root: "treeRoot",
      node: "pointer",
      word: "other",
      ch: "other",
      w: "other",
      result: "resultVar",
    },
    inputDescription: "A small set of words inserted into a trie, then searched.",
  },
};
