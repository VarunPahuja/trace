import { NextResponse } from "next/server";
import { z } from "zod";
import type { LeetCodeAutofillResponse, LeetCodeErrorBody } from "@/lib/leetcode/types";
import { mapLeetCodeTopic } from "@/lib/leetcode/topicMap";

// Tracker LeetCode autofill: paste a problem link, get back name/difficulty/
// topic. Deliberately does not fetch or store the problem statement body —
// only metadata needed to prefill the Add Problem form.
const TIMEOUT_MS = 8_000;
const GRAPHQL_URL = "https://leetcode.com/graphql";

const RequestSchema = z.object({ url: z.string().min(1) });

const QUESTION_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      difficulty
      topicTags { name }
    }
  }
`;

function errorResponse(body: LeetCodeErrorBody, status: number) {
  return NextResponse.json(body, { status });
}

function extractSlug(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (!/(^|\.)leetcode\.com$/i.test(url.hostname)) return null;
  const match = url.pathname.match(/\/problems\/([a-z0-9-]+)\/?/i);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse({ error: "invalid_url", message: "Malformed request body." }, 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse({ error: "invalid_url", message: "Missing or invalid URL." }, 400);
  }

  const slug = extractSlug(parsed.data.url);
  if (!slug) {
    return errorResponse({ error: "invalid_url", message: "That doesn't look like a LeetCode problem URL." }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/problems/${slug}/`,
      },
      body: JSON.stringify({ query: QUESTION_QUERY, variables: { titleSlug: slug } }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return errorResponse({ error: "upstream_error", message: "Couldn't reach LeetCode." }, 502);
    }

    const json = await res.json();
    const question = json?.data?.question;
    if (!question || typeof question.title !== "string") {
      return errorResponse({ error: "not_found", message: "Couldn't find that problem on LeetCode." }, 404);
    }

    const rawDifficulty = String(question.difficulty ?? "").toLowerCase();
    const difficulty: LeetCodeAutofillResponse["difficulty"] = (
      ["easy", "medium", "hard"] as const
    ).includes(rawDifficulty as never)
      ? (rawDifficulty as LeetCodeAutofillResponse["difficulty"])
      : "medium";

    const response: LeetCodeAutofillResponse = {
      name: question.questionFrontendId ? `${question.title} (LeetCode ${question.questionFrontendId})` : question.title,
      difficulty,
      topic: mapLeetCodeTopic(question.topicTags ?? []),
    };
    return NextResponse.json(response);
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return errorResponse(
      {
        error: timedOut ? "timeout" : "upstream_error",
        message: timedOut ? "Timed out reaching LeetCode — try again." : "Couldn't reach LeetCode.",
      },
      timedOut ? 504 : 502,
    );
  } finally {
    clearTimeout(timeout);
  }
}
