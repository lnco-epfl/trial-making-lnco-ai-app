# Quick Task 260325-okn - SUMMARY

## Outcome
Implemented host scale-aware field sizing for Trail Making with viewport-fit clamping, so rendered field size is constrained by the smaller of host scale and screen-fit.

## Changes Made
- `src/modules/main/ExperimentLoader.tsx`
- Read `localContext.screenCalibration?.scale`, sanitize default to `1`, pass as `screenScale` into `run` input.

- `src/modules/experiment/experiment.ts`
- Extended `run` input type with optional `screenScale`.
- Threaded `screenScale` into `buildPractice1`, `buildPractice2`, `buildTask1`, `buildTask2`.

- `src/modules/experiment/parts/practice.ts`
- Extended builders to accept `screenScale` and pass `screen_scale` to trial plugin for both attempts.

- `src/modules/experiment/parts/task-core.ts`
- Extended builders to accept `screenScale` and pass `screen_scale` to trial plugin.

- `src/modules/experiment/trials/trail-making-stimulus-trial.ts`
- Added plugin param `screen_scale`.
- Replaced fixed-vh sizing with px sizing derived from:
  - baseline target height,
  - host requested scale,
  - viewport-fit clamp.
- Applied `effectiveScale` to circle radius and marker offsets.

## Additional Type Baseline Fixes Required on Branch
To keep this branch compiling while implementing the quick task, aligned existing files with current account-era package types:
- `src/mocks/db.ts`
- `src/modules/context/ExperimentContext.tsx`
- `src/modules/ErrorBoundary.tsx`

## Validation
- `yarn tsc --noEmit` passed.
