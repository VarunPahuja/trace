"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuthStore } from "@/lib/store/authStore";

/** Sign-in link / signed-in avatar dropdown for the TopBar. Renders
 * nothing at all when Supabase isn't configured — auth is optional
 * everywhere, and an inert "Sign in" link would just be noise. */
export default function AuthNav() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isSupabaseConfigured() || status === "loading") return null;

  if (status === "signed-out" || !user) {
    return (
      <Link href="/signin" className="hover:text-accent transition-colors">
        Sign in
      </Link>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.email ?? "signed-in user"}`}
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border-neo shadow-neo-sm bg-accent text-paper font-display text-xs press-neo"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 card-neo p-2 flex flex-col gap-1 z-50 normal-case tracking-normal"
        >
          <div className="font-mono text-xs text-ink/60 px-2 py-1 truncate">{user.email}</div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="btn-neo text-xs py-1.5 text-left"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
