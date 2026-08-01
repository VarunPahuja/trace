import type { Example } from "@/lib/trace/meta";

export const mergeTwoSortedListsExample: Example = {
  id: "merge-two-sorted-lists",
  topic: "Linked List",
  name: "Merge Two Sorted Lists",
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

def mergeTwoLists(l1, l2):
    dummy = ListNode()
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 if l1 else l2
    return dummy.next

l1 = buildList([1, 2, 4])
l2 = buildList([1, 3, 4])
result = mergeTwoLists(l1, l2)
`,
  input: "l1 = [1, 2, 4], l2 = [1, 3, 4]",
  intuition:
    "Both lists are already sorted, so the smallest remaining head is always one of the two nodes right in front of you. Keep grabbing whichever is smaller and stitch it onto your growing result — a dummy node saves you from special-casing the very first pick.",
  meta: {
    topic: "Linked List",
    subPattern: "two-pointer merge with a dummy head",
    roles: {
      l1: "linkedListHead",
      l2: "linkedListHead",
      result: "linkedListHead",
      dummy: "linkedListHead",
      tail: "pointer",
      v: "other",
      values: "other",
    },
    inputDescription: "Two short sorted linked lists.",
    problemName: "Merge Two Sorted Lists (LeetCode 21)",
    problemSummary:
      "Given the heads of two sorted linked lists, splice them together into one sorted list by reusing the existing nodes.",
    constraints: ["0 <= nodes in each list <= 50", "both lists are sorted in non-decreasing order", "result reuses the original nodes"],
  },
};
