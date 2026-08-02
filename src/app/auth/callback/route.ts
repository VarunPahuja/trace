import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Google OAuth + email magic-link redirect target. Exchanges the auth
 * code for a session, then hands off to the workspace — matches
 * ShareLinkLoader's convention of landing users on /app once their state
 * (here: a session, not a shared trace) is ready. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";
        if (isLocalEnv || !forwardedHost) {
          return NextResponse.redirect(`${origin}${next}`);
        }
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth`);
}
