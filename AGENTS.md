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

Put local overrides in `.env`.

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
| Fullscreen proctoring| `src/hooks/useFullscreenGuard.ts`               |
| Mobile block         | `src/hooks/useIsMobile.ts` + `layout/MobileBlockScreen.tsx` |
| Persistence          | `src/lib/storage.ts` (the only `localStorage` access) |
| Code execution client| `src/lib/runClient.ts` → `POST /api/run`        |
| Code execution proxy | `server/index.mjs` — `POST /api/run` → self-hosted Piston |
| Round 1 questions    | `src/data/mockQuestions.ts`                     |
| Round 2 questions    | `src/data/debugQuestions.ts`                    |
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
8. Submitting Round 2 shows the locked final screen; reloading after either round
   stays on the submission screen.
9. Leaving fullscreen, hiding the tab, or blurring the window starts the 10-second
   warning; returning in time disarms it, and letting it lapse resets to entry.
10. Keyboard shortcuts (`1`–`4`, `←`/`→`, `M`, `Esc`) work in Round 1 and are
    ignored while typing in inputs.
11. A coarse-pointer device gets `MobileBlockScreen` instead of a broken layout.
12. Layout holds up on desktop and tablet widths.

## Gotchas

- Navigation actions must persist: if you touch `next`/`previous`/`navigate`,
  ensure they call `commit(next)`.
- The timer is anchored to absolute `expiresAt` / `round2ExpiresAt` timestamps —
  never a decrementing counter — so refreshes cannot reset it. Each page passes
  `null` for the round it is not running, which parks the timer.
- `finalizeExpired` is overloaded: from `active` it **advances to Round 2**, from
  `round2` it submits. Do not "fix" this to a plain submit without checking the
  product intent.
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
  `public class Main` (the proxy writes `Main.java`), and the starter's output
  must actually differ from its `sampleCases` entry or the exercise is empty.
  Verify by running both the starter and a fixed version through `POST /api/run`
  rather than by reading. See "Authoring a debug problem" in
  [`ARCHITECTURE.md`](ARCHITECTURE.md).
