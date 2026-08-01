import type { Topic } from "@/lib/trace/meta";

export type LeetCodeErrorCode = "invalid_url" | "not_found" | "timeout" | "upstream_error";

export interface LeetCodeErrorBody {
  error: LeetCodeErrorCode;
  message: string;
}

export interface LeetCodeAutofillResponse {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  topic: Topic | null;
}
