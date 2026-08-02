// Phase 8 — env-gated Supabase integration. Every consumer of this module
// (auth UI, middleware, the tracker store) must check `isSupabaseConfigured`
// before touching a Supabase client, so that with no env keys set the app
// behaves exactly as it did before this feature existed — no code changes
// needed once real keys land, only setting the two env vars below.
//
// Deliberately no service-role key anywhere in this app: the tracker's RLS
// policies (auth.uid() = user_id, see supabase/setup.sql) are sufficient
// for every operation the client needs, so there's no server-only
// privileged client to leak.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
