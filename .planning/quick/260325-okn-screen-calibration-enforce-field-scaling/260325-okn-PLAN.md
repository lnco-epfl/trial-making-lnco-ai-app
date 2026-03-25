# Quick Task 260325-okn - PLAN

## Goal
Ensure Trail Making field scaling uses `min(host requested scale, viewport fit)` with no scrolling required to view the full field.

## Scope
- Propagate host `screenCalibration.scale` to trial plugin.
- Apply effective scale to field dimensions and circle radius.
- Preserve existing timeline/stage behavior.

## Tasks
1. Read host screen scale in loader and pass it into `run` input.
2. Thread `screenScale` through timeline builders into trial parameters.
3. Update trial plugin scaling math:
- Baseline field size from existing target max height.
- Requested size = baseline * host scale.
- Fit clamp using viewport available width/height.
- Effective scale = host scale * fitScale.
- Apply effective scale to field dimensions and circle radius.
4. Validate with TypeScript and lint.
5. Record quick task artifacts and state update.

## Verification
- `yarn tsc --noEmit` passes.
- Trial plugin accepts `screen_scale` parameter and applies effective scaling to field + circles.
- No new scroll-forced layout behavior introduced by scaling logic.
