# Overnight Handoff — Phase 8 (Auth-Ready) + Perfection Pass

Branch: `overnight` (off `main` at commit `4265a95`). **Not merged to main, not deployed to production** — only preview deployments were made, per instructions. Review this file, then follow "Merge & deploy sequence" at the bottom when ready.

Baseline before any changes tonight: `npx tsc --noEmit` clean, `npx eslint src` clean, `npm run build` clean, all 36 examples pass regression with zero console/page errors.

---

## Status

_This section is updated live as work completes. Each entry: what shipped, how it was verified, and the commit it landed in._

### Part A — Auth + Cloud Tracker (env-gated, Supabase) — DONE

- `isSupabaseConfigured()` (`src/lib/supabase/config.ts`) gates everything on `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No service-role key anywhere in the app — RLS policies cover every client operation.
- Browser/server client factories (`src/lib/supabase/client.ts`, `server.ts`), middleware session refresh (`middleware.ts` + `src/lib/supabase/middleware.ts`), `/auth/callback` route. All pure pass-through when unconfigured.
- `/signin`: Google OAuth + email magic link, neobrutalist, disabled with a "coming online soon" note when unconfigured.
- `useAuthStore` (zustand) + `AuthInit` (mounted once in root layout) subscribe to Supabase auth state.
- TopBar `AuthNav`: hidden entirely when unconfigured; "Sign in" link when signed out; initial-chip dropdown (email + sign out) when signed in. Verified visually via a temporary debug hook (reverted before commit — no real Supabase project exists yet to test against for real).
- `trackerStore` is dual-mode (`mode: "local" | "cloud"`), resolved from auth state at hydrate time and reactively on sign-in/out. Every existing consumer component (modal, card, export button, undo toast) needed zero changes — cloud writes are optimistic with temp-id reconciliation. One-time import prompt (`ImportPromptModal`) on first sign-in when cloud is empty and local entries exist; local copy only cleared after confirmed import; the prompt is marked shown either way so it never repeats.
- `supabase/setup.sql`: full DDL (`tracker_entries` table, indexes, RLS enabled, 4 policies scoped to `auth.uid() = user_id`), idempotent — safe to re-run.
- **Verified tonight:** typecheck/lint/build clean, all 36 examples pass, full tracker CRUD (add/edit/status-cycle/delete/undo/filters/export) smoke-tested against a fresh browser profile in local (unconfigured) mode — byte-identical behavior to before Part A, zero console errors. `.env.local` confirmed never committed to git history.
- **Not verified tonight (needs your Supabase project):** the actual cloud read/write path, the import-prompt flow end-to-end, Google OAuth redirect, magic-link email delivery. All code-complete per the `@supabase/ssr` docs pattern, but there is no real Supabase project to point at until you create one. See "Manual steps for you" below.

---

## Skipped / Blocked (needs your input)

_Anything that couldn't be completed without your input or a real credential lands here — with what's blocking it and what to do about it._

---

## Manual steps for you (in order)

_Filled in as Part A completes — will cover: Supabase project creation, exact env var names/values, running `supabase/setup.sql`, Google OAuth redirect URLs, Supabase Auth URL allowlist entries._

---

## How to test auth end-to-end once keys are in

_Filled in as Part A completes._

---

## Merge & deploy sequence (overnight → main → production)

_Filled in at the end._
