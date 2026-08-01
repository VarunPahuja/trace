import type { Example } from "@/lib/trace/meta";

export const rotateImageExample: Example = {
  id: "rotate-image",
  topic: "Math & Geometry",
  name: "Rotate Image",
  difficulty: "Medium",
  code: `def rotate(matrix):
    n = len(matrix)
    for layer in range(n // 2):
        first, last = layer, n - 1 - layer
        for i in range(first, last):
            offset = i - first
            top = matrix[first][i]
            matrix[first][i] = matrix[last - offset][first]
            matrix[last - offset][first] = matrix[last][last - offset]
            matrix[last][last - offset] = matrix[i][last]
            matrix[i][last] = top

matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
rotate(matrix)
result = matrix
`,
  input: "matrix = 3x3 grid",
  intuition:
    "Rotating 90° in place is really just a 4-way swap done ring by ring: each of the four corners of a layer takes the value from the corner before it, and you hold one value in a temp spot so nothing gets overwritten before it's copied.",
  meta: {
    topic: "Math & Geometry",
    subPattern: "layer-by-layer four-way swap",
    roles: {
      matrix: "dpTable2D",
      n: "other",
      layer: "other",
      first: "other",
      last: "other",
      i: "other",
      offset: "other",
      top: "other",
      result: "other",
    },
    inputDescription: "A small square matrix to rotate 90° clockwise, in place.",
    problemName: "Rotate Image (LeetCode 48)",
    problemSummary:
      "Given an n x n matrix representing an image, rotate it 90 degrees clockwise in place, without allocating another matrix.",
    constraints: ["n == matrix.length == matrix[i].length", "1 <= n <= 20", "rotation must be done in place"],
  },
};
