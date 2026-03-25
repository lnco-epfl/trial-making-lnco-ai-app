# Phase 1: Patient Instructions - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace all participant-facing instruction text in the Trail Making Task with neuropsychologist-authored EN/FR content. This includes structural additions (Start/End circle labelling, conditional post-practice feedback, review-instructions button) that the document implies. The goal: elderly PD patients with limited computer experience can self-administer the task correctly without any researcher support.

</domain>

<decisions>
## Implementation Decisions

### Instruction text source
- **D-01:** Use the neuropsychologist-authored text verbatim from `docs/20260210 - Trail Making Task Instructions_JP_Clean_Reorganised.docx` (full text extracted and captured in this CONTEXT.md — see Instruction Text section below)
- **D-02:** Both EN and FR must be updated. All changes go into `src/langs/en.json` and `src/langs/fr.json` under the `translations.TRAIL_MAKING` namespace

### Welcome screen
- **D-03:** Keep a brief welcome intro on the first screen (fullscreen entry). The document title "Trail Making Test (TMT)" becomes the heading. A short welcome sentence is added before the Start button — not the generic "Thank you for participating in this study" (too clinical/formal), but something warm and simple appropriate for PD patients

### Start/End circle labelling
- **D-04:** Circle 1 is visually marked as the starting point with a "Start" label/indicator. The last circle (8 for practice1, 25 for task1, D for practice2, 13 for task2) is marked as the ending point with an "End" label/indicator
- **D-05:** Implementation: the stimulus plugin (`trail-making-stimulus-trial.ts`) should render "Start" below/inside circle 1 and "End" below/inside the final circle. Visual style: small label text, distinct colour (e.g. green for Start, red for End) — exact style at Claude's discretion but must be clearly visible at all circle sizes

### Conditional post-practice text
- **D-06:** After each practice stage, show different text depending on whether the participant made ≥1 error:
  - **If errors ≥ 1 (first attempt):** "Don't worry, we'll repeat the training once more." → automatically restart practice (second attempt)
  - **If successful OR after 2nd attempt regardless of errors:** "Now you'll perform the actual test." → proceed to main task
- **D-07:** The undo/retry logic is already tracked in `ExperimentState` (`errorsNonSelfCorrected` + `errorsSelfCorrected`). Use `stageResults` from `state.getStageResults()` to determine whether errors occurred
- **D-08:** Maximum 1 automatic retry per practice stage. After the 2nd attempt, always proceed regardless of result

### Review instructions button
- **D-09:** Each practice stage includes a "Review instructions" button visible during (or just before) the practice trial. Clicking it shows the instruction text again and restarts the practice from scratch (counts as the 2nd attempt)
- **D-10:** The button text: EN "If needed, click here to review the instructions and do the training once more." / FR "Si vous en avez besoin, cliquez ici pour revoir les instructions et faire l'entraînement une fois de plus."
- **D-11:** The button is only available on the first attempt. After the second attempt (whether retry was triggered by errors or by the review button), it disappears

### Completion/feedback screens
- **D-12:** Task completion messages use the neuropsychologist's text:
  - After Part A (task1): "Thank you, this part of the test is finished. We will now move on to the second part." / FR: "Merci, cette partie du test est faite, nous allons passer à la 2ème partie."
  - After Part B (task2): "Thank you, the test is now complete." / FR: implied from document pattern
- **D-13:** Practice completion screens show the conditional text per D-06 (not a generic "Practice Complete" title)

### What stays the same
- **D-14:** UI control strings (`PRESS_TO_BEGIN`, `PRESS_TO_CONTINUE`, `DONE_BUTTON`, `RETRY_BUTTON`, timing feedback `TIME_TAKEN`, `SECONDS`, error counts) — these are functional labels, not instructions, and do not need to change
- **D-15:** `START_BUTTON` ("Start Fullscreen") stays as-is — it is a browser API affordance, not instructional text

</decisions>

<specifics>
## Instruction Text (Extracted from Word Document)

### ENGLISH

**Welcome screen:**
- Title: "Trail Making Test (TMT)"
- Welcome: [brief welcome, Claude's discretion — warm and accessible for PD patients]
- Button: "Start Fullscreen"

**Part A — Practice 1 intro (before practice1 trial):**
> "We will start with the instructions and a short training. Read and listen carefully.
> You can see here circles with numbers from 1 to 8. Your goal is to connect all numbers by clicking on the numbers in the correct numerical order to connect them. The starting point is marked at 1 (Start) and the ending point at 8 (End). Connect the numbers from 1 to 2, from 2 to 3, and so on until number 8 (End). A line will be drawn between circles as you connect them.
> Important: If you make a mistake, click the last circle again to reset it, then continue with the correct sequence.
> Work as quickly and accurately as possible. Ready? Go ahead and try. This is a training before we start the actual test."

**Review button text (Part A):**
> "If needed, click here to review the instructions and do the training once more."

**Post-practice Part A — if errors (auto-retry):**
> "OK! Don't worry, we'll repeat the training once more."

**Post-practice Part A — if successful or after 2nd attempt:**
> "OK! Now you'll perform the actual test."

**Part A — Task 1 ready screen (before task1 trial):**
> "You now see numbers from 1 to 25. The starting point is marked at 1 (Start) and the ending point at 25 (End). Just like during the training, you must connect the numbers to each other in ascending order until number 25 (End). Remember: Work as quickly and accurately as possible. The time for completing the test will be measured.
> Important: If you make a mistake, click on the last circle again to reset it, then continue with the correct sequence.
> Are you ready? Go ahead."

**Part A — Task 1 completion:**
> "Thank you, this part of the test is finished. We will now move on to the second part."

**Part B — Practice 2 intro (before practice2 trial):**
> "This part is slightly different. We will start with a short training with the instructions. Read and listen carefully.
> You can see here again circles with numbers but also with letters. Your goal is to connect one number with one letter by following the numerical and alphabetical order. The starting point is marked at 1 (Start) and the ending point at D (End). Begin by clicking on 1 (Start), then A, then from A to 2, from 2 to B, and so on until the end. A line will be drawn between circles as you connect them. Remember to alternate one number with one letter in increasing and alphabetical order.
> Important: If you make a mistake, click the last circle again to reset it, then continue with the correct sequence.
> Work as quickly and accurately as possible. Ready? Go ahead and try. It's a training."

**Review button text (Part B):**
> "If needed, click here to review the instructions and do the training once more."

**Post-practice Part B — if errors (auto-retry):**
> "OK! Don't worry, we'll repeat the training once more."

**Post-practice Part B — if successful or after 2nd attempt:**
> "OK! Now you'll perform the actual test."

**Part B — Task 2 ready screen (before task2 trial):**
> "You now see the numbers and letters scattered. The starting point is marked at 1 (Start) and the ending point at 13 (End). Just like during the training, you must connect the numbers and letters the same way, that is, first a number, then a letter until the end. Remember to alternate one number with one letter in increasing and alphabetical order. Click on 1 (Start), then A, from A to 2, from 2 to B, and so on until the end. A line will be drawn between circles as you connect them.
> Important: If you make a mistake, click the last circle again to reset it, then continue with the correct sequence.
> Work as quickly and accurately as possible. The time taken to complete the test will be measured.
> Ready? Go ahead."

**Final completion:**
> "OK, thank you, the test is now complete."

---

### FRENCH

**Welcome screen:**
- Titre : "Trail Making Test (TMT)"
- Bienvenue : [court message de bienvenue, à la discrétion de Claude — chaleureux et accessible pour les patients Parkinson]
- Bouton : "Démarrer le plein écran"

**Partie A — Pratique 1 intro (avant l'essai practice1) :**
> "Nous allons commencer par les instructions et par un exemple pour vous entraîner à faire ce test. Lisez et écoutez attentivement ces instructions.
> Vous verrez des cercles dans lesquels sont inscrits les chiffres de 1 à 8. Votre objectif est de cliquer sur les chiffres pour les relier dans le bon ordre, c'est-à-dire l'ordre croissant. Le début est indiqué au chiffre 1 (Début) et la fin au chiffre 8 (Fin). Vous allez donc relier de 1 à 2, de 2 à 3, et ainsi de suite jusqu'au numéro 8. Une ligne sera tracée entre les cercles au fur et à mesure que vous les reliez.
> Travaillez aussi rapidement et précisément que possible. Êtes-vous prêt(e) ? Allez-y ! C'est l'entraînement."

**Bouton de révision (Partie A) :**
> "Si vous en avez besoin, cliquez ici pour revoir les instructions et faire l'entraînement une fois de plus."

**Post-pratique Partie A — si erreurs (réessai automatique) :**
> "OK ! Ne vous inquiétez pas, vous allez répéter l'entraînement."

**Post-pratique Partie A — si réussi ou après 2e tentative :**
> "Très bien ! Vous allez maintenant commencer le test."

**Partie A — Écran prêt Tâche 1 (avant l'essai task1) :**
> "Vous voyez maintenant des numéros de 1 à 25. Vous devez commencer au 1 (Début) et terminer au 25 (Fin). Comme pendant l'entraînement, vous devez relier tous les numéros entre eux dans l'ordre croissant jusqu'au numéro 25 (Fin).
> Important : Si vous faites une erreur, cliquez à nouveau sur le dernier cercle pour le décocher ou l'annuler, puis continuez avec la séquence correcte.
> Travaillez aussi rapidement et précisément que possible. Le temps que vous mettrez à compléter le test sera enregistré. Êtes-vous prêt(e) ? Allez-y !"

**Partie A — Fin de Tâche 1 :**
> "Merci, cette partie du test est faite, nous allons passer à la 2ème partie."

**Partie B — Pratique 2 intro (avant l'essai practice2) :**
> "Cette partie est légèrement différente. Nous allons commencer par un court entraînement avec les instructions. Lisez et écoutez attentivement.
> Vous voyez ici à nouveau des cercles avec des numéros mais aussi des lettres. Votre objectif est de relier un numéro à une lettre en suivant l'ordre numérique et alphabétique. Le début est indiqué au 1 (Début) et la fin au D (Fin). Commencez par cliquer sur 1 (Début), puis sur A, ensuite de A à 2, de 2 à B, de B à 3 et ainsi de suite jusqu'à la fin. Une ligne sera tracée entre les cercles au fur et à mesure que vous les reliez. N'oubliez pas, les cercles sont donc connectés en alternance, un chiffre-une lettre, un chiffre-une lettre dans l'ordre croissant et alphabétique.
> Travaillez aussi rapidement et précisément que possible. Êtes-vous prêt(e) ? Allez-y ! C'est l'entraînement."

**Bouton de révision (Partie B) :**
> "Si vous en avez besoin, cliquez ici pour revoir les instructions et faire l'entraînement une fois de plus."

**Post-pratique Partie B — si erreurs (réessai automatique) :**
> "OK ! Ne vous inquiétez pas, vous allez répéter l'entraînement."

**Post-pratique Partie B — si réussi ou après 2e tentative :**
> "Très bien ! Vous allez maintenant commencer le test."

**Partie B — Écran prêt Tâche 2 (avant l'essai task2) :**
> "Vous voyez maintenant les chiffres et les lettres éparpillés. Le début est indiqué au 1 (Début) et la fin au 13 (Fin). N'oubliez pas, les cercles sont donc connectés en alternance, un chiffre-une lettre, un chiffre-une lettre dans l'ordre croissant et alphabétique. Commencez par cliquer sur 1 (Début), puis sur A, ensuite de A à 2, puis de 2 à B, de B à 3 et continuez comme ça jusqu'au 13 (Fin). Une ligne se dessinera automatiquement entre les cercles au fur et à mesure que vous les reliez.
> Important : Si vous faites une erreur, cliquez à nouveau sur le dernier cercle pour le décocher ou l'annuler, puis continuez avec la séquence correcte.
> Travaillez aussi rapidement et précisément que possible. Le temps que vous mettrez à compléter le test sera enregistré. Êtes-vous prêt(e) ? Allez-y !"

**Fin complète :**
> "OK, merci, le test est maintenant terminé."

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Instruction text source
- `docs/20260210 - Trail Making Task Instructions_JP_Clean_Reorganised.docx` — Full neuropsychologist-authored instruction text (EN + FR). Text extracted verbatim in this CONTEXT.md — see Specifics section above. Agents should use the extracted text here; the .docx cannot be read programmatically.

### Existing instruction screens (files to modify)
- `src/modules/experiment/parts/introduction.ts` — Welcome + instruction screens (`experimentBeginTrial`, `taskInstructions`) — these need to be rewritten
- `src/modules/experiment/parts/practice.ts` — Practice stage builders (`buildPractice1`, `buildPractice2`) — add conditional retry logic and review button
- `src/modules/experiment/parts/task-core.ts` — Task ready and completion screens (`buildTask1`, `buildTask2`) — update text, add conditional completion message for task1
- `src/langs/en.json` — English translations under `translations.TRAIL_MAKING` namespace
- `src/langs/fr.json` — French translations under `translations.TRAIL_MAKING` namespace

### State and results (for conditional logic)
- `src/modules/experiment/jspsych/experiment-state-class.ts` — `ExperimentState` class: `getStageResults()` returns `TrailMakingResult[]` with `errorsSelfCorrected` and `errorsNonSelfCorrected`; `undoLastClick()` for undo; `startStage()` to restart a stage

### Stimulus plugin (for Start/End labels)
- `src/modules/experiment/trials/trail-making-stimulus-trial.ts` — Custom jsPsych plugin rendering SVG canvas with circles; this is where Start/End visual labels should be added to circle rendering

### Layout data (to know which circle is last)
- `src/modules/experiment/utils/constants.ts` — `PRACTICE1_FIELD`, `TASK1_FIELD`, `PRACTICE2_FIELD`, `TASK2_FIELD` field definitions with circle coordinates and labels

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ExperimentState.getStageResults()` — returns completed stage results including error counts; use after `on_finish` callback to determine retry path
- `ExperimentState.startStage(stage)` — resets click index and start time; call to restart a practice stage
- `i18n.t('TRAIL_MAKING.KEY')` — i18next call pattern used throughout; new keys follow same pattern
- `jsPsychHtmlKeyboardResponse` + `FullscreenPlugin` — existing plugin types used for instruction screens

### Established Patterns
- Timeline builders return `Timeline` (array of jsPsych trial objects); conditional logic is implemented as JS before pushing trials
- i18n strings are all in `src/langs/en.json` and `src/langs/fr.json` under `translations.TRAIL_MAKING`
- Stimulus plugin uses `on_finish` callback to save data; retry logic would push an additional `TrailMakingStimulusPlugin` trial conditionally
- The `provide_feedback` parameter on `TrailMakingStimulusPlugin` is currently unused for conditional branching — retry logic needs to be in the timeline builder, not the plugin

### Integration Points
- `buildPractice1` / `buildPractice2` in `practice.ts` are called from `experiment.ts` — the retry loop must stay within those builders
- Start/End labels: the stimulus plugin builds SVG circles; add label rendering in the circle-drawing logic, checking if `label === layout.sequence[0]` (Start) or `label === layout.sequence[layout.sequence.length - 1]` (End)
- The existing undo button already renders in the stimulus plugin — the "Review instructions" button would be a separate UI element, likely rendered outside the jsPsych canvas (in the DOM directly, similar to the fullscreen button in `experiment.ts`)

</code_context>

<deferred>
## Deferred Ideas

- Audio instructions (the document says "Read and listen carefully" implying audio exists in the original — audio support is out of scope for Phase 1; text-only implementation)
- Timer display / discontinuation at 120s (Part A) and 320s (Part B) — the document mentions time limits; these are data collection concerns handled by the researcher, not participant-facing features for Phase 1
- Visual arrow/blink animation on Start circle — the document says "[INDICATE WITH AN ARROW OR FILL IT, OR MAKE IT BLINK]"; basic "(Start)" label is sufficient for Phase 1, animation is a nice-to-have

</deferred>

---

*Phase: 01-patient-instructions*
*Context gathered: 2026-03-25*
