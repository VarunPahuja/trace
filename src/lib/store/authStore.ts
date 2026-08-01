"use client";

import { create } from "zustand";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthStatus = "loading" | "signed-out" | "signed-in";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  initialized: boolean;
  /** Mount once (see AuthInit) — subscribes to Supabase auth state changes.
   * A no-op when unconfigured: status resolves straight to "signed-out"
   * so every consumer (TopBar, tracker store) can treat "unconfigured" and
   * "configured but signed out" identically without a third branch. */
  init: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: isSupabaseConfigured() ? "loading" : "signed-out",
  user: null,
  initialized: false,

  init: () => {
    if (!isSupabaseConfigured()) {
      set({ status: "signed-out", initialized: true });
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      set({ status: "signed-out", initialized: true });
      return;
    }

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      set({
        user: data.session?.user ?? null,
        status: data.session?.user ? "signed-in" : "signed-out",
        initialized: true,
      });
    });

    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      set({
        user: session?.user ?? null,
        status: session?.user ? "signed-in" : "signed-out",
        initialized: true,
      });
    });
  },

  signOut: async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null, status: "signed-out" });
  },
}));
