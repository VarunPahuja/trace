import type { Example } from "@/lib/trace/meta";

export const maxDepthExample: Example = {
  id: "max-depth",
  topic: "Trees",
  name: "Max Depth",
  difficulty: "Easy",
  code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def buildTree(spec):
    if spec is None:
        return None
    val, leftSpec, rightSpec = spec
    return TreeNode(val, buildTree(leftSpec), buildTree(rightSpec))

def maxDepth(node):
    if node is None:
        return 0
    leftDepth = maxDepth(node.left)
    rightDepth = maxDepth(node.right)
    return 1 + max(leftDepth, rightDepth)

root = buildTree((3, (9, None, None), (20, (15, None, None), (7, None, None))))
result = maxDepth(root)
`,
  input: "tree = [3, 9, 20, null, null, 15, 7]",
  intuition:
    "A tree's depth is just \"1 plus however deep my deeper child goes.\" Ask both children recursively, trust their answers, take the bigger one, add one for yourself. An empty spot has depth zero — that's what stops the recursion.",
  meta: {
    topic: "Trees",
    subPattern: "recursive depth-first max depth",
    roles: {
      root: "treeRoot",
      node: "pointer",
      leftDepth: "other",
      rightDepth: "other",
      result: "resultVar",
      spec: "other",
      val: "other",
      leftSpec: "other",
      rightSpec: "other",
    },
    inputDescription: "A small fixed binary tree.",
  },
};
