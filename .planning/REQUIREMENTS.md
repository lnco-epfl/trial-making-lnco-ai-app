# Requirements: Trail Making Task — LNCO.ai

**Defined:** 2026-03-25
**Core Value:** A PD patient with limited computer experience must be able to start, understand, and complete the task correctly on their own — because bad instructions equal invalid data.

## v1 Requirements

### Instructions (Phase 1)

- [ ] **INSTR-01**: All instruction screens (welcome, task overview, how-to, practice intro) display the neuropsychologist-authored English text verbatim from `docs/20260210 - Trail Making Task Instructions_JP_Clean_Reorganised.docx`
- [ ] **INSTR-02**: All instruction screens display the neuropsychologist-authored French text verbatim from the same document
- [ ] **INSTR-03**: Instruction text is appropriate for elderly (60–70 yr) PD patients with limited computer experience — simple vocabulary, no jargon, no assumed familiarity with digital interfaces
- [ ] **INSTR-04**: Both task variants (numbers-only and numbers+letters) have distinct, clearly differentiated instructions
- [ ] **INSTR-05**: Language selection (`?lang=en` / `?lang=fr`) correctly switches all instruction text

### Screen Calibration (Phase 2)

- [ ] **CAL-01**: App reads `localContext.screenCalibration` provided by the Graasp platform (output of a separate LNCO.ai calibration app)
- [ ] **CAL-02**: A parser/validator utility (`src/utils/screenCalibration.ts`) validates calibration values: `fontSize` (`small | normal | large | extra-large`) and `scale` (number between 0.5 and 3); invalid values are ignored gracefully
- [ ] **CAL-03**: When `screenCalibration.fontSize` is present, it overrides the admin-configured font size setting and is applied to `#jspsych-display-element[data-font-size]`
- [ ] **CAL-04**: When `screenCalibration.scale` is present, it is applied as a CSS variable (`--trail-making-calibration-scale`) on the jsPsych root element, scaling circle stimuli proportionally
- [ ] **CAL-05**: Circle radius in the stimulus plugin uses the calibration scale: `effectiveRadius = circleRadius * scale`
- [ ] **CAL-06**: When no calibration is present, behavior is identical to current (admin font size setting used, circles at configured radius)
- [ ] **CAL-07**: Graasp dependencies updated to account-era fork versions (`@graasp/apps-query-client`, `@graasp/sdk`, `@graasp/ui`) with identity compatibility shim (`accountId ?? memberId`)
- [ ] **CAL-08**: Mock DB name bumped in `src/main.tsx` to prevent Dexie schema migration errors after SDK upgrade
- [ ] **CAL-09**: TypeScript type-check (`yarn tsc --noEmit`) and build (`yarn build`) pass after all changes
- [ ] **CAL-10**: The Trail Making field always fits entirely within the visible viewport (no scrolling required) — the effective circle scale is `min(calibrationScale, maxFitScale)` where `maxFitScale` is the largest scale at which all circles still fit within the available area (viewport minus progress bar height). If the calibration scale would overflow the screen, circles are scaled down to fit.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Calibration procedure itself | Handled by a separate LNCO.ai app — this app only reads the output |
| Participant contact / support UI | Participants are anonymous; no contact mechanism |
| Mobile layout adaptations | Not in scope for this study deployment |
| Changes to task logic or scoring | Existing click-tracking and error counting are validated; not changing |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INSTR-01 | Phase 1 | Pending |
| INSTR-02 | Phase 1 | Pending |
| INSTR-03 | Phase 1 | Pending |
| INSTR-04 | Phase 1 | Pending |
| INSTR-05 | Phase 1 | Pending |
| CAL-01 | Phase 2 | Pending |
| CAL-02 | Phase 2 | Pending |
| CAL-03 | Phase 2 | Pending |
| CAL-04 | Phase 2 | Pending |
| CAL-05 | Phase 2 | Pending |
| CAL-06 | Phase 2 | Pending |
| CAL-07 | Phase 2 | Pending |
| CAL-08 | Phase 2 | Pending |
| CAL-09 | Phase 2 | Pending |
| CAL-10 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation*
