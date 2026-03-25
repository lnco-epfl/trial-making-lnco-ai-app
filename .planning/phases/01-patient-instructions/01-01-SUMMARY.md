---
phase: 01-patient-instructions
plan: 01
subsystem: ui
tags: [i18n, i18next, json, translations, trail-making]

# Dependency graph
requires: []
provides:
  - "Neuropsychologist-authored English TRAIL_MAKING i18n strings in src/langs/en.json"
  - "Neuropsychologist-authored French TRAIL_MAKING i18n strings in src/langs/fr.json"
  - "New keys: PRACTICE1_INTRO, PRACTICE2_INTRO, PRACTICE1/2_REVIEW_BUTTON, PRACTICE1/2_RETRY_MESSAGE, PRACTICE1/2_PROCEED_MESSAGE, TASK1/2_READY_MESSAGE, TASK1/2_COMPLETE_MESSAGE, START_LABEL, END_LABEL"
affects:
  - "02-patient-instructions"
  - "practice.ts (PRACTICE1_INTRO, PRACTICE2_INTRO, review/retry keys)"
  - "task-core.ts (TASK1_READY_MESSAGE, TASK2_READY_MESSAGE, completion messages)"
  - "introduction.ts (WELCOME_TITLE, WELCOME_MESSAGE)"
  - "trail-making-stimulus-trial.ts (START_LABEL, END_LABEL)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All participant-facing strings under translations.TRAIL_MAKING namespace in src/langs/*.json"
    - "Neuropsychologist-authored text stored verbatim in i18n files — no paraphrasing in code"

key-files:
  created: []
  modified:
    - "src/langs/en.json"
    - "src/langs/fr.json"

key-decisions:
  - "Removed 17 generic placeholder keys (INSTRUCTIONS_*, PRACTICE_INTRO_*, PRACTICE1/2_TITLE/MESSAGE, etc.) that are no longer used by any part of the experiment"
  - "TASK1_COMPLETE_TITLE and TASK2_COMPLETE_TITLE retained as they may still serve as HTML heading for the completion screen"
  - "START_BUTTON text kept unchanged per D-15 (browser API affordance, not instructional)"
  - "All functional UI labels (DONE_BUTTON, RETRY_BUTTON, TIME_TAKEN, etc.) preserved unchanged per D-14"

patterns-established:
  - "Neuropsychologist text: stored verbatim with \\n newlines for paragraph breaks within multi-paragraph instructions"

requirements-completed: [INSTR-01, INSTR-02, INSTR-03, INSTR-04, INSTR-05]

# Metrics
duration: 3min
completed: 2026-03-25
---

# Phase 1 Plan 01: Patient Instructions i18n Summary

**Neuropsychologist-authored EN/FR Trail Making Task instruction text replacing all generic placeholders — 14 new keys across both language files covering practice intros, conditional retry/proceed messages, task-ready screens, completion messages, and Start/End circle labels**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-25T12:12:01Z
- **Completed:** 2026-03-25T12:14:28Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced all generic TRAIL_MAKING instruction strings in en.json with verbatim neuropsychologist-authored English text from the clinical document
- Replaced all generic TRAIL_MAKING instruction strings in fr.json with verbatim neuropsychologist-authored French text
- Added 14 new structured keys covering: practice stage intros (PRACTICE1/2_INTRO), review button text (PRACTICE1/2_REVIEW_BUTTON), conditional post-practice messages (PRACTICE1/2_RETRY_MESSAGE, PRACTICE1/2_PROCEED_MESSAGE), task-ready screens (TASK1/2_READY_MESSAGE), completion messages (TASK1/2_COMPLETE_MESSAGE), and Start/End circle labels (START_LABEL, END_LABEL)
- Removed 17 obsolete placeholder keys that were replaced by the new structured keys
- Both files remain syntactically valid JSON

## Task Commits

Each task was committed atomically:

1. **Task 1: Update TRAIL_MAKING keys in en.json** - `918d80a` (feat)
2. **Task 2: Update TRAIL_MAKING keys in fr.json** - `5fcaa20` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/langs/en.json` - TRAIL_MAKING section replaced with neuropsychologist-authored English text; 14 new keys added, 17 old placeholder keys removed
- `src/langs/fr.json` - TRAIL_MAKING section replaced with neuropsychologist-authored French text; same structural changes as en.json

## Decisions Made

- Removed 17 generic placeholder keys (INSTRUCTIONS_*, PRACTICE_INTRO_*, PRACTICE1/2_TITLE/MESSAGE, etc.) that are no longer used by any part of the experiment. These were entirely replaced by the new structured keys.
- TASK1_COMPLETE_TITLE and TASK2_COMPLETE_TITLE were kept as they may still serve as HTML heading labels for the completion screen (even though the body text now uses TASK1/2_COMPLETE_MESSAGE).
- START_BUTTON text kept unchanged per D-15: "Start Fullscreen" / "Démarrer le plein écran" is a browser API affordance, not instructional text.
- All functional UI labels preserved unchanged per D-14: DONE_BUTTON, RETRY_BUTTON, PRESS_TO_BEGIN, PRESS_TO_CONTINUE, CONTINUE_BUTTON_INLINE, TIME_TAKEN, SECONDS, ERRORS_SELF_CORRECTED, ERRORS_NON_SELF_CORRECTED.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- en.json and fr.json contain all i18n keys required by plans 02 and 03 (conditional retry logic, review button, stimulus Start/End labels)
- Downstream plans (practice.ts updates, task-core.ts updates, stimulus plugin Start/End labels) can reference these keys immediately
- No blockers

---
*Phase: 01-patient-instructions*
*Completed: 2026-03-25*
