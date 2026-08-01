import type { Example } from "@/lib/trace/meta";

export const reverseLinkedListExample: Example = {
  id: "reverse-linked-list",
  topic: "Linked List",
  name: "Reverse Linked List",
  difficulty: "Easy",
  code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def buildList(values):
    dummy = ListNode()
    tail = dummy
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev

head = buildList([1, 2, 3, 4])
result = reverseList(head)
`,
  input: "list = [1, 2, 3, 4]",
  intuition:
    "You only ever need three hands: one holding what you already flipped, one on the node you're flipping now, and one bookmarking what's next before you cut the cord. Rewire curr to point backward, then shuffle all three hands forward one node.",
  meta: {
    topic: "Linked List",
    subPattern: "iterative in-place reversal",
    roles: {
      head: "linkedListHead",
      prev: "pointer",
      curr: "pointer",
      next_node: "pointer",
      result: "linkedListHead",
      dummy: "linkedListHead",
      tail: "pointer",
      v: "other",
      values: "other",
    },
    inputDescription: "A short linked list built from a small array of values.",
    problemName: "Reverse Linked List (LeetCode 206)",
    problemSummary:
      "Given the head of a singly linked list, reverse the list in place and return the new head.",
    constraints: ["0 <= number of nodes <= 5000", "reversal is done in place", "node values can be any integer"],
  },
};
