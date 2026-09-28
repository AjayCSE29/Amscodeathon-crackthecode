# Codeathon — Competitive Assessment Workstation

A single-page exam workstation for a two-round competitive assessment: a
proctored MCQ round followed by a live code-debugging round with real program
execution. Built with React, TypeScript, Vite, and Tailwind CSS v4.

> **Status: live-event build.** Login authenticates against a Supabase roster
> (`server/supabase.mjs`, service-role key, zero grants to clients); Round 1 is
> scored server-side at submit time (Gemini verdict with a deterministic
> fallback, both kept for an admin audit trail); Round 2 is graded per confirm by
> a Gemini queue. Scores and verdicts live only in the database and the
> server-only admin dashboard at `/admin` — the participant bundle never sees
> them. Assessment state synced from `localStorage` remains the source of truth.

## Features

### Admin dashboard

- **Server-only** — `/admin` serves `admin.html`; every datum flows through
  `/api/admin/*`, which requires a 4-part HMAC token issued after an
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` login (scrypt, server-side).
- **Overview** — team counts, both rounds' progress, and leaderboards.
- **Teams** — create, rename, password-reset, and delete roster entries.
- **Round 1** — per-question answer grid with deterministic + Gemini grades.
- **Round 2** — every confirmed submission with its auto-generated `is_right`
  verdict and 5/3/0 score.
- **Export** — one-click CSV of all rows.

## Features

### Round 1 — MCQ

- **Team entry** — validated team name and access password; requests fullscreen
  on continue.
- **Timed assessment** — 60 mock MCQs with a 45-minute countdown.
- **Question palette** — matrix with answered / marked / current / visited states.
- **Answering tools** — select an option, clear a response, mark for review, and
  navigate freely between questions.
- **Keyboard shortcuts** — `1`–`4` select an option, `←`/`→` navigate, `M` marks
  for review, `Esc` closes the submit dialog.
- **Submit confirmation** — a modal summarizing answered / marked / remaining counts.

### Round 2 — Debug

- **20 debugging problems** in C++, Python, and Java, with a 60-minute
  countdown and per-language starter code, sample test cases, and bug hints.
- **In-browser editor** — edit the starter code, switch language, or reset a
  problem back to its original starter.
- **Real execution** — `Run` sends the code to a self-hosted Piston instance via
  the local proxy and streams `stdout` / `stderr` / exit code into a terminal
  view. `Ctrl`/`Cmd` + `Enter` also runs.
- **Per-language draft persistence** — edits are stored per problem *and* per
  language, so switching back and forth preserves work.

### Proctoring and platform

- **Fullscreen guard** — leaving fullscreen, hiding the tab, or blurring the
  window starts a 10-second countdown. Regaining focus in time disarms it;
  failing it terminates the session and returns to the entry screen.
- **Desktop-only** — coarse-pointer devices get a blocking screen rather than a
  broken layout.
- **Refresh-safe** — the session, both deadlines, answers, flags, visited state,
  and code drafts are persisted to `localStorage`. Deadlines are absolute
  timestamps, so a reload cannot buy extra time.
- **Locked completion** — the final screen confirms receipt. No results shown.

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| UI         | React 19                                                      |
| Language   | TypeScript ~6 (`erasableSyntaxOnly`, `verbatimModuleSyntax`)  |
| Build      | Vite 8 (`@vitejs/plugin-react`), dual MPA entries             |
| Styling    | Tailwind CSS v4 (CSS-first `@theme` tokens)                   |
| Lint       | oxlint                                                        |
| Fonts      | Plus Jakarta Sans (UI), JetBrains Mono (technical), Material Symbols |
| State      | React hooks + `localStorage` (no router, no state library)    |
| Execution  | Node `http` proxy → self-hosted Piston                        |
| Database   | Supabase Postgres (REST via `fetch`, service-role key)        |
| Auth       | `node:crypto` scrypt + HMAC-signed stateless tokens           |
| Grading    | Gemini `generateContent` (Round 1 + Round 2), deterministic fallback |

Runtime dependencies are `react` and `react-dom` only. The server has none.

## Getting started

Requires Node 20+ (developed on Node 24), a reachable Piston instance, a
Supabase project (`supabase/001_schema.sql` … `004_admin_users.sql` applied),
and `GEMINI_API_KEY` for grading (optional — `GEMINI_DISABLE=1` falls back to
deterministic Round 1 scoring).

```bash
npm install
cp .env.example .env         # fill in SUPABASE_*, GEMINI_API_KEY, ADMIN_*
npm run build                # the production server serves dist/
npm run server               # proxy + static server on 0.0.0.0:8787
```

Roster teams land in `supabase/users` (see `supabase/seed.example.csv` and
`server/hash-password.mjs` to mint scrypt hashes).

For UI work with HMR, run the API and Vite side by side:

```bash
npm run server    # terminal 1
npm run dev       # terminal 2 — proxies /api to :8787
```

Piston defaults to `http://127.0.0.1:2000/api/v2`. To point elsewhere, set
`PISTON_URL` in `.env` (see [Configuration](#configuration)). Runtimes must be
installed in Piston; check with `GET /api/health` on this server, or via
`cli/index.js ppman list` in a Piston checkout.

### Scripts

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR, proxying `/api` to `:8787` |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/`        |
| `npm run lint`    | Run oxlint                                        |
| `npm run preview` | Serve the production build with Vite              |
| `npm run server`  | Local execution proxy + static server on `:8787`  |
| `npm run start`   | Alias of `npm run server` (production entrypoint) |

## Project structure

```text
src/
  main.tsx                 App entry (StrictMode + createRoot)
  App.tsx                  Status-based router + fullscreen guard wiring
  index.css                Tailwind v4 @theme tokens + font utilities
  components/
    entry/                 CandidateForm
    assessment/            QuestionCard, AnswerOption, CodeBlock,
                           QuestionMetadata, QuestionNavigator,
                           AssessmentControls, SubmitModal
    debug/                 ProblemPanel, CodeEditor, LanguageToggle,
                           DebugControls, OutputTerminal, DebugSubmitModal
    layout/                AppHeader, AssessmentLayout, FullscreenWarning,
                           MobileBlockScreen, TimeOverScreen
    submission/            SubmissionConfirmation
    ui/                    Icon (Material Symbols wrapper)
  data/
    mockQuestions.ts       60 MCQs, round 1 duration
    debugQuestions.ts      20 debug problems, round 2 duration
  hooks/
    useAssessment.ts       Central session store and actions
    useAssessmentTimer.ts  Countdown, tiers, expiry
    useFullscreenGuard.ts  Fullscreen/focus breach countdown
    useIsMobile.ts         Coarse-pointer detection
  lib/
    storage.ts             localStorage abstraction
    runClient.ts           POST /api/run client
    codeHighlight.ts       Lightweight code tokenizer
    fullscreen.ts          Fullscreen request/state helpers
    richText.tsx           Inline-code renderer
    utils.ts               cn(), time formatting, id helpers
  pages/
    EntryPage.tsx
    AssessmentPage.tsx
    DebugPage.tsx
    SubmissionPage.tsx
  types/
    assessment.ts          Shared domain types
  admin/                   Server-only admin React app
    AdminApp.tsx, api.ts, useAdminData.ts, pages/, tabs/, ...
server/
  index.mjs                Proxy + auth + sync + admin routes (no deps)
  auth.mjs                 scrypt passwords, participant/admin tokens
  supabase.mjs             REST client to Supabase
  evaluate.mjs             Gemini grader + Round 2 queue
  answerKey.mjs            Round 1 key (server-only)
  scoring.mjs              Deterministic Round 1 fallback
  hash-password.mjs        Roster password minting
supabase/                  001_schema.sql … 004_admin_users.sql
admin.html                 Admin entry point (served at /admin)
design/                    Reference prototypes and DESIGN.md
public/                    favicon.svg
```

## Mock data

`src/data/mockQuestions.ts` provides the 60 Round 1 MCQs. 24 of them attach a
code snippet (11 C++17, 13 pseudocode) rendered by the built-in tokenizer. The
answer key is **not** in this file: it lives in `server/answerKey.mjs` as a
single 60-character string, is read only by the server when it scores a sync,
and never reaches the client bundle.

`src/data/debugQuestions.ts` provides the 20 Round 2 problems: 6 Easy, 4 Medium,
and 10 Hard. Questions 1–12 are single-concept C++ OOP themes (construction,
access control, statics, destructors, inheritance, overriding, object slicing,
shallow copy, cleanup order, diamond inheritance). Questions 13–20 are
multi-bug, multi-language problems that each layer three or more faults and
require a full trace-through: static initialization order with exception
handling, generic per-type state and FIFO eviction, closure capture and iterator
exhaustion, operator overloading, resource cleanup on the failure path,
construction-time virtual dispatch, index invalidation on removal, and bit-flag
permissions.

Each question ships a starter per language, an expected output, and a per-language
hint. Problems whose output is genuinely language-specific carry their own
`sampleCases` per language; the rest share one expected output across all three.

## Data & persistence

All client state is stored under these `localStorage` keys:

| Key                        | Contents                                  |
| -------------------------- | ----------------------------------------- |
| `codeathon_session`        | Candidate, both deadlines, status, indices, `round1Synced` |
| `codeathon_answers`        | Selected option per question              |
| `codeathon_flags`          | Marked-for-review flags                   |
| `codeathon_visited`        | Visited questions                         |
| `codeathon_code_edits`     | Round 2 drafts, keyed `<questionId>:<language>` |

Both countdowns are anchored to absolute `expiresAt` / `round2ExpiresAt`
timestamps. To clear a session and start over, run `localStorage.clear()` in the
browser console (or remove the keys above) and reload.

Results also live server-side in Supabase: Round 1 answers are pushed at the
round-1 interstitial (and again on the final sync if the first attempt failed),
and each Round 2 problem is pushed when the participant confirms it. The admin
panel reads these rows; the participant bundle never receives grades.

## The server

`server/index.mjs` is a plain Node script with no dependencies. It exposes:

| Route                   | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `POST /api/auth/login`  | Authenticate team against the roster; issue a 12 h HMAC token |
| `POST /api/run`         | Execute code in Piston; returns stdout/stderr/exitCode |
| `POST /api/sync`        | Final sync (Round 1 answers + all confirmed Round 2 submissions) |
| `POST /api/sync/round1` | Round 1 sync; idempotent, returns `{ round1 }` |
| `POST /api/round2/confirm` | Confirm a Round 2 submission; enqueues Gemini grading |
| `POST /api/admin/login` | Admin login → 4-part admin token                |
| `/api/admin/*`          | Roster, overview, Round 1/2 results, re-grade, CSV export |
| `GET /api/health`       | Liveness + Piston/Supabase/admin/Gemini status |
| `GET /admin`            | Serves `admin.html`                            |

Every sync route returns `{ ok, accepted }` and deliberately omits scores.
Round 1 is graded by Gemini with a deterministic fallback (both recorded in
`round1_crosschecks`); Round 2 verdicts are produced by a Gemini queue and
visible only under `/api/admin/round2`.

### Configuration

All variables are read by `server/index.mjs` (and `vite.config.ts` for the dev
proxy). Put local overrides in `.env`.

| Variable              | Default                            | Used by            |
| --------------------- | ---------------------------------- | ------------------ |
| `PORT`                | `8787`                             | server             |
| `PISTON_URL`          | `http://127.0.0.1:2000/api/v2`     | server             |
| `API_HOST`            | `http://localhost:8787`            | Vite dev proxy     |
| `ALLOWED_HOSTS`       | _unset_ (allow any host)           | Vite dev server    |
| `RUN_TIMEOUT_MS`      | `10000`                            | server             |
| `QUEUE_TIMEOUT_MS`    | `30000`                            | server             |
| `MAX_CONCURRENCY`     | `8`                                | server             |
| `RATE_LIMIT_PER_MIN`  | `30`                               | server             |
| `MAX_CODE_BYTES`      | `65536`                            | server             |
| `MAX_STDIN_BYTES`     | `16384`                            | server             |
| `BODY_LIMIT_BYTES`    | `196608`                           | server             |
| `SYNC_BODY_LIMIT_BYTES` | `4194304`                        | server             |
| `LOGIN_RATE_LIMIT_PER_MIN` | `10`                           | server             |
| `SYNC_RATE_LIMIT_PER_MIN` | `6`                             | server             |
| `ROUND2_CONFIRM_RATE_LIMIT_PER_MIN` | `60`         | server             |
| `ADMIN_LOGIN_RATE_LIMIT_PER_MIN` | `10`           | server             |
| `ADMIN_RATE_LIMIT_PER_MIN` | `30`                           | server             |
| `EVAL_RATE_LIMIT_PER_MIN` | `5`                             | server             |
| `SUPABASE_URL`        | —                                  | server (required)  |
| `SUPABASE_SERVICE_ROLE_KEY` | —                            | server (required)  |
| `AUTH_TOKEN_SECRET`    | derived from service-role key      | server             |
| `GEMINI_API_KEY`       | —                                  | server             |
| `GEMINI_MODEL`         | `gemini-3.8-flash`                 | server             |
| `GEMINI_TIMEOUT_MS`    | `15000`                            | server             |
| `GEMINI_MAX_CONCURRENCY` | `3`                              | server             |
| `GEMINI_DISABLE`       | `0` (set `1` to disable)           | server             |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | —              | server (required)  |
| `ADMIN_TOKEN_SECRET`   | derived from the token secret      | server             |

Supabase, Gemini, and admin credentials are **server-only**. Never prefix
`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or `ADMIN_PASSWORD` with
`VITE_` — Vite would inline them into the client bundle.

## Design system

The visual language is documented in [`design/DESIGN.md`](design/DESIGN.md).
Implementation tokens (colors, typography, spacing, radii) live in
[`src/index.css`](src/index.css) as Tailwind v4 `@theme` variables, with custom
`font-*` utilities mapping to Plus Jakarta Sans and JetBrains Mono. Light mode
only.

## Non-goals

- Server-side proctoring — the fullscreen guard is local-only.
- Participant-facing scoring, results, leaderboards, or answer review: grades
  and verdicts exist only in the database and the server-only admin panel.
- No question review or answer reveal for the participant.
- No per-user accounts beyond the roster gate (HMAC token + team password).
- No dark mode or theme switching.
- No mobile support — coarse-pointer devices are blocked intentionally.

## Further reading

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the app flow, state machine, data
model, and extension points. Contributors and coding agents should also read
[`AGENTS.md`](AGENTS.md).
