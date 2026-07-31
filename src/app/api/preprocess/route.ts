import { NextResponse } from "next/server";

// Full Gemini preprocessing pipeline (normalize/classify/roles, zod validation,
// retry-on-invalid-JSON, rate limiting) lands in Phase 4. Stubbed for now so the
// route exists and returns a typed error the UI can already render.
export async function POST() {
  return NextResponse.json(
    { error: "preprocess_not_implemented", message: "LLM preprocessing lands in Phase 4." },
    { status: 501 },
  );
}
