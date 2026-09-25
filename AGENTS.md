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

There is currently no test framework. Verify behavior manually (see below).

## Environment

Development and production servers read these from the environment:

- `PORT` — backend port, default `8787`.
- `PISTON_URL` — self-hosted Piston base URL, default `http://127.0.0.1:2000`.
- `API_HOST` — Vite dev proxy target for `/api/*`, default `http://localhost:8787`.
- Execution limits (defaults in `server/index.mjs`): `RUN_TIMEOUT_MS`,
  `QUEUE_TIMEOUT_MS`, `MAX_CONCURRENCY`, `RATE_LIMIT_PER_MIN`, `MAX_CODE_BYTES`,
  `MAX_STDIN_BYTES`, `BODY_LIMIT_BYTES`.

## Hard constraints

These are product requirements, not preferences:

1. **Local execution proxy only.** The SPA may call the same-origin `/api/*`
   routes (e.g. `POST /api/run`) and `fetch` is allowed only for that. All
   server code lives in `server/`; it is the only permitted backend. Code
   execution must go through the self-hosted Piston instance (`PISTON_URL`) —
   never a third-party hosted execution API, and never directly from the
   browser (no Piston URLs in the frontend).
2. **Never reveal correctness.** Do not render `Question.correctOptionId`, scores,
   grades, or result/leaderboard/analytics UI. The participant must never learn
   whether an answer is right.
3. **Light mode only.** Do not add dark mode or theme switching.
4. **No code comments** unless explicitly requested.
5. **Minimize dependencies.** Prefer the standard library and existing code; do
   not add a package without a clear need.
6. **Proctoring is local-only.** It may log focus/visibility events to
   `localStorage`, but must never claim or perform server-side monitoring, and
   must degrade gracefully when camera/fullscreen permissions are denied.

## Architecture map

| Concern              | Location                                        |
| -------------------- | ----------------------------------------------- |
| App shell / routing  | `src/App.tsx` (status-based, no router)         |
| Session state machine| `src/hooks/useAssessment.ts`                    |
| Countdown / expiry   | `src/hooks/useAssessmentTimer.ts`               |
| Local proctoring     | `src/hooks/useProctoring.ts`                    |
| Persistence          | `src/lib/storage.ts` (the only `localStorage` access) |
| Code execution proxy | `server/index.mjs` — `POST /api/run` → self-hosted Piston |
| Mock questions       | `src/data/mockQuestions.ts`                     |
| Code tokenizer       | `src/lib/codeHighlight.ts`                      |
| Domain types         | `src/types/assessment.ts`                       |
| Design tokens        | `src/index.css` (`@theme`)                      |
| Screens              | `src/pages/*`                                   |
| Components           | `src/components/{entry,assessment,layout,submission,ui}` |

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
  Material Symbols.
- **Persistence** always goes through the `storage` object. Mutate session state
  only via `useAssessment` actions, and make sure each action calls `commit()` so
  state is persisted.

## Verification checklist

After changes, manually confirm:

1. Entry form blocks submission until all fields and consent are valid.
2. Starting the assessment shows the timer and first question.
3. Selecting, clearing, marking for review, and navigating update the palette.
4. Reloading mid-assessment restores answers, current question, and the countdown.
5. Submitting opens the confirmation modal and then the locked submission screen.
6. Reloading after submission stays on the submission screen.
7. Keyboard shortcuts (`1`–`4`, `←`/`→`, `M`, `Esc`) work and are ignored while
   typing in inputs.
8. Layout works on desktop, tablet, and mobile (palette becomes a bottom drawer).

## Gotchas

- Navigation actions must persist: if you touch `next`/`previous`/`navigate`,
  ensure they call `commit(next)`.
- The timer is anchored to an absolute `expiresAt` timestamp — never a decrementing
  counter — so refreshes cannot reset it.
- Tailwind class names that do not correspond to a real `@theme` token silently do
  nothing. Check `src/index.css` when adding tokens.
- Raw Node/tsx cannot resolve the project's extensionless imports; use Vite to run
  or bundle code.
- `server/index.mjs` is plain Node outside the `tsc -b` projects; run it directly
  and keep it dependency-free.
- `localStorage` access is guarded for SSR-safety in `storage.ts`; keep it that way.
