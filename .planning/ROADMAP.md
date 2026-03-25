# Roadmap: Trail Making Task — Lab Pilot Readiness

## Overview

Two focused improvements bring this existing, validated Trail Making Task to lab-pilot readiness: replacing placeholder instruction text with neuropsychologist-authored EN/FR content so PD patients can self-administer the task correctly, then integrating screen calibration values from the LNCO.ai calibration app so stimulus sizing is consistent across participant devices.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Patient Instructions** - Replace all i18n instruction strings with neuropsychologist-authored EN/FR text
- [ ] **Phase 2: Screen Calibration** - Read `localContext.screenCalibration` and apply to font size and circle scale (capped so field always fits on screen); update Graasp dependencies

## Phase Details

### Phase 1: Patient Instructions
**Goal**: Elderly PD patients with limited computer experience can read, understand, and follow task instructions entirely on their own
**Depends on**: Nothing (first phase)
**Requirements**: INSTR-01, INSTR-02, INSTR-03, INSTR-04, INSTR-05
**Success Criteria** (what must be TRUE):
  1. Every instruction screen (welcome, overview, how-to, practice intro) shows the exact neuropsychologist-authored text — no placeholder or generic strings remain
  2. Setting `?lang=fr` displays the full French instruction text; `?lang=en` displays the full English text throughout
  3. Numbers-only (Part A) and numbers+letters (Part B) variants each show clearly differentiated instructions that explain what is expected for that variant
  4. A non-technical user reading the instructions can identify what to click, in what order, without any additional guidance
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Update TRAIL_MAKING i18n keys in en.json and fr.json with neuropsychologist-authored text
- [x] 01-02-PLAN.md — Extend Start/End circle labels to all stages in stimulus plugin
- [ ] 01-03-PLAN.md — Wire new i18n keys into introduction/practice/task screens; implement conditional retry and review-button logic

**Context**: `.planning/phases/01-patient-instructions/1-CONTEXT.md`

**UI hint**: yes

### Phase 2: Screen Calibration
**Goal**: Circle stimuli and font size are normalised to each participant's physical screen so the task is perceptually consistent across devices
**Depends on**: Phase 1
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05, CAL-06, CAL-07, CAL-08, CAL-09, CAL-10
**Success Criteria** (what must be TRUE):
  1. When a calibration app has run, circles render at the physically-correct size on that device (`effectiveScale = min(calibrationScale, maxFitScale)` where `maxFitScale` keeps all circles within the viewport minus progress bar)
  2. The Trail Making field is always fully visible on a single screen without scrolling — on any device, with or without calibration
  3. When `screenCalibration.fontSize` is set, it overrides the admin font size setting and is visible on the task display element
  4. When no calibration values are present, the task behaves identically to before this phase (no regression)
  5. `yarn tsc --noEmit` and `yarn build` both pass with zero errors after all dependency and code changes
**Plans**: TBD
**Context**: `.planning/phases/02-screen-calibration/2-CONTEXT.md`

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Patient Instructions | 1/3 | In Progress|  |
| 2. Screen Calibration | 0/? | Not started | - |
