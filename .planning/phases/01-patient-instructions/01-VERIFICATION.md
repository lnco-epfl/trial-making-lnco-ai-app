---
phase: 01-patient-instructions
verified: 2026-03-25T14:30:00Z
status: gaps_found
score: 11/12 must-haves verified
gaps:
  - truth: "All instruction screens display the neuropsychologist-authored French text verbatim — including text shown during the stimulus trial itself"
    status: partial
    reason: "trail-making-stimulus-trial.ts contains getInstructionText() (lines 184–197) that returns hardcoded English strings ('Click the circles in order: 1, 2, 3...') and renders them via instructionDiv on every stage. This element is visible during the trial in both languages. FR-language participants see an English instruction line inside the stimulus frame while performing the task. Plan 01-02 explicitly deferred this to plan 01-03 ('do not change the instruction text in getInstructionText() — that function will be removed or updated in plan 01-03'), but plan 01-03 did not address it."
    artifacts:
      - path: "src/modules/experiment/trials/trail-making-stimulus-trial.ts"
        issue: "getInstructionText() at lines 184–197 returns hardcoded English strings for all 4 stages; instructionDiv at line 696 renders this text unconditionally regardless of language"
    missing:
      - "Either remove getInstructionText() and instructionDiv (the neuropsychologist intro screens already show full instructions before each trial), or replace it with i18n keys in both en.json and fr.json"
human_verification:
  - test: "French language end-to-end walkthrough"
    expected: "Setting ?lang=fr displays all text in French throughout the full trial flow including the text displayed inside the stimulus frame during circle-clicking"
    why_human: "Cannot run jsPsych in a headless context; visual confirmation of the per-trial instruction line language requires a browser"
  - test: "Conditional retry flow with deliberate errors"
    expected: "After making >= 1 error on the first practice1 attempt: retry message appears, intro re-displays, second trial begins without review button. After second attempt: proceed message always appears."
    why_human: "Runtime jsPsych conditional_function closures over isSecondAttempt and hadErrors cannot be exercised without running the experiment engine in a browser"
  - test: "Review button click mid-trial"
    expected: "Clicking the review button during the first practice attempt ends the trial immediately (via jsPsych.finishTrial), shows the retry message, re-shows the intro, then runs the second attempt without a review button"
    why_human: "Requires interactive browser session to trigger the on_load DOM injection and the click event on the review button"
---

# Phase 1: Patient Instructions Verification Report

**Phase Goal:** Elderly PD patients with limited computer experience can read, understand, and follow task instructions entirely on their own
**Verified:** 2026-03-25T14:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All TRAIL_MAKING keys in en.json contain neuropsychologist-authored English text verbatim | VERIFIED | All 16 required keys present; TASK1_COMPLETE_MESSAGE = "Thank you, this part of the test is finished..." (exact match); PRACTICE1_RETRY_MESSAGE = "OK! Don't worry..."; START_LABEL = "Start"; both JSON files are syntactically valid |
| 2 | All TRAIL_MAKING keys in fr.json contain neuropsychologist-authored French text verbatim | VERIFIED | All 16 required keys present; TASK1_COMPLETE_MESSAGE = "Merci, cette partie du test est faite..."; PRACTICE1_RETRY_MESSAGE = "OK ! Ne vous inquiétez pas..."; START_LABEL = "Début"; END_LABEL = "Fin" |
| 3 | Both files include all new keys: conditional retry messages, review button text, Part A and Part B intro texts, task ready and completion texts | VERIFIED | Keys verified: PRACTICE1_INTRO, PRACTICE1_REVIEW_BUTTON, PRACTICE1_RETRY_MESSAGE, PRACTICE1_PROCEED_MESSAGE, PRACTICE2_INTRO, PRACTICE2_REVIEW_BUTTON, PRACTICE2_RETRY_MESSAGE, PRACTICE2_PROCEED_MESSAGE, TASK1_READY_MESSAGE, TASK1_COMPLETE_MESSAGE, TASK2_READY_MESSAGE, TASK2_COMPLETE_MESSAGE, START_LABEL, END_LABEL — present in both files |
| 4 | Language switch (?lang=en / ?lang=fr) will surface the correct language text through i18next because keys are present in both files | VERIFIED | Keys confirmed present in both `translations.TRAIL_MAKING` namespaces in both files; i18n is initialised from ?lang= param (i18n.ts); all code uses i18n.t('TRAIL_MAKING.*') calls |
| 5 | Numbers-only (Part A) and numbers+letters (Part B) variants have clearly differentiated instruction text in both languages | VERIFIED | PRACTICE1_INTRO references "numbers from 1 to 8" / "1 à 8"; PRACTICE2_INTRO references "numbers but also with letters" / "numéros mais aussi des lettres"; TASK1_READY_MESSAGE references "numbers from 1 to 25"; TASK2_READY_MESSAGE references "numbers and letters scattered" |
| 6 | Welcome screen shows 'Trail Making Test (TMT)' heading and warm accessible message | VERIFIED | introduction.ts line 16: `i18n.t('TRAIL_MAKING.WELCOME_TITLE')` = "Trail Making Test (TMT)"; line 17: `i18n.t('TRAIL_MAKING.WELCOME_MESSAGE')` = "Welcome. This test helps us understand how your brain works. Please read each instruction carefully before you begin." |
| 7 | Introduction.ts contains only the welcome screen — generic instruction screens removed | VERIFIED | File is 32 lines total; no taskInstructions() function; buildIntroduction returns `[experimentBeginTrial()]` only; comment confirms intent |
| 8 | Practice1 intro screen shows full Part A instruction text referencing numbers 1–8 sequence | VERIFIED | practice.ts line 42: `i18n.t('TRAIL_MAKING.PRACTICE1_INTRO')` — en.json value starts "We will start with the instructions and a short training" and references "numbers from 1 to 8" |
| 9 | Conditional retry logic implemented in practice.ts: isSecondAttempt + hadErrors flags, conditional_function nodes, review button on 1st attempt absent on 2nd | VERIFIED | practice.ts: `isSecondAttempt` (line 33), `hadErrors` (line 35), `conditional_function: () => isSecondAttempt \|\| hadErrors` (lines 110, 139), `on_load` injects `practice1-review-btn` for 1st attempt only, `retryBlock` has no review button; same pattern for practice2 |
| 10 | task-core.ts: task ready screens show neuropsychologist Part A/B text; completion screens show correct messages; no TIME_TAKEN metric display | VERIFIED | task-core.ts line 31: `TASK1_READY_MESSAGE`, line 55: `TASK1_COMPLETE_MESSAGE`, line 85: `TASK2_READY_MESSAGE`, line 109: `TASK2_COMPLETE_MESSAGE`; no occurrence of TIME_TAKEN in file |
| 11 | Start/End labels render on all four stages using sequence-based circle identification with correct colors | VERIFIED | trail-making-stimulus-trial.ts lines 648–685: no practice-only guard; `layout.sequence[0]` / `layout.sequence[layout.sequence.length - 1]`; i18n.t('TRAIL_MAKING.START_LABEL') and END_LABEL; #228B22 (green) for Start, #DC143C (red) for End; both labels positioned below circles at `circleRadius + 6`px |
| 12 | All instruction screens use only FR text when ?lang=fr is set — including text shown inside the stimulus frame | PARTIAL | The intro/ready/completion screens are fully i18n'd. However, trail-making-stimulus-trial.ts line 184–197 contains `getInstructionText()` returning hardcoded English strings for all 4 stages; this text is rendered as `instructionDiv` inside the stimulus frame (line 696–698), visible to participants during the trial regardless of language |

**Score:** 11/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/langs/en.json` | English i18n strings for all TRAIL_MAKING instruction screens | VERIFIED | All 16 required keys present under translations.TRAIL_MAKING; verbatim neuropsychologist text confirmed on key-values spot-checked |
| `src/langs/fr.json` | French i18n strings for all TRAIL_MAKING instruction screens | VERIFIED | All 16 required keys present under translations.TRAIL_MAKING; verbatim neuropsychologist text confirmed |
| `src/modules/experiment/parts/introduction.ts` | Welcome screen using TRAIL_MAKING.WELCOME_TITLE and WELCOME_MESSAGE | VERIFIED | 32-line file; contains WELCOME_TITLE and WELCOME_MESSAGE; no taskInstructions() |
| `src/modules/experiment/parts/practice.ts` | Practice builders with conditional retry and review-button logic | VERIFIED | Contains isSecondAttempt, hadErrors, conditional_function nodes, review buttons for both practice stages |
| `src/modules/experiment/parts/task-core.ts` | Task ready and completion screens using new i18n keys | VERIFIED | Contains TASK1_READY_MESSAGE, TASK1_COMPLETE_MESSAGE, TASK2_READY_MESSAGE, TASK2_COMPLETE_MESSAGE; no TIME_TAKEN |
| `src/modules/experiment/trials/trail-making-stimulus-trial.ts` | Start/End labels on all 4 stages via sequence-based identification | VERIFIED (with warning) | Start/End labels implemented correctly for all stages. Residual issue: getInstructionText() at lines 184–197 remains with hardcoded English and is rendered unconditionally |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `practice.ts` | `src/langs/en.json` | `i18n.t('TRAIL_MAKING.PRACTICE1_INTRO')` | WIRED | Pattern found at lines 42, 120 in practice.ts; key present in en.json |
| `practice.ts` | `ExperimentState.getStageResults()` | `state.getStageResults()` in on_finish | WIRED | Lines 86 (practice1) and 238 (practice2); reads last result for hadErrors calculation |
| `task-core.ts` | `src/langs/en.json` | `i18n.t('TRAIL_MAKING.TASK1_COMPLETE_MESSAGE')` | WIRED | Pattern found at line 55 in task-core.ts; key present in en.json |
| `trail-making-stimulus-trial.ts` | `src/langs/en.json` | `t('TRAIL_MAKING.START_LABEL')` / `t('TRAIL_MAKING.END_LABEL')` | WIRED | Lines 667 and 683 in stimulus trial; keys present in both en.json and fr.json |
| `getInstructionText()` | (no i18n) | Hardcoded strings — bypasses i18n | NOT WIRED | Function at lines 184–197 does not use i18n.t(); rendered as instructionDiv line 696 |

### Data-Flow Trace (Level 4)

Not applicable — this phase produces i18n text content and control flow, not data-rendering components with DB/API data sources.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| en.json is valid JSON | `node -e "JSON.parse(require('fs').readFileSync('src/langs/en.json','utf8'))"` | Exit 0 | PASS |
| fr.json is valid JSON | `node -e "JSON.parse(require('fs').readFileSync('src/langs/fr.json','utf8'))"` | Exit 0 | PASS |
| TASK1_COMPLETE_MESSAGE exact text | Node evaluation | "Thank you, this part of the test is finished. We will now move on to the second part." | PASS |
| FR TASK2_COMPLETE_MESSAGE | Node evaluation | "OK, merci, le test est maintenant terminé." | PASS |
| FR START_LABEL | Node evaluation | "Début" | PASS |
| EN START_LABEL | Node evaluation | "Start" | PASS |
| Full French retry flow | Browser required | — | SKIP (needs running browser) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| INSTR-01 | 01-01, 01-02, 01-03 | All instruction screens display the neuropsychologist-authored English text verbatim | SATISFIED | en.json TRAIL_MAKING section contains all required keys with verbatim text; introduction.ts, practice.ts, task-core.ts all reference these keys via i18n.t(). Partial caveat: getInstructionText() in stimulus plugin is still hardcoded English |
| INSTR-02 | 01-01, 01-03 | All instruction screens display the neuropsychologist-authored French text verbatim | PARTIAL | fr.json TRAIL_MAKING section contains all required keys with verbatim FR text; all screens use i18n keys. Gap: getInstructionText() in stimulus plugin outputs English regardless of language |
| INSTR-03 | 01-01, 01-03 | Instruction text appropriate for elderly PD patients — simple vocabulary, no jargon | SATISFIED | Text uses plain vocabulary ("connect the circles", "work as quickly as possible"), avoids technical terms; warm tone ("Don't worry", "Trail Making Test (TMT)"). Needs human validation for final confirmation |
| INSTR-04 | 01-01, 01-02, 01-03 | Numbers-only and numbers+letters variants have distinct, differentiated instructions | SATISFIED | PRACTICE1_INTRO and TASK1_READY_MESSAGE reference numbers only; PRACTICE2_INTRO and TASK2_READY_MESSAGE explicitly reference letters alternating with numbers in both languages |
| INSTR-05 | 01-01, 01-03 | Language selection (?lang=en / ?lang=fr) correctly switches all instruction text | PARTIAL | All screens use i18n.t() with keys present in both language files. Gap: getInstructionText() in stimulus plugin outputs hardcoded English only, making this one element non-switchable |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `trail-making-stimulus-trial.ts` | 184–197 | `getInstructionText()` returns hardcoded English strings for all 4 stages | Warning | FR-language participants see an English instruction line ("Click the circles in order: 1, 2, 3...") displayed inside the stimulus frame during the trial. The plan (01-02) deferred this function to plan 01-03 for removal/replacement; plan 01-03 did not address it. Not a blocker because the neuropsychologist intro screens before each trial already show complete instructions in the correct language, and this secondary line is brief. However it is a visible bilingualism failure for INSTR-02 and INSTR-05. |

### Human Verification Required

#### 1. French Language Stimulus Frame Text

**Test:** Open the app with `?lang=fr`, complete the welcome screen, begin practice1, and observe the instruction text displayed inside the stimulus frame (above the circle field) during the trial.
**Expected:** Either no instruction text is shown (if getInstructionText() is removed), or the text is in French.
**Why human:** Cannot run jsPsych trials in a headless environment; requires a browser.

#### 2. Conditional Retry Flow

**Test:** With `?lang=en`, deliberately click circles out of order in practice1, then click Done. Verify: (a) retry message "OK! Don't worry..." appears, (b) the instructions re-display, (c) the second trial begins without a review button.
**Expected:** Retry flow executes in the order described above.
**Why human:** Requires running jsPsych in a browser with user interaction to trigger `on_finish`, `isSecondAttempt`/`hadErrors` closure evaluation, and `conditional_function` evaluation at runtime.

#### 3. Review Button Mid-Trial

**Test:** During first practice1 attempt, click "If needed, click here to review the instructions..." button.
**Expected:** Trial ends immediately, retry message appears, instructions re-display, second attempt begins without the review button.
**Why human:** Requires DOM injection via `on_load`, button click interaction, and `jsPsych.finishTrial()` invocation in a live browser.

#### 4. French Complete Walkthrough

**Test:** Set `?lang=fr`, navigate through welcome → practice1 intro → practice1 trial → proceed message → task1 ready → task1 trial → task1 complete. Verify all text is in French throughout.
**Expected:** Every screen displays only French text. The only known exception is the `getInstructionText()` line inside the stimulus frame (see gap above).
**Why human:** Full end-to-end flow requires browser execution.

### Gaps Summary

One gap blocks full verification of INSTR-02 and INSTR-05:

The `getInstructionText()` function in `trail-making-stimulus-trial.ts` (lines 184–197) was retained from the original codebase. It produces hardcoded English text for all four stages and is rendered in an `instructionDiv` appended to the stimulus display on every trial (line 696–698). Plan 01-02 explicitly noted this function "will be removed or updated in plan 01-03." Plan 01-03 did not address it.

The impact is limited because: (1) the neuropsychologist-authored intro screens before each trial provide complete instructions in the correct language, so participants are not left without guidance; (2) the in-trial text is brief and redundant. However, a French-language user will see an English instruction line inside the trial frame, which is a visible bilingualism failure inconsistent with INSTR-02 ("all instruction screens display the neuropsychologist-authored French text verbatim") and INSTR-05 ("language selection correctly switches all instruction text").

**Recommended fix:** Remove `getInstructionText()` and the `instructionDiv` block entirely. The per-stage intro screens already provide all necessary instructions. If a brief reminder is desired inside the trial frame, add `TRAIL_MAKING.IN_TRIAL_HINT_PRACTICE1` / `PRACTICE2` keys to both language files and replace the hardcoded function.

---

_Verified: 2026-03-25T14:30:00Z_
_Verifier: Claude (gsd-verifier)_
