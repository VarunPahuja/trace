import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  PreprocessResponseSchema,
  type PreprocessErrorBody,
  type PreprocessRequestBody,
  type PreprocessResponse,
} from "@/lib/preprocess/schema";
import { SYSTEM_PROMPT, buildRetryPrompt, buildUserPrompt } from "@/lib/preprocess/prompt";
import { checkRateLimit } from "@/lib/preprocess/rateLimit";

// master.md §6/§19: strict JSON contract, zod-validated, one corrective
// retry, 15s timeout, server-only key, naive rate limit, 6KB code cap.
//
// §4 locks the model as gemini-2.5-pro, but this project's key has zero
// quota for it on the free tier (confirmed via direct SDK call: 429
// RESOURCE_EXHAUSTED, limit 0 — an entitlement issue, not a transient
// rate limit). gemini-2.5-flash is also unavailable — confirmed 404
// "no longer available to new users" regardless of quota. Per explicit
// user direction, using gemini-3.1-flash-lite (confirmed working, 500
// req/day quota vs. 20 for the flash alternative also offered).
const MODEL = "gemini-3.1-flash-lite";
const TIMEOUT_MS = 15_000;
const MAX_CODE_BYTES = 6 * 1024;

function errorResponse(body: PreprocessErrorBody, status: number) {
  return NextResponse.json(body, { status });
}

function isTimeoutError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /timeout|deadline/i.test(message);
}

function upstreamErrorResponse(err: unknown) {
  return isTimeoutError(err)
    ? errorResponse({ error: "timeout", message: "Couldn't read that code in time — try again." }, 504)
    : errorResponse({ error: "upstream_error", message: "Couldn't read that code." }, 502);
}

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

async function callGemini(ai: GoogleGenAI, userPrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      httpOptions: { timeout: TIMEOUT_MS },
    },
  });
  const text = response.text;
  if (!text) throw new Error("empty response from model");
  return text;
}

type ParseOutcome = { ok: true; data: PreprocessResponse } | { ok: false; error: string };

/** Strips accidental markdown fences, parses JSON, validates with zod — §6.4. */
function parseAndValidate(rawText: string): ParseOutcome {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripMarkdownFences(rawText));
  } catch (err) {
    return { ok: false, error: `not valid JSON: ${err instanceof Error ? err.message : String(err)}` };
  }
  const result = PreprocessResponseSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: result.error.message };
  }
  return { ok: true, data: result.data };
}

export async function POST(request: Request) {
  let body: PreprocessRequestBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse({ error: "invalid_response", message: "Malformed request body." }, 400);
  }

  const code = body.code ?? "";
  if (!code.trim()) {
    return errorResponse({ error: "empty_code", message: "Paste some Python code first." }, 400);
  }
  if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
    return errorResponse({ error: "code_too_large", message: "Code exceeds the 6KB limit." }, 413);
  }

  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return errorResponse(
      { error: "rate_limited", message: "Too many requests — wait a moment and try again." },
      429,
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse(
      { error: "upstream_error", message: "Preprocessing is not configured (missing API key)." },
      500,
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const userPrompt = buildUserPrompt(code, body.userInput);

  let rawText: string;
  try {
    rawText = await callGemini(ai, userPrompt);
  } catch (err) {
    return upstreamErrorResponse(err);
  }

  const first = parseAndValidate(rawText);
  if (first.ok) {
    return NextResponse.json(first.data);
  }

  // One corrective retry, per §6.4.
  let retryText: string;
  try {
    retryText = await callGemini(ai, `${userPrompt}\n\n${buildRetryPrompt(rawText, first.error)}`);
  } catch (err) {
    return upstreamErrorResponse(err);
  }

  const retry = parseAndValidate(retryText);
  if (retry.ok) {
    return NextResponse.json(retry.data);
  }

  return errorResponse(
    { error: "invalid_response", message: "The preprocessor returned something we couldn't parse." },
    502,
  );
}
