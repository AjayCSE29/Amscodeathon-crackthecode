# Codeathon — Competitive Assessment Workstation

A single-page exam workstation for a two-round competitive assessment: a
proctored MCQ round followed by a live code-debugging round with real program
execution. Built with React, TypeScript, Vite, and Tailwind CSS v4.

> **Status: UI prototype with a local execution proxy.** There is no database,
> authentication service, scoring engine, result screen, leaderboard, or answer
> review. Assessment state lives in the browser. The only backend is
> `server/index.mjs`, a dependency-free proxy that forwards code execution to a
> self-hosted [Piston](https://github.com/engineer-man/piston) instance.

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
| Build      | Vite 8 (`@vitejs/plugin-react`)                               |
| Styling    | Tailwind CSS v4 (CSS-first `@theme` tokens)                   |
| Lint       | oxlint                                                        |
| Fonts      | Plus Jakarta Sans (UI), JetBrains Mono (technical), Material Symbols |
| State      | React hooks + `localStorage` (no router, no state library)    |
| Execution  | Node `http` proxy → self-hosted Piston                        |

Runtime dependencies are `react` and `react-dom` only. The server has none.

## Getting started

Requires Node 20+ (developed on Node 24) and a reachable Piston instance.

```bash
npm install
npm run build     # the production server serves dist/
npm run server    # proxy + static server on 0.0.0.0:8787
```

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
server/
  index.mjs                Execution proxy + static server (no dependencies)
design/                    Reference prototypes and DESIGN.md
public/                    favicon.svg
```

## Mock data

`src/data/mockQuestions.ts` provides the 60 Round 1 MCQs. 24 of them attach a
code snippet (11 C++17, 13 pseudocode) rendered by the built-in tokenizer. Each
question carries a `correctOptionId`, but it is **never rendered** — it is
reserved for a future backend integration.

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

All state is stored under these `localStorage` keys:

| Key                        | Contents                                  |
| -------------------------- | ----------------------------------------- |
| `codeathon_session`        | Candidate, both deadlines, status, indices |
| `codeathon_answers`        | Selected option per question              |
| `codeathon_flags`          | Marked-for-review flags                   |
| `codeathon_visited`        | Visited questions                         |
| `codeathon_code_edits`     | Round 2 drafts, keyed `<questionId>:<language>` |

Both countdowns are anchored to absolute `expiresAt` / `round2ExpiresAt`
timestamps. To clear a session and start over, run `localStorage.clear()` in the
browser console (or remove the keys above) and reload.

## The execution proxy

`server/index.mjs` is a plain Node script with no dependencies. It exposes:

| Route                | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| `POST /api/run`      | Execute code in Piston; returns stdout/stderr/exitCode |
| `GET /api/health`    | Liveness check, echoes the configured Piston URL   |
| `GET /*`             | Serves `dist/`, falling back to `index.html`       |

`POST /api/run` accepts `{ language, code, stdin }` where `language` is one of
`C++`, `Python`, `Java`. It maps the language to a Piston runtime and filename
(`c++`/`solution.cpp`, `python`/`solution.py`, `java`/`Main.java`), pins the
runtime version to `*`, and normalizes the response. Compile failures are folded
into `stderr`. Job paths are scrubbed from output before it reaches the browser.

The proxy is the only backend, and the browser never contacts Piston directly.

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

## Design system

The visual language is documented in [`design/DESIGN.md`](design/DESIGN.md).
Implementation tokens (colors, typography, spacing, radii) live in
[`src/index.css`](src/index.css) as Tailwind v4 `@theme` variables, with custom
`font-*` utilities mapping to Plus Jakarta Sans and JetBrains Mono. Light mode
only.

## Non-goals

- No database, external API, or real-time monitoring.
- No scoring, grading, results, leaderboard, or analytics.
- No question review or answer reveal for the participant.
- No authentication beyond the team access password entered at entry.
- No dark mode or theme switching.
- No mobile support — coarse-pointer devices are blocked intentionally.

## Further reading

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the app flow, state machine, data
model, and extension points. Contributors and coding agents should also read
[`AGENTS.md`](AGENTS.md).
