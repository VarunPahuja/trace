import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Refreshes the Supabase auth session cookie on every matched request, per
 * @supabase/ssr's App Router docs. A pure pass-through when unconfigured —
 * this must never change response behavior for an app with no Supabase
 * keys set. */
export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // Do not add logic between createServerClient and getUser() — per
  // @supabase/ssr docs, that gap is where session-refresh bugs creep in.
  await supabase.auth.getUser();

  return supabaseResponse;
}
