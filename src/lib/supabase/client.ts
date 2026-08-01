"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/** Returns null when Supabase isn't configured — every caller must handle
 * that (fall back to the localStorage/no-auth path) rather than crash. */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return browserClient;
}
