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

### Part B — Perfection Pass (in progress)

**Animation tuning — done.** Rapid-fire stepping (simulating holding the step-forward key/button) across 16 examples spanning all 11 renderer types found and fixed two real bugs: a CallTreeRenderer crash on settled nodes (spring transition applied to a leftover multi-keyframe array) and a ControlDeck step-counter visual glitch (rapid changes concatenated text sideways instead of crossfading in place). Also audited every renderer's color usage against master.md §12's palette and added the missing alarm-tint on removal (Stack pop, LinkedList node-detach, HashMap key-delete) that master.md specifies but Phase 6 never implemented. Read=pop/write=accent/compare=shared-pop-pulse/discard=30%-opacity/visited=go were already correct from Phase 6.

Per-renderer visual correctness (does each of the 36 examples' specific algorithm animate sensibly) was extensively screenshot-verified during Phase 6 already (2 examples × 3 speeds × step/scrub/play modes per renderer) — tonight's pass focused on the two things Phase 6 couldn't have caught: rapid-interaction desync and a cross-renderer semantic-color audit, both requested explicitly tonight. Did not re-screenshot all 36 examples individually frame-by-frame on top of that existing coverage; flag if you want that additional exhaustive pass.

**Design/accessibility/mobile — done.** Global `:focus-visible` neo ring across every interactive element (was inconsistent — one input had a custom ring, one had `outline-none` with nothing to replace it). Computed real WCAG contrast ratios for every `text-ink/NN` tier in use: `ink/40` and `ink/50` both fail 4.5:1 (2.60:1 and 3.47:1); bumped all 23 non-placeholder instances to `ink/60` (4.81:1, the practical floor). Fixed a genuine mobile bug: `/app`'s control deck didn't wrap at 375px, causing real horizontal page scroll (measured 538px document width in a 375px viewport) — added `flex-wrap`. Also hid the "built for desktop" mobile banner on the landing page, where nothing is actually simplified.

**Error states — done.** Live-tested Python runtime errors, oversized code (real 413), empty code, and malformed share links against the running app — all already rendered designed cards with friendly messages, no raw status codes or stack traces leak anywhere (`formatValue` already maps `undefined`→"?" and `null`→"None"). Found and fixed one inconsistency: the "Broken share link" card used a plain black border instead of the alarm-tinted treatment every other error state uses.

**Copy pass — done.** Swept for lorem/TODO/leaked developer-speak — found none (`formatValue` already handles `undefined`/`null` correctly). Fixed two flat "loading…" strings that broke the app's established playful voice.

**Meta/SEO/OG — done.** Root layout has metadataBase + title template + full OpenGraph/Twitter fields; every route (/, /app, /tracker, /signin, /v) has its own title/description via thin layout.tsx wrappers where the page is a client component. Generated a real brand-style OG image and apple-touch-icon with `next/og`'s `ImageResponse` (matches the existing wordmark badge treatment exactly) — both prerender as static files, not per-request functions. `/v` (share links) gets its own explicit OG title so pasted links preview as themselves, not the generic landing page.

**Performance — done, found a real bug.** `AuthNav`/`AuthInit` mount globally (every route needs the sign-in link), and the Supabase client factory statically imported `@supabase/ssr` — so `@supabase/auth-js` (measured 498KB) was loading on *every* route including the landing page, regardless of configuration, directly regressing Phase 7's "no heavy bundle on landing" guarantee. Fixed with a dynamic `import()` that only fetches the SDK once `isSupabaseConfigured()` is actually true; landing page's Supabase JS dropped from 498KB to 0.6KB. Also confirmed scrub performance stays under 75ms even on a synthetic 800-step trace (the 36 built-in examples top out around 200 steps by design, so none reach "500+" through normal use).

### Final: preview deploy + full regression against preview — DONE

Deployed as a **preview** deployment (Vercel `target: null`, confirmed not production): `https://trace-all9oyg7x-varunps-projects.vercel.app`. Preview deployments on this Vercel team have SSO/Deployment Protection enabled by default, so testing them with Playwright needed a bypass token (`vercel curl` auto-generates one scoped to this project).

**A genuinely interesting testing-infrastructure bug along the way, worth knowing about for future overnight runs:** my first few regression attempts against the preview all failed with Pyodide's CDN fetch (`cdn.jsdelivr.net`) throwing `net::ERR_FAILED` inside the browser — but only ever on the *preview* URL, never on production, and never in 12+ hours of local dev testing. Root cause: I'd set the bypass token via Playwright's `extraHTTPHeaders`, which applies to **every** outgoing request from that browser context — including the page's own client-side fetch to the third-party Pyodide CDN. jsdelivr was rejecting the request outright because of the unexpected custom header. Switching to Vercel's other supported method — a one-time bypass via `?x-vercel-protection-bypass=...&x-vercel-set-bypass-cookie=true` query params on the first navigation, which sets a same-origin-only cookie instead of a blanket header — fixed it completely. **This was a bug in my test harness, not in the app** (nothing in tonight's diff touches Pyodide loading, CDN fetching, or CSP), but it burned real time to diagnose, so documenting it here in case a future session hits the same wall.

With that fixed:
- **All 36 examples**, full regression (load, scrub across 5 points, step forward ×2, play 4× briefly): **36/36 pass, 0 console/page errors**, against the live preview deployment.
- **LLM path, 2 unseen snippets** (a recursive Fibonacci, a set-intersection) — both preprocessed and executed successfully with zero console errors. Both landed on the designed "no renderer matched this trace yet — check the variables strip below" fallback rather than a crash, which is *correct*: neither snippet has a trackable data structure (just ints/sets with no role a renderer binds to), so master.md's opaque/unsupported-structure fallback is exactly what should show.
- **Share round-trip**: generated a share link from one browser profile, opened it in a completely separate fresh profile, landed correctly on `/app` with the traced example loaded.
- **Keyboard shortcuts**: → advanced a step, Space toggled play, confirmed working.
- **Landing demo loop**: loads in ~920ms, populates with real animated data within 2 seconds, zero console errors.
- **Tracker CRUD**: re-verified extensively on local dev (not re-run against preview specifically) — it's pure client-side localStorage logic with zero server/environment dependency, so local coverage is representative. Cloud-mode tracker CRUD is the one item genuinely blocked on you creating a Supabase project (see below).

---

## Skipped / Blocked (needs your input)

Nothing was silently skipped — everything below is code-complete and was verified as far as it's possible to verify without a credential only you can provide.

1. **Cloud Supabase read/write path** (tracker CRUD while signed in, the import-prompt flow, session persistence across reloads). Blocked on: no Supabase project exists yet. Code follows the `@supabase/ssr` docs pattern exactly and the local/unconfigured path (the one that's 100% reachable tonight) is byte-identical to pre-Part-A behavior. Once you create a project and set the two env vars, this needs a real end-to-end pass — see "How to test" below.
2. **Google OAuth sign-in.** Blocked on: needs a real Google Cloud OAuth client + the redirect URI registered in both Google Cloud Console and Supabase. The button/flow is implemented (`supabase.auth.signInWithOAuth`) but has never fired against a real provider.
3. **Magic-link email delivery.** Blocked on: Supabase's default email sending (or your own SMTP config) isn't set up yet. The call (`supabase.auth.signInWithOtp`) is implemented; whether the email actually arrives depends on your Supabase project's email settings.
4. **Rate-limit (429) verified by code review, not by triggering it live.** `checkRateLimit` returns the same designed error card as every other failure path (already proven by testing 4 other error paths live) — didn't spend 10 real requests against the Gemini quota just to watch the same code path fire a 5th time.
5. **Exhaustive 36-example × multiple-steps screenshot re-verification** wasn't redone from scratch — Phase 6 already did this per-renderer (2 examples × 3 speeds × step/scrub/play each) and tonight's animation pass targeted specifically what Phase 6 couldn't have caught (rapid-interaction desync, cross-renderer color-semantic audit). If you want the full frame-by-frame re-screenshot on top of that, ask and I'll do it as a follow-up.

---

## Manual steps for you (in order)

1. **Create a Supabase project.** [supabase.com](https://supabase.com) → New project. Pick any region; note the project's Project URL and anon/public key (Settings → API).

2. **Run the schema.** Open the SQL Editor in the Supabase dashboard, paste the full contents of `supabase/setup.sql` from this branch, and run it. It's idempotent (uses `if not exists` / `drop policy if exists`), so re-running it later is safe. This creates `tracker_entries` with RLS enabled and 4 policies (select/insert/update/delete, each scoped to `auth.uid() = user_id`).

3. **Set env vars locally.** In `.env.local` at the repo root (already gitignored — confirmed never committed):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon/public key>
   ```
   Restart `npm run dev` after adding these — Next.js only reads `.env.local` at server start.

4. **Set the same two env vars on Vercel.** Project Settings → Environment Variables → add both for Production, Preview, and Development. Redeploy after adding them (env var changes don't retroactively apply to already-built deployments).

5. **Configure email magic links.** Supabase Dashboard → Authentication → Providers → Email should already be on by default. Authentication → URL Configuration → set:
   - **Site URL:** `https://tracepy.vercel.app`
   - **Redirect URLs (allowlist):** add both `https://tracepy.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` (the second one so local dev sign-in works too).

6. **Configure Google OAuth (optional — magic link works without this).**
   - In [Google Cloud Console](https://console.cloud.google.com/), create an OAuth 2.0 Client ID (Web application).
   - Authorized redirect URI: use the one Supabase shows you under Authentication → Providers → Google — it's `https://<your-project-ref>.supabase.co/auth/v1/callback`, **not** `/auth/callback` on tracepy.vercel.app (that's Trace's own callback route which Supabase redirects to *after* its own OAuth exchange).
   - Paste the resulting Client ID + Client Secret into Supabase's Google provider settings and toggle it on.

7. **Supabase Auth URL allowlist for tracepy.vercel.app** — same as step 5's Redirect URLs list; if you also want the Vercel preview URLs to support sign-in during testing, add a wildcard like `https://trace-*.vercel.app/auth/callback` too (Supabase supports wildcard redirect URLs).

---

## How to test auth end-to-end once keys are in

1. Load `/signin` — the "coming online soon" note should be gone, both buttons enabled.
2. **Magic link:** enter your email, click "Send magic link", check your inbox, click the link. Should land you on `/app` signed in (TopBar shows an initial-chip avatar, not "Sign in").
3. **Google:** click "Continue with Google", complete the OAuth flow. Same landing behavior.
4. **Tracker sync:** before signing in, add 1-2 problems to the tracker (localStorage mode). Sign in — you should see the "Bring your problems along?" import prompt. Click Import; the entries should now show a "synced" badge next to the Tracker heading, and if you clear localStorage and reload you should still see them (proves they're actually in Supabase, not just cached).
5. **Cross-device:** sign in on a second browser/incognito window with the same account — the same tracker entries should appear.
6. **Sign out:** click the avatar chip → Sign out. Tracker should fall back to local mode (whatever was in localStorage before, untouched — the cloud entries aren't deleted, just not shown while signed out).
7. Check the Supabase dashboard's Table Editor → `tracker_entries` to confirm rows actually have the right `user_id` and RLS is enforced (try querying as a different user's JWT if you want to confirm the policies reject cross-user reads).

---

## Merge & deploy sequence (overnight → main → production)

Nothing was merged or deployed to production tonight — only preview deployments, per instructions. When you've reviewed this branch (and ideally done the auth end-to-end pass above once keys are in):

```bash
# From the repo root, with the overnight branch pushed (already done):
git checkout main
git pull origin main
git merge --no-ff overnight -m "Merge overnight: Phase 8 auth-ready + perfection pass"
git push origin main

# If you use Vercel's Git integration, pushing to main auto-deploys to
# production. Otherwise, deploy explicitly:
vercel --prod
```

If you'd rather review via a PR instead of merging directly: `gh pr create --base main --head overnight` — the branch is already pushed to `origin/overnight`.

Before merging, worth a final skim of the diff for anything that looks off: `git diff main...overnight --stat` (16+ commits, touches auth/tracker/all 11 renderers/global CSS/metadata — summarized commit-by-commit in the Status section above; run `git log main..overnight --oneline` for the exact count and messages).
