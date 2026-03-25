# Quick Task 260325-ncg Summary

Implemented requested practice retry flow changes.

## Completed

- Added `practice_attempt` to practice-stage plugin calls (first and second attempts).
- Updated plugin fail behavior:
  - first attempt: Retry now finishes trial, allowing timeline to return to instruction screen
  - second attempt: Continue only (no retry loop)

## Files changed

- src/modules/experiment/parts/practice.ts
- src/modules/experiment/trials/trail-making-stimulus-trial.ts

## Validation

- Type-check run after changes.
