"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuthStore } from "@/lib/store/authStore";

function SignInContent() {
  const configured = isSupabaseConfigured();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hadCallbackError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Google sign-in didn't take. Try again in a moment.");
      setBusy(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) {
      setError("Couldn't send that link — check the address and try again.");
      return;
    }
    setSent(true);
  }

  if (status === "signed-in" && user) {
    return (
      <div className="card-neo p-6 max-w-md w-full text-center flex flex-col gap-3 items-center">
        <div className="font-display uppercase text-go text-lg">You&apos;re signed in</div>
        <p className="font-body text-sm text-ink/70">{user.email}</p>
        <button type="button" onClick={() => router.push("/app")} className="btn-neo-accent text-sm py-2 px-6">
          Go to the workspace
        </button>
      </div>
    );
  }

  return (
    <div className="card-neo p-6 max-w-md w-full flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-display text-2xl uppercase tracking-tight">Sign in</h1>
        <p className="font-body text-sm text-ink/60">
          Sync your tracker across devices. Everything else works without this.
        </p>
      </div>

      {!configured && (
        <div className="border-neo shadow-neo-sm rounded-lg bg-pop/20 px-3 py-2 text-xs font-mono text-center">
          accounts are coming online soon — the tracker works great without one in the meantime
        </div>
      )}

      {hadCallbackError && (
        <div className="border-neo shadow-neo-sm rounded-lg bg-alarm/10 px-3 py-2 text-xs font-mono text-center text-alarm">
          that sign-in link didn&apos;t work — it may have expired. Try again below.
        </div>
      )}

      {error && (
        <div className="border-neo shadow-neo-sm rounded-lg bg-alarm/10 px-3 py-2 text-xs font-mono text-center text-alarm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={!configured || busy}
        className="btn-neo text-sm py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-ink/40 font-mono text-xs uppercase">
        <div className="flex-1 h-px bg-ink/20" />
        or
        <div className="flex-1 h-px bg-ink/20" />
      </div>

      {sent ? (
        <div className="border-neo shadow-neo-sm rounded-lg bg-go/10 px-3 py-2 text-sm text-center">
          Check <span className="font-mono">{email}</span> for a magic link.
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
          <input
            type="email"
            required
            disabled={!configured || busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="card-neo px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/40 outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!configured || busy || !email.trim()}
            className="btn-neo-accent text-sm py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send magic link
          </button>
        </form>
      )}

      <Link href="/app" className="text-center font-mono text-xs text-ink/50 hover:text-accent transition-colors">
        skip for now →
      </Link>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Suspense fallback={<div className="card-neo p-6 max-w-md w-full text-center text-ink/50 text-sm">loading…</div>}>
        <SignInContent />
      </Suspense>
    </div>
  );
}
