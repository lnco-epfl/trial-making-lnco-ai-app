# Phase 2: Screen Calibration - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Read `localContext.screenCalibration` (output of the LNCO.ai calibration app) and apply:
- `fontSize` → overrides the admin font size setting on `#jspsych-display-element[data-font-size]`
- `scale` → scales circle stimuli and the trail making field; subject to a viewport-fit cap so the field always fits on screen without scrolling

This phase also includes the dependency upgrade to the account-era LNCO.ai Graasp forks and the associated account-era compatibility shims.

</domain>

<decisions>
## Implementation Decisions

### Dependency upgrade
- **D-01:** Update three Graasp deps to LNCO.ai fork versions using GitHub shorthand (no pinned SHAs — use latest commit on the fork's default branch):
  - `"@graasp/apps-query-client": "github:lnco-epfl/lnco-ai-apps-query-client"`
  - `"@graasp/sdk": "github:lnco-epfl/graasp-sdk"`
  - `"@graasp/ui": "github:lnco-epfl/graasp-ui"`
- **D-02:** Run `yarn install` after updating `package.json`; commit the updated `yarn.lock`

### Calibration parser utility
- **D-03:** Create `src/utils/screenCalibration.ts` with a parser/validator:
  - Accepted `fontSize` values: `"small" | "normal" | "large" | "extra-large"` — invalid values silently ignored
  - Accepted `scale`: number where `scale > 0.5 && scale < 3` — out-of-range values silently ignored
  - Returns `undefined` when neither field is valid
  - Export type `ScreenCalibration = { fontSize?: FontSize; scale?: number }`

### Reading calibration in ExperimentLoader
- **D-04:** In `src/modules/main/ExperimentLoader.tsx`, read `localContext` via `useLocalContext()` and parse calibration via the utility from D-03. Pass the result as a new `screenCalibration` field in the `input` object passed to `run()`
- **D-05:** Use `accountId ?? memberId` shim for local actor identity (account-era compatibility)

### Passing calibration through experiment.ts
- **D-06:** Extend the `run()` input type in `src/modules/experiment/experiment.ts` to accept `screenCalibration?: ScreenCalibration`
- **D-07:** Font size: apply `appliedFontSize = screenCalibration?.fontSize ?? settings.generalSettings.fontSize` to `#jspsych-display-element[data-font-size]` at experiment start (replaces current direct-from-settings apply). This ensures calibration font size takes priority over admin setting but falls back gracefully
- **D-08:** Pass `screenCalibration?.scale ?? 1` down to timeline builders that create `TrailMakingStimulusPlugin` trials — as a new `calibrationScale` argument

### Viewport-fit and effective scale (CAL-10)
- **D-09:** Calibration scale is applied at trial render time (inside `TrailMakingStimulusPlugin.trial()`), NOT at timeline build time. This is required because trials render after fullscreen entry — viewport dimensions are only accurate at that point.
- **D-10:** Inside `TrailMakingStimulusPlugin.trial()`, compute `effectiveScale` as follows:
  ```
  progressBarHeight = document.getElementById('jspsych-progressbar-container')?.offsetHeight ?? 0
  availableHeight = window.innerHeight - progressBarHeight
  // maxFitScale: how much can we scale up beyond current 80vh target before overflowing?
  maxFitScale = availableHeight / (TARGET_MAX_HEIGHT_VH / 100 * window.innerHeight)
  effectiveScale = Math.min(calibrationScale, maxFitScale)
  ```
  Where `TARGET_MAX_HEIGHT_VH = 80` (the existing constant). `maxFitScale` is typically ~1.19 on a standard display with progress bar.
- **D-11:** Apply `effectiveScale` to both:
  - Field dimensions: multiply `getFieldDimensions()` result by `effectiveScale` (scale up/down from the 80vh baseline)
  - Circle radius: `effectiveRadius = circleRadius * effectiveScale`
- **D-12:** Add `calibration_scale` as a new parameter to `TrailMakingStimulusPlugin` (type `ParameterType.FLOAT`, default `1`). Timeline builders pass the value from `run()` input through to each plugin trial

### What does NOT change
- **D-13:** The CSS variable approach (`--flanker-calibration-scale`) used in the Flanker app is NOT used here. Trail Making circle sizes are rendered in SVG using pixel values computed in JS — the scale is applied directly to the pixel values, not via CSS variables
- **D-14:** The `TARGET_MAX_HEIGHT_VH = 80` constant stays. It remains the reference baseline; `effectiveScale` multiplies on top of it at render time
- **D-15:** The font size dropdown in the progress bar remains functional and keeps overriding `data-font-size` when the user changes it mid-session (no change to existing behavior)

### Account-era compatibility shims
- **D-16:** Apply minimal compatibility shims in three files:
  - `src/modules/main/ExperimentLoader.tsx`: `accountId ?? memberId`
  - `src/modules/context/ExperimentContext.tsx`: `accountId ?? memberId` for actor identity; `d.account?.id ?? d.member?.id` for data ownership checks
  - `src/mocks/db.ts`: use `accountId` in `defaultMockContext`
- **D-17:** Bump the mock DB name in `src/main.tsx` to `graasp-app-mocks-v3` (or next available version) to prevent Dexie `UpgradeError` from schema key change (`memberId` → `accountId`)
- **D-18:** Verify query-client mock handlers use the same key as Dexie schema for `appContext` (per calibration script step 8) — fix if mismatched

### Validation
- **D-19:** Validation sequence: `yarn tsc --noEmit` → `yarn build` → visual check in `yarn dev` that `#jspsych-display-element` has `data-font-size` attribute and circles scale correctly when `screenCalibration` is injected via mock context

</decisions>

<specifics>
## Calibration Schema

`localContext.screenCalibration` (from the LNCO.ai calibration app):
```typescript
{
  fontSize?: "small" | "normal" | "large" | "extra-large";
  scale?: number; // valid range: > 0.5 and < 3
}
```

## Scale Computation (CAL-10)

The field currently renders at up to 80vh (largest stage). On a 900px viewport with 40px progress bar:
- `availableHeight = 900 - 40 = 860px`
- `maxFitScale = 860 / (0.80 * 900) = 860 / 720 ≈ 1.19`

So a calibration scale of 1.0 results in no change. A calibration scale of 1.5 would be capped at ~1.19 (fits viewport). A calibration scale of 0.7 would be honored as-is (smaller than max).

If no calibration is present, `calibrationScale = 1`, `effectiveScale = min(1, maxFitScale) = 1` — identical to current behavior (no regression).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Implementation script
- `docs/SCREEN_CALIBRATION_IMPLEMENTATION_SCRIPT.md` — Step-by-step runbook from the Flanker app implementation. Steps 1–4 and 6–9 apply directly. Step 5 (SVG scaling via CSS variable) does NOT apply to Trail Making — use JS-computed pixel values instead (D-12, D-13)

### Files to modify
- `package.json` — dependency versions
- `yarn.lock` — updated after install
- `src/utils/screenCalibration.ts` — new file: parser/validator utility
- `src/modules/main/ExperimentLoader.tsx` — read localContext, pass calibration to run()
- `src/modules/experiment/experiment.ts` — extend run() input type, apply fontSize, pass scale to builders
- `src/modules/experiment/parts/practice.ts` — pass calibration_scale to plugin
- `src/modules/experiment/parts/task-core.ts` — pass calibration_scale to plugin
- `src/modules/experiment/trials/trail-making-stimulus-trial.ts` — add calibration_scale param, compute effectiveScale, apply to field dimensions and circle radius
- `src/modules/context/ExperimentContext.tsx` — account-era shim
- `src/mocks/db.ts` — account-era shim
- `src/main.tsx` — bump mock DB name

### State and types
- `src/modules/context/SettingsContext.tsx` — `AllSettingsType`, `GeneralSettings` (fontSize), `TrailMakingSettings` (circleRadius)
- `src/modules/experiment/jspsych/experiment-state-class.ts` — `ExperimentState.getGeneralSettings()`, `getTrailMakingSettings()`

### Field constants
- `src/modules/experiment/utils/constants.ts` — `PRACTICE1_FIELD`, `TASK1_FIELD`, `PRACTICE2_FIELD`, `TASK2_FIELD` — defines field sizes used in `getFieldDimensions()`

</canonical_refs>

<code_context>
## Existing Code Insights

### Current font size application (experiment.ts:83–93)
```typescript
if (state.getGeneralSettings().fontSize) {
  const jspsychDisplayElement = document.getElementById('jspsych-display-element');
  if (jspsychDisplayElement) {
    jspsychDisplayElement.setAttribute('data-font-size', state.getGeneralSettings().fontSize);
  }
}
```
Replace the source of `fontSize` here with `appliedFontSize` (calibration-first, then admin setting).

### Current circle_radius pattern (practice.ts, task-core.ts)
```typescript
circle_radius: state.getTrailMakingSettings().circleRadius,
```
Replace with `circle_radius: state.getTrailMakingSettings().circleRadius` (base value unchanged) and add `calibration_scale: calibrationScale` as a separate parameter.

### Current field dimensions (trail-making-stimulus-trial.ts)
```typescript
const TARGET_MAX_HEIGHT_VH = 80;
const getFieldDimensions = (stage) => {
  const [fieldWidth, fieldHeight] = fieldDef.size;
  const scaleFactorVh = TARGET_MAX_HEIGHT_VH / MAX_FIELD_HEIGHT;
  return { width: fieldWidth * scaleFactorVh, height: fieldHeight * scaleFactorVh };
};
```
At trial render time, multiply width and height by `effectiveScale` before using for SVG sizing.

### Account-era shim locations
- `ExperimentLoader.tsx`: `const { memberId, accountId } = useLocalContext(); const actorId = accountId ?? memberId;`
- `ExperimentContext.tsx`: same pattern; also `d.account?.id ?? d.member?.id` in data filter
- `mocks/db.ts`: `defaultMockContext` object uses `accountId` field

### Established run() extension pattern
The `run()` function accepts a destructured object. New fields are added to `input` — no breaking changes needed.

</code_context>

<deferred>
## Deferred Ideas

- Font size picker override: if calibration provides `fontSize`, the admin font-size dropdown could be hidden or pre-selected to the calibrated value — deferred, not required
- Per-device circle size testing harness — calibration validation is done via visual inspection in dev mode
- Dynamic recalculation on window resize — viewport is considered stable during a fullscreen trial; resize handling is out of scope

</deferred>

---

*Phase: 02-screen-calibration*
*Context gathered: 2026-03-25*
