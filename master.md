# TRACE — Master Implementation Specification

**For: Claude Code. Read this entire document before writing any code. Build in the phase order given in Section 18. Do not add features not in this spec. Do not skip acceptance criteria.**

---

## 1. Product Definition

Trace is a web app where a user pastes Python code implementing a DSA algorithm, presses **Visualize**, and watches the code execute step by step with polished animations. The visualization is driven by **real execution** of the code, not by an LLM imagining the steps. An LLM is used only as a backend preprocessor that normalizes code and emits metadata; it plays zero role in generating the execution trace.

Core loop: Paste code → (optional) edit input → Visualize → animated playback synced to a highlighted code line → share via URL.

Secondary tool: a personal problem tracker (localStorage) where the user logs problems solved, intuition, notes, time taken, and difficulty.

Target user: a student grinding the NeetCode-style roadmap. Must support all 18 roadmap topics: Arrays & Hashing, Two Pointers, Stack, Binary Search, Sliding Window, Linked List, Trees, Tries, Heap/Priority Queue, Backtracking, Graphs, Advanced Graphs, 1-D DP, 2-D DP, Intervals, Greedy, Bit Manipulation, Math & Geometry.

## 2. Non-Goals (do not build)

- No accounts, no auth, no database. Tracker is localStorage only.
- No language other than Python.
- No mobile-first optimization. Must not be broken on mobile, but desktop is the target; on <768px show a "best on desktop" banner and a simplified read-only layout.
- No step-backward *re-execution* — backward stepping is done by replaying the precomputed trace, which is trivial since the full trace is precomputed.
- No LLM-generated visualizations, explanations during playback, or chat feature.
- No collaborative/multi-user features.

## 3. Definition of Done (tonight)

1. Deployed on Vercel at a public URL.
2. All 36 preloaded examples (2 per topic × 18 topics) visualize correctly end to end.
3. Arbitrary pasted Python for at least the array-family patterns produces a correct visualization via the preprocess → execute → render pipeline.
4. All playback controls work: play, pause, step forward, step back, speed (0.25×–4×), scrub timeline.
5. Share link reproduces the exact code + input on another machine.
6. Tracker: add, edit, delete, persist entries.
7. No unhandled runtime crashes: every failure path shows a designed error state.

## 4. Tech Stack (locked — do not substitute)

- **Next.js 14+ (App Router) + TypeScript**, deployed on Vercel.
- **Tailwind CSS** for styling; design tokens in Tailwind config.
- **Framer Motion** for all animation (layout animations, springs, AnimatePresence).
- **CodeMirror 6** (`@codemirror/lang-python`) for the editor, custom theme.
- **Pyodide** loaded in a **Web Worker** for Python execution (load from Pyodide CDN at runtime — do not bundle; show a designed loading state on first load).
- **Zustand** for client state (trace, playback, UI).
- **lz-string** for URL-encoded share links.
- **Google Gemini API** (`gemini-2.5-pro`) via one Next.js API route for preprocessing. API key from `process.env.GEMINI_API_KEY`.
- No other runtime dependencies without necessity. No Redux, no styled-components, no D3 (hand-rolled SVG layout is required for control over animation).

## 5. System Architecture

```
[Editor: user Python code + input]
        │  POST /api/preprocess
        ▼
[API route → Gemini API]
  - normalizes code (canonical classes, deterministic form)
  - classifies pattern (one of 18 topics + sub-pattern)
  - emits variable role metadata
        │  { normalizedCode, meta }
        ▼
[Web Worker: Pyodide + tracer harness]
  - runs normalizedCode with sys.settrace
  - snapshots locals per line event
  - serializes structures to JSON-safe form
        │  { steps: TraceStep[] }
        ▼
[Trace Store (Zustand)]
        │
        ▼
[Playback Engine] ──► [Renderer Registry] ──► SVG/Framer Motion scene
        │                                       + synced code line highlight
        └──► timeline scrubber / controls
```

Preprocessing is skipped for the 36 built-in examples: they ship with hand-authored `meta` so the demo works offline/instantly and does not burn API tokens. The LLM path is only for user-pasted code.

## 6. LLM Preprocessing Contract

**Endpoint:** `POST /api/preprocess` with body `{ code: string, userInput?: string }`. Server-side only; never expose the key to the client. 15s timeout; on failure return a typed error the UI can render.

**The system prompt for the LLM must instruct it to do exactly this and nothing else:**

1. **Normalize** the user's code into `normalizedCode`:
   - Preserve algorithm semantics exactly. It is a refactor, not a rewrite.
   - Replace any user-defined linked list / tree / graph node classes with the canonical classes `ListNode(val, next)`, `TreeNode(val, left, right)`, and adjacency-list dicts, renaming attribute accesses accordingly (e.g., `node.nxt` → `node.next`).
   - Ensure there is a single entry call at the bottom: build the input, call the function, assign to `result`.
   - If the user pasted a bare function with no driver, synthesize a sensible small input (arrays ≤ 12 elements, trees ≤ 15 nodes, grids ≤ 8×8) so the trace is watchable.
   - Strip I/O (`input()`, `print`) and randomness; make everything deterministic.
2. **Classify**: `topic` (one of the 18, exact enum strings) and `subPattern` (free text, e.g., "opposite-direction two pointers").
3. **Emit variable roles** (`meta.roles`): for each significant variable, its semantic role from this enum: `mainArray`, `secondaryArray`, `pointer`, `windowStart`, `windowEnd`, `target`, `hashMap`, `stack`, `heap`, `linkedListHead`, `treeRoot`, `graph`, `dpTable1D`, `dpTable2D`, `intervalList`, `bitValue`, `resultVar`, `counter`, `visitedSet`, `queue`, `other`. Roles drive which renderer binds to which variable.
4. **Return strict JSON only** (no markdown fences): `{ normalizedCode, topic, subPattern, roles: { varName: role }, inputDescription }`. The API route must strip accidental fences and validate the shape with zod; on validation failure, retry once with an error-correction message, then surface a designed error.

**Hard rule to encode in the system prompt:** the LLM must never invent execution steps, outputs, or intermediate states. It only transforms source text and labels variables.

## 7. Execution Engine (Web Worker + Pyodide)

- Worker loads Pyodide once, caches the instance, posts `ready`. UI shows "warming up the python engine" state (designed, on-brand copy) until ready.
- A Python **tracer harness** (a fixed string of Python embedded in the worker, written once) does the following:
  - Installs `sys.settrace` capturing `line` and `return` events for user code frames only (filter by filename of the exec'd code).
  - On each event, snapshots: current line number, function name, call-stack depth, call-stack frames (function name + line), and a serialized copy of local variables.
  - **Serialization rules:** ints/floats/strings/bools/None as-is; lists/tuples → arrays (recursively, depth-capped at 4); dicts → `{type:"dict", entries:[[k,v],…]}`; sets → `{type:"set", values:[…]}`; `ListNode` chains → `{type:"linkedlist", nodes:[{id,val}], cycleTo?: id}` (walk with visited-set, cap 50 nodes); `TreeNode` → `{type:"tree", nodes:[{id,val,left:id|null,right:id|null}], rootId}` (cap 63 nodes); anything else → `{type:"opaque", repr: str(x)[:40]}`. Node `id`s must be stable across steps (use Python `id()` mapped to sequential ints via a persistent registry) so renderers can animate identity.
  - **Step cap: 3000 events.** On breach, abort and return partial trace with `truncated: true`; UI shows a "trace truncated — try a smaller input" notice but still plays what exists.
  - **Wall-clock cap: 8 seconds** of execution; abort via a settrace step counter (settrace fires per line, so counting is reliable — do not rely on threads).
- Worker returns `{ steps, truncated, error? }`. Python exceptions are caught and returned with line number + message; the UI renders the error pointing at the offending line in the editor.

## 8. Trace Data Contract

`TraceStep` (TypeScript interface, define in `src/lib/trace/types.ts`):

- `i`: step index
- `line`: 1-based line in normalizedCode
- `event`: `"line" | "call" | "return"`
- `depth`: call-stack depth
- `callStack`: array of `{ fn, line }`
- `locals`: `Record<string, SerializedValue>` (the serialized forms from §7)
- `returned?`: SerializedValue when event is `return`

The playback engine derives **diffs between consecutive steps** (changed variables, moved pointers, added/removed nodes) at load time and stores them alongside steps, so renderers animate transitions rather than re-render from scratch.

## 9. Renderer System

A **renderer registry** maps `role`/serialized `type` to a renderer component. The visualization scene composes multiple renderers in a vertical stack (e.g., main array + hashmap + call stack). Every renderer is an SVG (or absolutely-positioned div grid) driven by Framer Motion with a shared motion language (§12).

Renderers to build (11 total). Each spec lists layout + required animations:

1. **ArrayRenderer** — row of cells (value + index below). Animations: cell highlight pulse on read, fill-color spring on write, swap = cells physically slide past each other (layout animation via stable keys), pointer labels (`i`, `j`, `l`, `r` chips) glide between indices with spring physics. Binds `mainArray`/`secondaryArray`; overlays for `pointer` roles.
2. **WindowOverlay** — a rounded translucent band spanning `[windowStart, windowEnd]` over the ArrayRenderer, animating width/position with springs. Used for Sliding Window.
3. **HashMapRenderer** — key→value pill rows; new entries drop in (y-spring + fade), value updates flip-pulse, lookups flash the matched row.
4. **StackRenderer** — vertical stack of plates; push = plate falls in from above with a squash-and-settle spring; pop = plate lifts and fades. Also used as the **call-stack panel** (always visible in a collapsible side rail for recursive code).
5. **LinkedListRenderer** — nodes as rounded boxes with arrow connectors; pointer chips (`prev`/`curr`/`next`) glide between nodes; a reversed link animates the arrow rotating to point the other way; detached nodes drift down and fade. Cycle rendered as a curved back-edge.
6. **TreeRenderer** — computed layout: standard tidy layout (in-order x positions, depth = y). Node visit = ring pulse; current node filled accent; insertion = node scales in from parent; path traversal draws the edge with a stroke-dashoffset animation. Used for Trees, Tries (n-ary variant: children array), Backtracking (decision tree grows as recursion proceeds — build tree from call events), and Heap (tree view **plus** the underlying array shown below via ArrayRenderer, both synced; sift-up/down = swap animation in both simultaneously).
7. **GraphRenderer** — precomputed static layout (circular layout for ≤10 nodes; simple force-ish grid otherwise — compute once at trace load, never per frame). Visited nodes fill in sequence; frontier/queue shown via StackRenderer or a queue strip; active edge animates stroke; Dijkstra-style distances render as small badges on nodes updating with flip-pulses. Covers Graphs + Advanced Graphs.
8. **GridRenderer** — 2-D matrix of cells for 2-D DP and Math & Geometry; cell write = value flips in with a scale spring + fill; dependency arrows (from `dp[i-1][j]` etc.) flash briefly on write when derivable from the diff (cells read in the same step as the write). Also used for island/matrix graph problems when input is a grid.
9. **DP1DRenderer** — ArrayRenderer variant with a "filled so far" progress tint and dependency arc arrows from source cells to the cell being written.
10. **IntervalRenderer** — horizontal number line; each interval a rounded bar on its own row; merge = two bars slide together and fuse into one; sorted order animates via layout animation.
11. **BitsRenderer** — value(s) as rows of 16 bit cells (0/1); a bit flip rotates the cell 180° (rotateX) with color change; shifts slide all cells laterally; AND/OR/XOR shows both operand rows and the result row computing left→right with a sweep highlight.

**Scene composition rule:** the engine inspects `meta.roles` + serialized types present in the trace, picks the primary renderer (by topic), and stacks secondary renderers (hashmap, stack, call stack) below/beside. Variables with role `other`/`counter`/`resultVar` render in a compact **variables strip** (name: value chips with flip-pulse on change) — always present.

## 10. Topic → Renderer Mapping (must all work)

| Topic | Primary | Secondary |
|---|---|---|
| Arrays & Hashing | Array | HashMap, vars |
| Two Pointers | Array + pointer chips | vars |
| Stack | Stack | Array (input), vars |
| Binary Search | Array + l/r/mid chips + discarded-region dimming | vars |
| Sliding Window | Array + WindowOverlay | HashMap, vars |
| Linked List | LinkedList | vars |
| Trees | Tree | call stack |
| Tries | Tree (n-ary) | HashMap |
| Heap/PQ | Tree + Array (synced) | vars |
| Backtracking | Tree (recursion tree, built from call/return events) | current-path strip, call stack |
| Graphs | Graph | queue/stack strip, visited set |
| Advanced Graphs | Graph + distance badges | Heap strip |
| 1-D DP | DP1D | vars |
| 2-D DP | Grid | vars |
| Intervals | Interval | vars |
| Greedy | Array or Interval (by input type) | vars |
| Bit Manipulation | Bits | vars |
| Math & Geometry | Grid (matrix) or vars strip (pure math) | vars |

## 11. Pages, Layout, Components

**Routes:**
- `/` — the app (single-page workspace).
- `/v?d=<lz>` — share link; decodes and auto-loads code+input, auto-runs visualization.
- `/tracker` — problem tracker.
- `/api/preprocess` — LLM route.

**Workspace layout (desktop):**
- Top bar: wordmark **TRACE** (display font, slight rotation, hard shadow), topic badge (auto-filled after preprocess), nav links (Visualizer / Tracker), Share button.
- Left panel (~42%): CodeMirror editor (dark, serious theme — this zone is "classy"); below it an **Input** field (editable, prefilled by examples), a **Visualize** button (big, chunky), and an **Examples** drawer: 18 topic groups × 2 examples; each example row shows name + difficulty chip; selecting loads code+input+intuition.
- Right panel (~58%): visualization stage (cream card, hard border, hard shadow) with the renderer scene; beneath it the **control deck**: play/pause, step back, step forward, speed selector (0.25/0.5/1/2/4), and a scrubbable timeline (drag = seek; timeline shows tick marks at call/return events). Current executing line simultaneously highlighted in the editor (accent left-border + tint) and auto-scrolled into view.
- Collapsible right rail: call stack (StackRenderer) + variables strip.
- An **Intuition** card (when an example is loaded): 2–4 sentence explanation of the pattern, written in the goofy brand voice.

**States to design (no browser-default anything):** Pyodide loading, preprocessing ("reading your code…"), Python error (message + line pointer), LLM/API error, trace truncated, empty editor, share-link copied toast.

**Keyboard:** space = play/pause, ←/→ = step, `[` `]` = speed down/up.

## 12. Design System

**Feel:** neobrutalist-playful, "goofy but classy." Loud typography and chunky UI chrome; the code editor and the data visualization itself stay restrained and legible. Fun lives in the frame, precision lives in the content.

- **Typography:** Display: `Archivo Black` (headings, wordmark, buttons — uppercase, tight tracking). Body/UI: `Space Grotesk`. Code: `JetBrains Mono`.
- **Palette (Tailwind tokens):** `paper: #FDF6E3` (app background), `ink: #111111` (borders/text), `accent: #4F46E5` (electric indigo — primary actions, active pointers), `pop: #F59E0B` (amber — highlights, writes), `go: #10B981` (green — success, visited, matched), `alarm: #EF4444` (errors, pops/removals), `editorBg: #16161D`. Renderer semantic colors: read = pop tint, write = accent fill, compare = outlined pulse, discard/dim = 30% opacity ink.
- **Chrome rules:** 2–3px solid `ink` borders on all cards/buttons/inputs; hard offset shadows (`4px 4px 0 ink`), radius 10–14px; buttons translate `+2px,+2px` and drop shadow to `2px 2px` on press; occasional −1° rotations on decorative elements only (never on the visualization stage). A thin marquee strip under the top bar cycling `PASTE ⚡ VISUALIZE ⚡ UNDERSTAND ⚡` in display font (CSS animation, subtle speed, pausable on hover).
- **Motion language (all Framer Motion):** springs `{stiffness 300, damping 24}` for movement; highlight pulses 240ms; nothing on the stage may animate longer than 450ms at 1× speed; **all durations divide by the speed multiplier**; step-mode transitions still animate (fast, 150ms). Respect `prefers-reduced-motion`: cut springs to fades.
- The visualization stage uses `paper` background with `ink` structures — maximum legibility; brand colors appear only as semantic state, never decoration, inside the stage.

## 13. Examples Library (36, hand-authored, no LLM at runtime)

Each example ships as a static TS object: `{ id, topic, name, difficulty, code, input, intuition, meta }` with `meta` hand-written (roles etc.), pre-verified to trace correctly. Required list (2 each):

Arrays & Hashing: Two Sum; Group Anagrams (frequency-key variant). Two Pointers: Valid Palindrome; Container With Most Water. Stack: Valid Parentheses; Daily Temperatures. Binary Search: classic search; Search Rotated Sorted Array. Sliding Window: Best Time to Buy/Sell Stock; Longest Substring Without Repeating. Linked List: Reverse Linked List; Merge Two Sorted Lists. Trees: BST Insert + Inorder Traversal; Max Depth (recursive). Tries: Insert+Search words; StartsWith prefix demo. Heap: Heapify+push/pop demo; Kth Largest via min-heap. Backtracking: Subsets; Permutations (n=3). Graphs: BFS on small graph; Number of Islands (grid). Advanced Graphs: Dijkstra (5 nodes); Topological Sort (Kahn's). 1-D DP: Climbing Stairs; House Robber. 2-D DP: Unique Paths; Longest Common Subsequence (short strings). Intervals: Merge Intervals; Insert Interval. Greedy: Jump Game; Maximum Subarray (Kadane). Bit Manipulation: Single Number (XOR); Counting Bits. Math & Geometry: Rotate Image (3×3); Pow(x,n) fast power.

Keep inputs tiny (traces of 30–200 steps) so playback is watchable. Intuition text: 2–4 sentences, brand voice, explains the *pattern* not the code.

## 14. Tracker (`/tracker`)

- localStorage key `trace.tracker.v1`, array of entries: `{ id, name, link?, topic, difficulty: easy|medium|hard, timeMinutes, intuition, notes, status: solved|revisit|stuck, createdAt }`.
- UI: chunky table/card list; add via modal form; inline edit; delete with one-step undo toast; filter by topic + status; summary strip on top (counts by difficulty, total time, solved this week). Export button → downloads JSON. All client-side, zero backend.

## 15. Share Links

- Share button → `lz-string.compressToEncodedURIComponent(JSON.stringify({ code, input, exampleId? }))` → `/v?d=…` → copy to clipboard with toast.
- `/v` decodes; if `exampleId` matches a built-in, load its verified meta (no API call); otherwise run the full preprocess pipeline. Malformed/oversized (>8KB compressed) payloads → designed error, offer blank workspace.

## 16. Error Handling Matrix (every row must exist)

| Failure | Behavior |
|---|---|
| Pyodide fails to load | Retry button + explanation, app otherwise usable (tracker still works) |
| LLM route timeout/error | "Couldn't read that code" card + retry; examples unaffected |
| LLM returns invalid JSON | One automatic corrective retry, then error card |
| Python raises | Error card with message + editor line highlight in `alarm` |
| Trace truncated | Banner, playback still available |
| Unsupported structure serialized as opaque | Renders in variables strip as repr chip — never crashes the scene |
| Empty code / no function call | Inline validation before any API call |

## 17. Performance Budgets

- Trace postprocessing (diffing) ≤ 150ms for 3000 steps (do it in the worker).
- Playback holds 60fps with ≤ 60 animated SVG elements; renderers must use stable keys + transforms only (no layout thrash); scrubbing seeks without animating intermediate steps (jump-render at target step).
- Pyodide loads lazily on first Visualize/example-load, not on page load; `/tracker` never loads Pyodide.

## 18. Build Order (vertical slices — each phase ends runnable + deployable)

**Phase 0 — Skeleton (30m):** Next.js + TS + Tailwind + tokens + fonts + top bar + routes + deploy to Vercel immediately. DoD: styled empty workspace live on Vercel.

**Phase 1 — Execution core (90m):** Worker + Pyodide + tracer harness + trace types + serialization + step cap. Hardcode Two Sum. DoD: console-logged correct trace for Two Sum in the browser.

**Phase 2 — Array slice end-to-end (2h):** ArrayRenderer + HashMapRenderer + variables strip + control deck + timeline + code-line sync + editor. Wire 6 array-family examples (Arrays&Hashing, Two Pointers, Stack via StackRenderer, Binary Search, Sliding Window + WindowOverlay). DoD: those examples play beautifully with all controls.

**Phase 3 — Structure renderers (2.5h):** LinkedList, Tree (+ heap sync view, trie variant, backtracking recursion tree), Graph, Grid, DP1D, Interval, Bits. Wire remaining 30 examples as each renderer lands. DoD: all 36 examples pass.

**Phase 4 — LLM pipeline (60m):** `/api/preprocess` + zod validation + retry + error states + arbitrary-code path. DoD: paste an unseen Two Sum variant and a BST insert → both visualize.

**Phase 5 — Share + Tracker + polish (60m):** share links, `/v`, tracker page, keyboard shortcuts, marquee, loading states, reduced-motion, mobile banner. DoD: full acceptance checklist below.

If time runs out, the cut order is: Bits polish → dependency arrows in DP → backtracking recursion-tree (fall back to call-stack panel only). Never cut controls, sync highlighting, or error states.

## 19. Environment & Deploy

- `GEMINI_API_KEY` in Vercel env (server-only). `/api/preprocess` must rate-limit naively (in-memory, 10 req/min/IP) and cap code size at 6KB.
- Repo: single Next.js app. `README.md` with one-paragraph description + env setup.

## 20. Acceptance Checklist (final gate)

- [ ] All 36 examples visualize correctly; spot-check swaps, window motion, tree layout, graph visit order against manual expectation
- [ ] Pasting arbitrary valid Python for ≥5 different patterns works via LLM path
- [ ] Play/pause/step±/speed/scrub all correct at every speed; scrub is instant
- [ ] Code line highlight always matches current step; auto-scrolls
- [ ] Share link round-trips on an incognito window
- [ ] Tracker CRUD + persistence + export
- [ ] Every error state in §16 reachable and designed
- [ ] Reduced motion respected; mobile shows banner, doesn't crash
- [ ] Deployed URL live, env key set, no key in client bundle