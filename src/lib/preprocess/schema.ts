// LLM response contract — master.md §6.4: strict JSON, validated with zod.
import { z } from "zod";
import { TOPICS, VARIABLE_ROLES } from "@/lib/trace/meta";

export const PreprocessResponseSchema = z.object({
  normalizedCode: z.string().min(1),
  topic: z.enum(TOPICS),
  subPattern: z.string(),
  roles: z.record(z.string(), z.enum(VARIABLE_ROLES)),
  inputDescription: z.string(),
});

export type PreprocessResponse = z.infer<typeof PreprocessResponseSchema>;

export interface PreprocessRequestBody {
  code: string;
  userInput?: string;
}

export type PreprocessErrorCode =
  | "empty_code"
  | "code_too_large"
  | "rate_limited"
  | "timeout"
  | "invalid_response"
  | "upstream_error";

export interface PreprocessErrorBody {
  error: PreprocessErrorCode;
  message: string;
}
