# Trail Making Task — LNCO.ai

## What This Is

A browser-based Trail Making Task deployed on the LNCO.ai / Graasp platform as part of an at-home neuropsychological test battery (Trail Making + N-Back + Flanker). It is used to measure cognitive abilities as a baseline correlate for a study on the relationship between sense of agency and apathy using an Evidence-Based Decision Making (EBDM) paradigm. Participants are Parkinson's Disease patients (target age 60–70) who complete the task fully independently, without any researcher support, on their own devices.

## Core Value

A PD patient with limited computer experience must be able to start, understand, and complete the task correctly on their own — because bad instructions equal invalid data.

## Requirements

### Validated

- ✓ Four-stage Trail Making Task (practice1 → task1 → practice2 → task2) — existing
- ✓ Bilingual EN/FR via i18next (`?lang=` query param) — existing
- ✓ Configurable stages, circle radius, layouts via Graasp AppSettings — existing
- ✓ Click tracking with error counting (self-corrected vs non-self-corrected) — existing
- ✓ Photo-diode support for EEG/physio synchronization — existing
- ✓ Font size selector and fullscreen button in progress bar — existing
- ✓ Link to next experiment on completion — existing
- ✓ Data saved to Graasp on stage completion and beforeunload — existing

### Active

- [ ] Neuropsychologist-authored instructions (EN + FR) that are self-explanatory for elderly, non-technical PD patients at home
- [ ] Screen calibration: read calibration values from a separate LNCO.ai calibration app and apply them to normalize circle sizes across participant devices

### Out of Scope

- Researcher dashboard / data review — handled by Graasp Analytics
- Real-time support or contact mechanisms — participants are anonymous
- Mobile-specific adaptations beyond existing font size — not in scope for this study

## Context

- **Study context:** At-home deployment to PD patients. No researcher contact possible. Participants are anonymous. Data quality depends entirely on self-administered task completion.
- **Patient profile:** Age 60–70, likely limited experience with computerized neuropsych tasks, possible motor impairment (tremor), possible visual impairments — all instructions and interactions must be maximally clear and forgiving.
- **Battery:** This task is one of three (Trail Making, N-Back, Flanker). A link-to-next-experiment setting chains them.
- **Screen calibration:** A separate LNCO.ai app handles the calibration procedure itself. This app only needs to read the resulting values and apply them to stimulus sizing.
- **Timeline:** Lab pilot due in 1–2 weeks (from 2026-03-25).
- **Platform:** Graasp Player (participant-facing). Settings configured in Graasp Builder by the researcher.

## Constraints

- **Stack**: TypeScript + React + Vite + jsPsych 8 + Graasp SDK — no deviations
- **i18n**: All participant-facing text must have both EN and FR translations in `src/langs/`
- **Accessibility**: Instructions and interactions must accommodate limited computer literacy, possible motor impairment, and possible visual impairments
- **Anonymity**: No logging of personally identifiable information; no contact mechanisms
- **Timeline**: Lab pilot in 1–2 weeks — keep changes focused and testable

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use neuropsychologist-authored text verbatim | Clinical accuracy and patient-appropriate language require expert authorship | — Pending |
| Read calibration values from existing LNCO.ai calibration app output | Calibration procedure is already solved in another app; only integration needed here | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-03-25 after initialization*
