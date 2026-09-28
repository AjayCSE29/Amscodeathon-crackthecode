# AGENTS.md

Guidance for AI coding agents and contributors working in this repository.

## Commands

| Command           | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR (default port 5173)        |
| `npm run build`   | `tsc -b && vite build` — type-check then build      |
| `npm run lint`    | oxlint (configured in `.oxlintrc.json`)             |
| `npm run preview` | Serve the production build from `dist/`             |
| `npm run server`  | Local execution proxy on 0.0.0.0:8787 (`POST /api/run`) |
| `npm run start`   | Production server: serves `dist/` + `/api/*` on `PORT` |

**Always run `npm run lint` and `npm run build` before finishing a task.** The
build runs `tsc -b`, so type errors fail it.

There is no test framework. `npm run lint` and `npm run build` are the only
automated gates. Verify behavior manually using the checklist below.

## Environment

Development and production servers read these from the environment:

- `PORT` — backend port, default `8787`.
- `PISTON_URL` — self-hosted Piston API base URL (the server appends
  `/execute`), default `http://127.0.0.1:2000/api/v2`.
- `API_HOST` — Vite dev proxy target for `/api/*`, default `http://localhost:8787`.
- `ALLOWED_HOSTS` — comma-separated hostnames the Vite dev server accepts, e.g. a
  tunnel. Unset means allow any host (see the warning in `vite.config.ts`).
- Execution limits (defaults in `server/index.mjs`): `RUN_TIMEOUT_MS`,
  `QUEUE_TIMEOUT_MS`, `MAX_CONCURRENCY`, `RATE_LIMIT_PER_MIN`, `MAX_CODE_BYTES`,
  `MAX_STDIN_BYTES`, `BODY_LIMIT_BYTES`.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — server-only. Never prefix
  them with `VITE_`, or Vite will inline them into the client bundle.
  `AUTH_TOKEN_SECRET` optionally overrides the signing key used for the session
  token; it defaults to a SHA-256 derivation from the service-role key.
- Gemini grading (Round 1 auto-verdict, Round 2 judge) is server-only:
  `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-3.8-flash`),
  `GEMINI_TIMEOUT_MS` (15 s), `GEMINI_MAX_CONCURRENCY` (3),
  `GEMINI_QUOTA_BACKOFF_MS` (60 s, cap on the retry backoff), and `GEMINI_DISABLE`
  (set to `1` to fall back to deterministic Round 1 scoring). Never `VITE_`.
  Calls that return `408/429/5xx` retry with exponential backoff (global
  quota-gate) up to 5 attempts; exhausted retryable calls record
  `retry-later`, hard failures record `failed`.
- Admin dashboard is server-only: `ADMIN_USERNAME` and `ADMIN_PASSWORD`
  (scrypt-hashed at boot; both must be present and non-empty).
  `ADMIN_TOKEN_SECRET` optionally overrides the admin signing key; it defaults
  to a SHA-256 derivation from the participant token secret, so setting
  `AUTH_TOKEN_SECRET` above automatically separates admin signing too.
- Sync limits: `SYNC_BODY_LIMIT_BYTES` (4 MB), `LOGIN_RATE_LIMIT_PER_MIN` (10),
  `SYNC_RATE_LIMIT_PER_MIN` (6), `ROUND2_CONFIRM_RATE_LIMIT_PER_MIN` (60),
  `ROUND3_CONFIRM_RATE_LIMIT_PER_MIN` (60), `ADMIN_LOGIN_RATE_LIMIT_PER_MIN` (10),
  `ADMIN_RATE_LIMIT_PER_MIN` (30), `EVAL_RATE_LIMIT_PER_MIN` (5). Each route has
  its own bucket, separate from the `/api/run` limiter.

Put local overrides in `.env`. Both server scripts pass
`--env-file-if-exists=.env`, so the file is read automatically and its absence
is not an error.

## Hard constraints

These are product requirements, not preferences:

1. **Local execution proxy only.** The SPA may call the same-origin `/api/*`
   routes (e.g. `POST /api/run`) and `fetch` is allowed only for that. All
   server code lives in `server/`; it is the only permitted backend. Code
   execution must go through the self-hosted Piston instance (`PISTON_URL`) —
   never a third-party hosted execution API, and never directly from the
   browser (no Piston URLs in the frontend).
2. **Never reveal correctness.** Do not render the Round 1 answer key, `is_right`,
   `final_score`, `q_correct`, `score`, grades, or result/leaderboard/analytics
   UI. The participant must never learn whether an answer is right. The key
   lives only in `server/answerKey.mjs`. `POST /api/sync` and
   `POST /api/sync/round1` return `{ ok, accepted }` and deliberately omit every
   score; Round 2 verdicts (`is_right`, `final_score`) are written to the
   database and appear only behind `/api/admin/*`. The browser must never reach
   Supabase directly — only same-origin `/api/*`, and `anon` has zero grants on
   every table.
3. **Admin dashboard is server-only.** `/api/admin/*` requires the 4-part admin
   token (`subject.expires.admin.signature`, 12 h). It is served at `/admin`
   from `admin.html`, and every visible datum flows through `server/index.mjs`.
   Never put `ADMIN_USERNAME`/`ADMIN_PASSWORD` in client code, and never let a
   participant build call an admin route.
4. **Light mode only.** Do not add dark mode or theme switching.
5. **No code comments** unless explicitly requested.
6. **Minimize dependencies.** Prefer the standard library and existing code; do
   not add a package without a clear need. The Supabase client uses global
   `fetch` and SQL directly — no SDK. Gemini calls are plain `fetch` too.
7. **Proctoring is local-only.** It may log focus/visibility events to
   `localStorage`, but must never claim or perform server-side monitoring, and
   must degrade gracefully when camera/fullscreen permissions are denied.
8. **Never persist the password.** The plaintext password is used only for the
   login request and must never reach `localStorage`. `Candidate` holds
   `teamName`, `userId`, and a server-issued token.

## Architecture map

| Concern              | Location                                        |
| -------------------- | ----------------------------------------------- |
| App shell / routing  | `src/App.tsx` (status-based, no router)         |
| Session state machine| `src/hooks/useAssessment.ts`                    |
| Countdown / expiry   | `src/hooks/useAssessmentTimer.ts`               |
| Fullscreen proctoring| `src/hooks/useFullscreenGuard.ts`               |
| Mobile block         | `src/hooks/useIsMobile.ts` + `layout/MobileBlockScreen.tsx` |
| Persistence          | `src/lib/storage.ts` (the only `localStorage` access) |
| Code execution client| `src/lib/runClient.ts` → `POST /api/run`        |
| Backend server       | `server/index.mjs` (proxy, auth, sync, admin, Gemini wiring) |
| Gemini grading       | `server/evaluate.mjs` (Round 1 auto-verdict, Round 2 judge, queue + sweeper) |
| Login / result sync client | `src/lib/syncClient.ts` → `/api/auth/login`, `/api/sync`, `/api/sync/round1`, `/api/round2/confirm` |
| Auth + password hashing | `server/auth.mjs` (scrypt, `node:crypto`; participant + admin tokens) |
| Round 1 answer key   | `server/answerKey.mjs` (60-char string, server-only) |
| Scoring              | `server/scoring.mjs` (deterministic fallback; never returns a score to the client) |
| Database client      | `server/supabase.mjs` (REST via `fetch`, service role) |
| Database schema      | `supabase/001_schema.sql`, `002_grants.sql`, `003_verify.sql`, `004_admin_users.sql` |
| Roster CSV template  | `supabase/seed.example.csv` + `server/hash-password.mjs` |
| Admin dashboard      | `src/admin/*` + `admin.html` (server-only at `/admin`) |
| Round 1 questions    | `src/data/mockQuestions.ts`                     |
| Round 2 questions    | `src/data/debugQuestions.ts`                    |
| Round 3 questions    | `src/data/round3Questions.ts`                   |
| Code tokenizer       | `src/lib/codeHighlight.ts`                      |
| Domain types         | `src/types/assessment.ts`                       |
| Design tokens        | `src/index.css` (`@theme`)                      |
| Screens              | `src/pages/*`                                   |
| Components           | `src/components/{entry,assessment,debug,layout,submission,ui}` |

## Conventions

- **Components** are named exports (e.g. `export function QuestionCard(...)`).
  `App` is the only default export.
- **Imports** are extensionless (e.g. `from "../lib/utils"`). Exception:
  `src/main.tsx` imports `./App.tsx` with the extension.
- **Type-only imports** must use `import type { ... }` (`verbatimModuleSyntax`).
- **No TS enums, namespaces, or parameter properties** — `erasableSyntaxOnly` is
  enabled. Use union types and `as const` maps.
- **Unused locals/params fail the build** (`noUnusedLocals`, `noUnusedParameters`).
- **Styling** uses Tailwind v4 utilities backed by `@theme` tokens in
  `src/index.css`. Add new colors/spacing there, not as arbitrary hex values.
  Custom text styles use the `font-*` utilities (`font-body-md`, `font-label-sm`,
  `font-code-body`, ...). Conditional classes go through `cn()`.
- **Icons** use the `Icon` component (`src/components/ui/Icon.tsx`), which wraps
  Material Symbols. **The bundled font is a 33-icon subset**, not the full set:
  `grid_view`, `check_circle`, `info`, `error`, `radio_button_checked`, `timer`,
  `refresh`, `lock_reset`, `restart_alt`, `warning`, `report`, `content_copy`,
  `terminal`, `badge`, `lock`, `bookmark`, `bookmark_added`, `code`,
  `arrow_back`, `arrow_forward`, `check`, `done`, `close`, `pin`, `lightbulb`,
  `account_balance`, `memory`, `bug_report`, `verified`, `videocam`,
  `play_arrow`, `arrow_drop_down`, `person`. A name outside that list renders as
  **literal text**, not a tofu box, and nothing — not `tsc`, not oxlint, not the
  build — will complain. Check the list before adding an icon; if the glyph is
  genuinely needed, either draw it as an inline SVG component beside `Icon` (see
  `src/components/ui/EyeOffIcon.tsx`) or regenerate the font subset.
- **Persistence** always goes through the `storage` object. Mutate session state
  only via `useAssessment` actions, and make sure each action calls `commit()` so
  state is persisted.

## Verification checklist

After changes, manually confirm:

1. Entry form blocks submission until team name and password are both filled.
2. Starting the assessment shows the timer and first question, and requests
   fullscreen.
3. Selecting, clearing, marking for review, and navigating update the palette.
4. Reloading mid-assessment restores answers, current question, and the countdown.
5. Submitting opens the confirmation modal, then the round 1 interstitial, then
   Round 2 loads with its own 60-minute timer.
6. In Round 2: switching language preserves each language's draft; `Run` returns
   stdout/stderr from Piston; `Reset` restores the starter for the current
   language only; `Ctrl`/`Cmd`+`Enter` also runs.
7. Reloading mid-Round-2 restores code drafts, current problem, and the countdown.
8. After Round 2 submission: interstitial confirms, "Start Round 3" enters the
   Round 3 (Leetcode) stage with its own 60-minute timer; Round 3 mirrors the
   Round 2 editors (`Run`/`Reset`/`Ctrl+Enter`, per-language drafts).
9. Reloading mid-Round-3 restores code drafts, current problem, and the countdown;
   reloading on the Round 3 submission screen stays locked.
10. Round 3 "Confirm" auto-grades: after a few seconds `/api/admin/round3` shows
    `is_right` for the confirmed problem, and `final_score` is 25 (clean),
    20 (hint used), or 0 (wrong).
11. Leaving fullscreen, hiding the tab, or blurring the window starts the 10-second
    warning; returning in time disarms it, and letting it lapse resets to entry.
12. Keyboard shortcuts (`1`–`4`, `←`/`→`, `M`, `Esc`) work in Round 1 and are
    ignored while typing in inputs.
13. A coarse-pointer device gets `MobileBlockScreen` instead of a broken layout.
14. Layout holds up on desktop and tablet widths.
15. `/admin` requires `ADMIN_USERNAME`/`ADMIN_PASSWORD` in `.env`; a wrong
    password gets `401`, a correct one returns a token.
16. Round 1 submit is graded server-side: expect `{ accepted: { round1: N } }`
    from `/api/sync/round1` and a matching per-question breakdown under
    `/api/admin/round1`. Re-syncing the same team is a no-op.
17. `/api/admin/export` returns a CSV starting with `user_id`.
18. The participant bundle (`dist/`) must never contain `/api/admin`,
    `final_score`, `is_right`, `q_correct`, `GEMINI`, or `AMSCODE`. Grep
    `dist/assets/` after any build.

## Gotchas

- Navigation actions must persist: if you touch `next`/`previous`/`navigate`,
  ensure they call `commit(next)`.
- The timer is anchored to absolute `expiresAt` / `round2ExpiresAt` timestamps —
  never a decrementing counter — so refreshes cannot reset it. Each page passes
  `null` for the round it is not running, which parks the timer.
- `finalizeExpired` is overloaded: from `active` it **advances to Round 2**, from
  `round2` it **advances to Round 3**, from `round3` it submits. Do not "fix"
  this to a plain submit without checking the product intent.
- `codeEdits` keys are `<questionId>:<language>`. Any new code that counts or
  clears drafts must split on `:` rather than treating the key as a question id.
- Round 1 actions are gated on `status === "active"` and Round 2 actions on
  `status === "round2"`. Preserve that gating when adding actions.
- Tailwind class names that do not correspond to a real `@theme` token silently do
  nothing. Check `src/index.css` when adding tokens.
- Raw Node/tsx cannot resolve the project's extensionless imports; use Vite to run
  or bundle code.
- `server/index.mjs` is plain Node outside the `tsc -b` projects; run it directly
  and keep it dependency-free. Upstream execution failures still return HTTP 200
  with the message in `stderr`, so the terminal always has something to render.
- `localStorage` access is guarded for SSR-safety in `storage.ts`; keep it that way.
- Round 1 finish time is captured into `session.round1FinishSeconds` at the moment
  Round 1 is submitted, because `submittedAt` is overwritten when Round 2 ends and
  the timer is already parked. Round 1 expiry records `0`. Round 3 mirrors this:
  `round2FinishSeconds` is snapshotted when Round 2 is submitted (and set to `0`
  when Round 2 expires) so the final sync can report it; `round3FinishSeconds` is
  snapshotted when Round 3 is submitted or expires (`0`). Do not compute these
  from `expiresAt`/`round3ExpiresAt` at sync time — the timers are parked.
- The result sync fires from a `useEffect` keyed on `session.sessionId` and only
  when `status === "submitted"`, so it covers the manual path, the timeout path,
  and a reload on the final screen without double-firing. It is fire-and-forget:
  `localStorage` stays the source of truth, so a failed sync must never block the
  final screen or throw into the UI.
- `isSessionLike` in `storage.ts` requires `candidate.userId` and
  `candidate.token`. A session that fails it is treated as corrupt and
  `clearSession()` runs — that is what scrubs the plaintext password that older
  builds persisted. Do not relax that check without reintroducing the leak.
- `vite.config.ts` is the only Vite config and the only one `tsc` checks. Do not
  add a sibling `vite.config.js` — Vite resolves `.js` first and it would shadow
  the type-checked file.
- The countdown is rendered by `AppHeader` via the `timeLabel` / `timerTier`
  props. There is deliberately no standalone timer component — do not add one
  without wiring it into `AppHeader`.
- Proctoring is `useFullscreenGuard` only. The old event log, camera probe,
  consent panel, and system check were removed as dead code; if you need an
  entry-stage consent or camera check, build it into `EntryPage` rather than
  resurrecting the removed modules.
- When adding a debug problem to `src/data/debugQuestions.ts`, Java must use
  `public class Main` (the proxy writes `Main.java`) **listed as the first
  top-level class** — the self-hosted Piston Java image runs the *first* class
  in the file as the entry point, so a helper `class Student` before `Main`
  breaks every Java `Run` with "can't find main(String[]) method". And the
  starter's output must actually differ from its `sampleCases` entry or the
  exercise is empty. Verify by running both the starter and a fixed version
  through `POST /api/run` rather than by reading. See "Authoring a debug
  problem" in [`ARCHITECTURE.md`](ARCHITECTURE.md).
- Round 3 starters in `src/data/round3Questions.ts` ship **exactly the LeetCode
  template only** — an empty `class Solution` method with no `main`, per product
  requirement (the editor must look like LeetCode, not the debug round). The
  stdin→stdout harness lives in a hidden per-language `driver` and is merged in
  at Run/Confirm time by `composedProgram()` (see `DebugPage.tsx`); the editor,
  `Reset`, and persisted drafts stay template-only, while the executed/captured
  code includes the driver. C++/Python append the driver **after** the template
  (includes are in `driver.before` so the template compiles); Java emits
  `driver.before` **first** because the self-hosted Piston Java image runs the
  **first** top-level class in `Main.java` — `public class Main` (the harness
  holding `main`) must precede `class Solution`. Keep that first-class ordering
  in `debugQuestions.ts` Java starters too. The template's empty method means a
  `Run` on the untouched template fails to compile/emit nothing (authentic
  LeetCode behavior); the samples are the driver's stdin→stdout contract, so a
  Round 3 fix is not an empty exercise. Group-anagram comparisons rely on
  canonical group ordering (groups and members sorted) rather than hash order.
- `/api/sync/round1` is idempotent: a team with an existing `round1_results` row
  is skipped and returns `accepted: { round1: 0 }`. `ingestRound1` always writes
  the deterministic `scoring.mjs` result plus a `round1_crosschecks` audit row
  (`status` `ok`/`failed`/`gemini-disabled`) so an admin can see both grades.
- `/api/round2/confirm` resets `is_right` to `null` (re-enqueuing Gemini) only
  when the confirmed content actually changed; `final_score` (5/3/0) is a
  database generated column. Verdicts land in `round2_submissions` and never in
  any participant-facing response.
- `/api/round3/confirm` mirrors `/api/round2/confirm` for
  `round3_submissions`, where the generated `final_score` is 25 (clean),
  20 (hint used), or 0 (wrong). Round 3 submissions are keyed on `q_no`
  (1–4) mapping to `src/data/round3Questions.ts`; verdicts live only under
  `/api/admin/round3`.
- Round 2/3 statuses interleave: `round2` → (submit or expire) →
  `round2-submitted` → `proceedToRound3` → `round3` → (submit or expire) →
  `submitted`. `codeEdits`/`debugSubmissions`/`hintReveals` are keyed by
  question id so Round 2 (`q2-*`) and Round 3 (`r3-*`) drafts never collide.
- The default Gemini model is `gemini-3.8-flash`; the retired `gemini-2.5-*`
  snapshots return HTTP 404 for new (`AQ.A`-prefix) keys. Change
  `GEMINI_MODEL`, choose `GEMINI_DISABLE=1`, or rely on the deterministic
  fallback rather than pinning an old snapshot.
- The sync bucket (`SYNC_RATE_LIMIT_PER_MIN`, 6/min) is shared by
  `/api/sync`, `/api/sync/round1`, and the Round 1 branch of the final sync, so
  back-to-back curl tests against the same IP can legitimately get `429
  Too many syncs`. Space manual re-tests out.
