# Quick Task 260325-n6g Summary

Implemented fixes for Trail Making instruction UI quality concerns.

## Completed

- Removed hard-coded in-trial English helper text in stimulus plugin.
- Added review-button cleanup in practice on_load handlers to prevent duplicate buttons across stages.
- Added scoped Trail Making text layout styles for better margins/readability.

## Files changed

- src/modules/experiment/parts/practice.ts
- src/modules/experiment/trials/trail-making-stimulus-trial.ts
- src/modules/experiment/styles/main.scss

## Validation

- Type-check/build validation run after formatting.
