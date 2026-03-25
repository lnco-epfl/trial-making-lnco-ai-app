---
phase: 01-patient-instructions
plan: 02
subsystem: ui
tags: [jspsych, trail-making, i18n, stimulus-plugin]

# Dependency graph
requires:
  - phase: 01-patient-instructions
    provides: "i18n keys START_LABEL and END_LABEL (added by plan 01-01)"
provides:
  - "Start/End labels rendered below sequence-correct first/last circles on all four stages"
  - "Sequence-based circle identification pattern using layout.sequence array"
affects: [01-patient-instructions/01-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sequence-based circle lookup: find circle by layout.sequence[0] and layout.sequence[length-1], not array index"
    - "Dynamic label offset: circleRadius + 6px below circle center to avoid overlap"

key-files:
  created: []
  modified:
    - src/modules/experiment/trials/trail-making-stimulus-trial.ts

key-decisions:
  - "Labels render on ALL four stages (practice1, task1, practice2, task2) — no stage guard"
  - "Circle identification uses sequence array to find the logically first/last circle, not array position"
  - "Label offset is dynamic (circleRadius + 6px) so labels scale correctly at all configured circle sizes"
  - "Labels appear BELOW their circle using top: calc(y% + offset) to avoid overlapping the circle border"

patterns-established:
  - "Sequence-first lookup: always resolve circle identity from layout.sequence, not layout.circles array order"

requirements-completed: [INSTR-01, INSTR-04]

# Metrics
duration: 12min
completed: 2026-03-25
---

# Phase 01 Plan 02: Patient Instructions — Start/End Labels Summary

**Start (green) and End (red) labels now appear below sequence-correct circles on all four Trail Making stages using i18n text and dynamic circleRadius-based positioning**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-25T12:20:00Z
- **Completed:** 2026-03-25T12:32:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Removed practice-only guard so Start/End labels render on practice1, task1, practice2, and task2
- Changed circle identification from array index (`circles[0]`) to sequence-based lookup (`circles.find(c => c.label === sequence[0])`)
- Replaced hard-coded English 'START'/'END' strings with `t('TRAIL_MAKING.START_LABEL')` and `t('TRAIL_MAKING.END_LABEL')` i18n calls
- Fixed label positioning from fixed ±50px offsets (which broke at small viewports) to dynamic `circleRadius + 6px` offset below the circle
- Moved label-rendering block to execute immediately after the circle forEach, before instruction text is appended

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Start/End labels to all stages and use sequence-based circle identification** - `5c14f68` (feat)

## Files Created/Modified
- `src/modules/experiment/trials/trail-making-stimulus-trial.ts` - Updated stimulus plugin: removed stage guard on label block, added sequence-based circle lookup, replaced hard-coded text with i18n keys, fixed dynamic positioning, moved label block above instruction text

## Decisions Made
- Labels use `circleRadius + 6px` as offset below circle center (not above) to ensure they never overlap the circle border regardless of configured radius (15–50px)
- Guard skips label rendering if `firstCircle` or `lastCircle` are undefined (e.g., empty layout) — fail-safe, not an error

## Deviations from Plan

None — plan executed exactly as written.

Pre-existing TypeScript error (`Cannot find type definition file for 'cypress'`) was confirmed present before changes and is out of scope.

## Issues Encountered

- `START_LABEL` and `END_LABEL` i18n keys are added by plan 01-01 (wave 1 parallel). At execution time the keys were not yet present in `en.json`. The plan explicitly documents this as acceptable — i18next returns the key string as fallback, which does not break rendering. Keys will be present when both plans complete.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Start/End labels are ready on all four stages
- Plan 01-03 can proceed to update `getInstructionText()` (currently left intact per plan 01-02 instructions)
- No blockers

---
*Phase: 01-patient-instructions*
*Completed: 2026-03-25*
