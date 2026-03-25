# Screen Calibration Implementation Script

## Goal

Implement host-driven screen calibration so the app reads `localContext.screenCalibration` and applies:

- global text scaling via `fontSize` (maps to `data-font-size` on jsPsych root)
- flanker stimulus (SVG arrow) scaling via `scale` (maps to `--flanker-calibration-scale` CSS variable)

This runbook captures the exact sequence used in this app and the migration pitfalls.

## 1. Update Graasp Dependencies to Forks

Update these dependencies in [package.json](package.json):

- `@graasp/apps-query-client`
- `@graasp/sdk`
- `@graasp/ui`

Recommended format:

- `github:owner/repo#<commit-sha>`

Then run install and verify lockfile commit resolutions in [yarn.lock](yarn.lock).

## 2. Add Screen Calibration Parser Utility

Implement parser/validator in [src/utils/screenCalibration.ts](src/utils/screenCalibration.ts):

- accepted `fontSize` values: `small | normal | large | extra-large`
- accepted `scale`: number where `scale > 0.5 && scale < 3`
- parser reads from `localContext.screenCalibration`

Keep parser tolerant:

- ignore invalid values
- return `undefined` when neither field is valid

## 3. Read Calibration from Local Context

In [src/modules/main/ExperimentLoader.tsx](src/modules/main/ExperimentLoader.tsx):

- read `localContext` via `useLocalContext()`
- parse calibration via utility
- pass parsed calibration into experiment `run(...)` input

Also for account-era packages:

- use `accountId ?? memberId` for local actor identity (compatibility shim)

## 4. Apply Calibration in Experiment Runtime

In [src/modules/experiment/experiment.ts](src/modules/experiment/experiment.ts):

- accept `screenCalibration?: ScreenCalibration` in run input type
- resolve applied values:
  - `appliedFontSize = screenCalibration?.fontSize ?? settings.generalSettings.fontSize`
  - `appliedStimulusScale = screenCalibration?.scale ?? 1`
- apply to jsPsych root element (`#jspsych-display-element`) on `on_timeline_start`:
  - `element.setAttribute('data-font-size', appliedFontSize)`
  - `element.style.setProperty('--flanker-calibration-scale', String(appliedStimulusScale))`

## 5. Wire SVG Stimuli to Calibration Scale

The Flanker stimuli are inline SVGs, not text characters. Scaling via `font-size` has no effect on SVGs with hardcoded `width`/`height` attributes.

**In [src/modules/experiment/utils/constants.ts](src/modules/experiment/utils/constants.ts):**

- Remove the hardcoded `width` and `height` attributes from all SVG strings (`leftArrowSVG`, `rightArrowSVG`, `neutralSVG`)
- Keep only `viewBox` so the SVG is intrinsically scalable

**In [src/modules/experiment/styles/main.scss](src/modules/experiment/styles/main.scss):**

- Initialize the CSS variable on the jsPsych root:
  ```scss
  #jspsych-display-element {
    --flanker-calibration-scale: 1;
  }
  ```
- Size SVGs using only the calibration scale — no font-size variants:
  ```scss
  .flanker-stimulus svg {
    width: calc(120px * var(--flanker-calibration-scale, 1));
    height: calc(120px * var(--flanker-calibration-scale, 1));
    flex-shrink: 0;
  }
  ```

The `fontSize` setting (`data-font-size`) still controls text elements (instructions, feedback, fixation cross) via `.font-small`, `.font-normal` etc. classes. It does not affect stimulus size.

## 6. Account vs Member Compatibility (Minimal)

When query-client/sdk is account-era:

- context identity uses `accountId`
- app data ownership checks use `d.account?.id`

Applied in:

- [src/modules/context/ExperimentContext.tsx](src/modules/context/ExperimentContext.tsx) — use `accountId ?? memberId` shim, check `d.account?.id ?? d.member?.id`
- [src/modules/main/ExperimentLoader.tsx](src/modules/main/ExperimentLoader.tsx) — use `accountId ?? memberId`
- [src/mocks/db.ts](src/mocks/db.ts) — `defaultMockContext` uses `accountId`

## 7. Mock DB Schema Migration Pitfall (Dexie)

If mock schema changed primary key (for example `memberId` -> `accountId`), old IndexedDB data causes:

- `UpgradeError Not yet support for changing primary key`

Fix in app bootstrap by bumping the mock DB name in [src/main.tsx](src/main.tsx):

- use a new name like `graasp-app-mocks-v3`

This forces a fresh DB with new schema.

## 8. Query-Client Mock Handler Pitfall to Verify

Confirm query-client mock handlers use the same key as Dexie schema for `appContext`.

Mismatch example to avoid:

- schema key/index uses `accountId`
- handlers still query with `memberId`

Symptom:

- `KeyPath memberId on object store appContext is not indexed`

## 9. Validation Steps

Run in this order:

1. `yarn run tsc --noEmit`
2. `yarn build`
3. `yarn dev`
4. verify calibration at runtime:
   - `#jspsych-display-element` has `data-font-size` attribute set
   - `#jspsych-display-element` has `--flanker-calibration-scale` CSS variable set
   - stimulus SVGs visually resize when scale changes

## 10. Reusable Checklist for Next Apps

1. Pin 3 Graasp deps to fork SHAs in [package.json](package.json)
2. Add parser in [src/utils/screenCalibration.ts](src/utils/screenCalibration.ts)
3. Pass calibration from [src/modules/main/ExperimentLoader.tsx](src/modules/main/ExperimentLoader.tsx)
4. Apply `data-font-size` + `--<app>-calibration-scale` in [src/modules/experiment/experiment.ts](src/modules/experiment/experiment.ts)
5. If stimuli are SVGs: remove hardcoded `width`/`height` from SVG strings, size via CSS variable
6. If stimuli are text: use `font-size: calc(Xrem * var(--<app>-calibration-scale, 1))`
7. Use account-based identity in context-sensitive files
8. Bump mock DB name in [src/main.tsx](src/main.tsx) if Dexie migration errors appear
9. Re-run type-check and build
