import type { Example } from "@/lib/trace/meta";

export const numberOfIslandsExample: Example = {
  id: "number-of-islands",
  topic: "Graphs",
  name: "Number of Islands",
  difficulty: "Medium",
  code: `def numIslands(grid):
    rows, cols = len(grid), len(grid[0])
    visited = set()

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if (r, c) in visited or grid[r][c] == 0:
            return
        visited.add((r, c))
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in visited:
                dfs(r, c)
                count += 1
    return count

grid = [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
]
result = numIslands(grid)
`,
  input: "grid = 4x4 land(1)/water(0) map",
  intuition:
    "An island is just a blob of connected 1s. Scan every cell; the moment you find unvisited land, flood-fill outward in all four directions to mark the whole blob visited, and count that as one island. Cells you've already flooded never start a new count.",
  meta: {
    topic: "Graphs",
    subPattern: "grid flood-fill (DFS)",
    roles: {
      grid: "dpTable2D",
      visited: "other",
      r: "pointer",
      c: "pointer",
      rows: "other",
      cols: "other",
      count: "resultVar",
      result: "resultVar",
    },
    inputDescription: "A small grid of 1s (land) and 0s (water).",
  },
};
