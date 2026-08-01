import type { Example } from "@/lib/trace/meta";

export const bestTimeToBuySellStockExample: Example = {
  id: "best-time-to-buy-sell-stock",
  topic: "Sliding Window",
  name: "Best Time to Buy/Sell Stock",
  difficulty: "Easy",
  code: `def maxProfit(prices):
    left, right = 0, 1
    maxProfitSoFar = 0
    while right < len(prices):
        if prices[left] < prices[right]:
            profit = prices[right] - prices[left]
            maxProfitSoFar = max(maxProfitSoFar, profit)
        else:
            left = right
        right += 1
    return maxProfitSoFar

prices = [7, 1, 5, 3, 6, 4]
result = maxProfit(prices)
`,
  input: "prices = [7, 1, 5, 3, 6, 4]",
  intuition:
    "Buy low, sell high — so keep a window from your cheapest-so-far day to today. If today's price beats the window's start, that's a candidate profit; if today's cheaper than your anchor, drop the anchor here instead. One pass, no lookback.",
  meta: {
    topic: "Sliding Window",
    subPattern: "sliding window / greedy min-tracking",
    roles: {
      prices: "mainArray",
      left: "windowStart",
      right: "windowEnd",
      maxProfitSoFar: "resultVar",
      profit: "other",
      result: "resultVar",
    },
    inputDescription: "A small list of daily stock prices.",
    problemName: "Best Time to Buy and Sell Stock (LeetCode 121)",
    problemSummary:
      "Given a list of daily stock prices, find the maximum profit from buying on one day and selling on a later day, returning 0 if no profit is possible.",
    constraints: ["1 <= prices.length <= 10^5", "must buy before you sell", "at most one buy and one sell allowed"],
  },
};
