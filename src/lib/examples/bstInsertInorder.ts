import type { Example } from "@/lib/trace/meta";

export const bstInsertInorderExample: Example = {
  id: "bst-insert-inorder",
  topic: "Trees",
  name: "BST Insert + Inorder Traversal",
  difficulty: "Easy",
  code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def inorder(node, result):
    if node is None:
        return
    inorder(node.left, result)
    result.append(node.val)
    inorder(node.right, result)

root = None
for v in [5, 3, 8, 1, 4, 7, 9]:
    root = insert(root, v)

result = []
inorder(root, result)
`,
  input: "values = [5, 3, 8, 1, 4, 7, 9]",
  intuition:
    "A BST keeps a promise at every node: smaller values live to the left, bigger ones to the right. Insertion just follows that promise down to an empty spot. Inorder traversal reads the promise back out — visit left, then me, then right — which is exactly why it comes out sorted.",
  meta: {
    topic: "Trees",
    subPattern: "recursive BST insert + inorder traversal",
    roles: {
      root: "treeRoot",
      node: "pointer",
      val: "other",
      v: "other",
      result: "resultVar",
    },
    inputDescription: "A small sequence of integers inserted one at a time to build a BST.",
  },
};
