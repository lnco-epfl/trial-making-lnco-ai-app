---
phase: 01-patient-instructions
plan: 03
subsystem: ui
tags: [jspsych, i18n, experiment, react, typescript]

# Dependency graph
requires:
  - phase: 01-patient-instructions
    plan: 01
    provides: neuropsychologist-authored i18n keys (PRACTICE1_INTRO, PRACTICE1_REVIEW_BUTTON, etc.)

provides:
  - Welcome screen using WELCOME_TITLE / WELCOME_MESSAGE neuropsychologist text
  - Practice builders with per-stage intro text, conditional retry logic, review button
  - Task ready and completion screens using neuropsychologist-authored text
affects:
  - experiment.ts (calls buildIntroduction, buildPractice1/2, buildTask1/2)
  - 02-screen-calibration (consumes same experiment structure)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - jsPsych conditional_function on timeline node for branching after trial result
    - on_load callback for injecting DOM elements during a stimulus trial
    - jsPsych.finishTrial() to end trial programmatically from a DOM button click

key-files:
  created: []
  modified:
    - src/modules/experiment/parts/introduction.ts
    - src/modules/experiment/parts/practice.ts
    - src/modules/experiment/parts/task-core.ts
    - vite.config.ts
    - package.json

key-decisions:
  - "buildIntroduction now returns only the welcome/fullscreen screen; per-stage instruction text lives in each stage builder"
  - "Review button uses jsPsych.finishTrial() to end the trial early — clean and supported by jsPsych API"
  - "Retry block uses jsPsych conditional_function on a timeline node, not pre-computed conditionals"
  - "Task completion screens no longer show TIME_TAKEN metrics — neuropsychologist text is self-contained"

patterns-established:
  - "Conditional timeline branching: { timeline: [...], conditional_function: () => bool } wrapper objects"
  - "on_load + DOM append for review button injection in stimulus trial"
  - "hadErrors set in on_finish by reading state.getStageResults().last entry"

requirements-completed: [INSTR-01, INSTR-02, INSTR-03, INSTR-04, INSTR-05]

# Metrics
duration: 35min
completed: 2026-03-25
---

# Phase 01 Plan 03: Wire i18n Keys into Experiment Screens Summary

**jsPsych timeline wired with neuropsychologist-authored text: per-stage intros, conditional retry logic with review button, and task completion messages**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-25T13:35:00Z
- **Completed:** 2026-03-25T14:11:34Z
- **Tasks:** 3
- **Files modified:** 3 (+ 2 worktree environment fixes)

## Accomplishments

- `introduction.ts` stripped to welcome screen only; 3 generic instruction screens removed
- `practice.ts` rewritten with full neuropsychologist intro text, review button on 1st attempt (absent on 2nd), conditional retry message + 2nd attempt block via jsPsych `conditional_function`
- `task-core.ts` updated: ready screens show verbatim neuropsychologist task text; completion screens show clean message without TIME_TAKEN metrics

## Task Commits

1. **Task 1: Update introduction.ts** - `a72012f` (feat)
2. **Task 2: Rewrite practice.ts** - `55d0e0c` (feat)
3. **Task 3: Update task-core.ts** - `5ec6d20` (feat)

## Files Created/Modified

- `src/modules/experiment/parts/introduction.ts` - Welcome screen only; taskInstructions() removed
- `src/modules/experiment/parts/practice.ts` - Full retry/review logic using jsPsych conditional_function
- `src/modules/experiment/parts/task-core.ts` - Neuropsychologist task text on ready + completion screens
- `vite.config.ts` - ESLint resolve fix for worktree (Rule 3 deviation)
- `package.json` - ESLint resolve fix for worktree pre-commit hook (Rule 3 deviation)

## Decisions Made

- Review button ends trial early via `jsPsych.finishTrial()` — directly supported by jsPsych API, no custom events needed
- `conditional_function` wrapper nodes used for retry message and retry block — jsPsych evaluates these closures at runtime after the 1st attempt, capturing current values of `isSecondAttempt` and `hadErrors`
- Task completion screens no longer show time metrics — the neuropsychologist text is complete on its own

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed ESLint plugin duplication in worktree environment**
- **Found during:** Merge setup (before Task 1)
- **Issue:** Git worktree has its own `node_modules/@typescript-eslint` AND the parent directory has one; ESLint fails with "couldn't determine plugin uniquely" on pre-commit and `yarn build`
- **Fix:** Added `--resolve-plugins-relative-to .` to `lint` script in package.json and to `eslint.lintCommand` in vite.config.ts
- **Files modified:** `package.json`, `vite.config.ts`
- **Verification:** `yarn build` exits 0, pre-commit hook passes
- **Committed in:** `df4879a` (merge commit) and `9778c4a`

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking environment issue)
**Impact on plan:** Required fix; no scope creep. Worktree-specific; does not affect production code.

## Issues Encountered

- Plans 01-01 and 01-02 had been executed in separate worktrees (merged into `instructions-feedback` branch) but this worktree had none of those changes. Required merging before executing plan 01-03.

## Known Stubs

None — all i18n keys resolved to neuropsychologist-authored text from plan 01-01; no hardcoded placeholders.

## Next Phase Readiness

- All participant-facing instruction screens now display neuropsychologist-authored text
- Conditional retry logic is wired and ready for participant testing
- Phase 2 (screen calibration) can proceed — no instruction-screen dependencies

---
*Phase: 01-patient-instructions*
*Completed: 2026-03-25*
