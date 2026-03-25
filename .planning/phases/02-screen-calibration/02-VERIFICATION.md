---
phase: 02-screen-calibration
verified: 2026-03-25T16:30:00Z
status: human_needed
score: 8/10 must-haves verified
gaps: []
human_verification:
  - test: "Calibration scale cap in constrained viewport"
    expected: "When `screenCalibration.scale` exceeds fit limit, field remains fully visible without scrolling and rendered size follows `effectiveScale = min(calibrationScale, maxFitScale)`."
    why_human: "Requires browser runtime and visual inspection across viewport sizes/fullscreen states."
  - test: "Calibration font-size precedence"
    expected: "When `screenCalibration.fontSize` is present, it is applied to `#jspsych-display-element[data-font-size]` even when admin setting differs."
    why_human: "Requires runtime context injection and DOM inspection in browser."
---

# Phase 2 Verification Report

## Automated Truths Verified
1. Parser utility exists and enforces valid ranges/types (`fontSize`, `scale`).
2. `ExperimentLoader` reads `screenCalibration` and passes to `run()`.
3. `run()` supports optional `screenCalibration` input and applies font-size precedence.
4. Calibration scale is passed through practice/task builders to trial plugin.
5. Trial plugin defines `calibration_scale` parameter.
6. Trial plugin computes viewport-aware `maxFitScale` and `effectiveScale` at trial render-time.
7. Trial plugin applies effective scale to field dimensions and circle radius.
8. Project compiles and bundles successfully:
- `yarn tsc --noEmit` PASS
- `yarn build` PASS

## Human Checks Required
1. Validate capping behavior visually at multiple viewport heights.
2. Validate no-regression behavior when calibration is missing.

## Environment Caveat
`yarn install` ends with EPERM unlink on `node_modules/vite/.../esbuild.exe` in this machine state. Dependency resolution and lockfile updates are present, and compile/build validations pass.
