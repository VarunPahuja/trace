"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let clientPromise: Promise<SupabaseClient | null> | null = null;

/** Resolves to null when Supabase isn't configured — every caller must
 * handle that (fall back to the localStorage/no-auth path) rather than
 * crash. The @supabase/ssr + @supabase/auth-js SDK (~500KB) is only
 * fetched via this dynamic import the first time this actually resolves
 * truthy — a static top-level import would ship it in every route's
 * bundle (including the landing page) regardless of whether Supabase is
 * even configured, which defeats the entire point of gating this feature
 * on env vars. */
export function getSupabaseBrowserClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("@supabase/ssr").then(({ createBrowserClient }) =>
      createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!),
    );
  }
  return clientPromise;
}
