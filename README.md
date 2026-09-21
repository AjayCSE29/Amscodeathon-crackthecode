# Codeathon — Competitive MCQ Examination Workstation

A frontend-only, single-page exam workstation that simulates a timed competitive MCQ
assessment: candidate entry, a proctored assessment canvas, and a submission
confirmation. Built with React, TypeScript, Vite, and Tailwind CSS v4.

> **Status: UI prototype.** This build is intentionally frontend-only. There is no
> backend, database, network request, scoring engine, result screen, leaderboard,
> or answer review. All assessment state lives in the browser.

## Features

- **Candidate entry** — validated form (name, institution, registration ID,
  department), conditions consent, and a frontend-only system/camera check.
- **Timed assessment** — 30 mock MCQs across 6 categories with a 45-minute countdown.
- **Question palette** — 5-column matrix with answered / marked / current / visited states.
- **Answering tools** — select an option, clear a response, mark for review, and
  navigate freely between questions.
- **Keyboard shortcuts** — `1`–`4` select an option, `←`/`→` navigate, `M` marks
  for review, `Esc` closes the submit dialog.
- **Submit confirmation** — a modal summarizing answered / marked / remaining counts.
- **Submission confirmation** — a locked completion screen; no results are shown.
- **Refresh-safe** — the session, timer deadline, answers, flags, and visited state
  are persisted to `localStorage`.
- **Local-only proctoring** — tab visibility / window focus events are logged
  locally and never transmitted.

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

## Getting started

Requires Node 20+ (developed on Node 24).

```bash
npm install
npm run dev
```

Open the printed local URL (default <http://localhost:5173>).

### Scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR             |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/`     |
| `npm run lint`    | Run oxlint                                     |
| `npm run preview` | Serve the production build locally             |

## Project structure

```text
src/
  main.tsx                 App entry (StrictMode + createRoot)
  App.tsx                  Status-based router (entry / active / submitted)
  index.css                Tailwind v4 @theme tokens + font utilities
  components/
    entry/                 CandidateForm, ConsentPanel, SystemCheck
    assessment/            QuestionCard, AnswerOption, CodeBlock,
                           QuestionMetadata, QuestionNavigator,
                           AssessmentControls, AssessmentTimer, SubmitModal
    layout/                AppHeader, AssessmentLayout
    submission/            SubmissionConfirmation
    ui/                    Icon (Material Symbols wrapper)
  data/
    mockQuestions.ts       30 mock MCQs + duration + department options
  hooks/
    useAssessment.ts       Central session store and actions
    useAssessmentTimer.ts   Countdown, tiers, expiry
    useProctoring.ts       Local-only focus/visibility event log
  lib/
    storage.ts             localStorage abstraction
    codeHighlight.ts       Lightweight code tokenizer
    richText.tsx           Inline-code renderer
    utils.ts               cn(), time formatting, id helpers
  pages/
    EntryPage.tsx
    AssessmentPage.tsx
    SubmissionPage.tsx
  types/
    assessment.ts          Shared domain types
design/                    Reference prototypes and DESIGN.md
public/                    favicon.svg
```

## Mock data

`src/data/mockQuestions.ts` provides 30 questions (5 each) across:

- Data Structures
- Algorithms
- Programming
- Computer Networks
- Database Systems
- Operating Systems

Five questions include code snippets rendered with a small built-in tokenizer.
Each question carries a `correctOptionId`, but it is **never rendered** — it is
reserved for a future backend integration.

## Data & persistence

All state is stored under these `localStorage` keys:

| Key                       | Contents                                  |
| ------------------------- | ----------------------------------------- |
| `codeathon_session`       | Candidate, timing, status, current index  |
| `codeathon_answers`       | Selected option per question              |
| `codeathon_flags`         | Marked-for-review flags                   |
| `codeathon_visited`       | Visited questions                         |
| `codeathon_proctor_events`| Local focus/visibility event log          |

The countdown is anchored to an absolute `expiresAt` timestamp, so reloading the
page cannot reset the clock. To clear a session and start over, run
`localStorage.clear()` in the browser console (or remove the keys above) and
reload.

## Design system

The visual language is documented in [`design/DESIGN.md`](design/DESIGN.md).
Implementation tokens (colors, typography, spacing, radii) live in
[`src/index.css`](src/index.css) as Tailwind v4 `@theme` variables, with custom
`font-*` utilities mapping to Plus Jakarta Sans and JetBrains Mono. Light mode
only.

## Non-goals

- No backend, API, database, or real-time monitoring.
- No scoring, grading, results, leaderboard, or analytics.
- No question review or answer reveal for the participant.
- No authentication or persistence beyond the browser.

## Further reading

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the app flow, state machine, data
model, and extension points. Contributors and coding agents should also read
[`AGENTS.md`](AGENTS.md).
