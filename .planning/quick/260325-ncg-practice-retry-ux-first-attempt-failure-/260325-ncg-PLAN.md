# Quick Task 260325-ncg Plan

## Objective

Align practice retry UX with requested participant flow.

## Tasks

1. Add attempt context from practice builders to plugin (`practice_attempt: 1 | 2`).
2. In plugin failure handling:

- attempt 1: Retry ends trial (timeline returns to instructions)
- attempt 2: show Continue only, no retry loop

3. Keep existing success path unchanged.

## Verification

- `yarn tsc --noEmit`
- Manual spot-check:
  - fail first attempt, click Retry -> instruction screen appears before second attempt
  - fail second attempt -> only Continue shown
