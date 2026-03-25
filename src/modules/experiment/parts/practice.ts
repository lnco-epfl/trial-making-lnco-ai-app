import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import TrailMakingStimulusPlugin from '../trials/trail-making-stimulus-trial';
import { Timeline } from '../utils/types';

/**
 * Build practice stage 1 (numbers 1–8)
 *
 * Timeline structure:
 *   1. Intro screen (neuropsychologist-authored instruction text)
 *   2. Stimulus trial — 1st attempt (review button shown)
 *   3. Retry message screen (conditional: shown if errors >= 1 OR review button clicked)
 *   4. Re-intro screen + 2nd attempt stimulus (conditional: same condition; no review button)
 *   5. Proceed message screen (always shown)
 */
export const buildPractice1 = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
): Timeline => {
  const timeline: Timeline = [];

  if (!state.isStageEnabled('practice1')) {
    return timeline;
  }

  // Tracks whether the review button was clicked (forces 2nd attempt path)
  let isSecondAttempt = false;
  // Tracks whether the 1st attempt had any errors
  let hadErrors = false;

  // --- Intro screen (1st presentation) ---
  const introScreen = {
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="trail-making-stage-intro">
        <p style="white-space: pre-line;">${i18n.t('TRAIL_MAKING.PRACTICE1_INTRO')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
      </div>
    `,
    choices: [' '],
  };

  // --- 1st attempt stimulus (review button shown) ---
  const firstAttemptStimulus = {
    type: TrailMakingStimulusPlugin,
    stage: 'practice1',
    state,
    provide_feedback: false,
    circle_radius: state.getTrailMakingSettings().circleRadius,
    on_load: () => {
      const displayEl =
        document.getElementById('jspsych-display-element') ?? document.body;
      const reviewBtn = document.createElement('button');
      reviewBtn.id = 'practice1-review-btn';
      reviewBtn.textContent = i18n.t('TRAIL_MAKING.PRACTICE1_REVIEW_BUTTON');
      reviewBtn.style.cssText = `
        display: block;
        margin: 12px auto 0;
        padding: 10px 20px;
        font-size: 0.95em;
        cursor: pointer;
        background-color: transparent;
        color: #4a90e2;
        border: 1px solid #4a90e2;
        border-radius: 4px;
      `;
      reviewBtn.addEventListener('click', () => {
        isSecondAttempt = true;
        reviewBtn.remove();
        if (jsPsych) {
          jsPsych.finishTrial({ stage: 'practice1', reviewRequested: true });
        }
      });
      displayEl.appendChild(reviewBtn);
    },
    on_finish: () => {
      if (updateData && jsPsych) {
        updateData(jsPsych.data.get(), state.getAllSettings());
      }
      const results = state.getStageResults();
      const lastResult = results[results.length - 1];
      if (lastResult) {
        hadErrors =
          lastResult.errorsNonSelfCorrected + lastResult.errorsSelfCorrected >
          0;
      }
    },
  };

  // --- Retry message screen (shown before 2nd attempt) ---
  const retryMessageNode = {
    timeline: [
      {
        type: htmlKeyboardResponse,
        stimulus: () => `
          <div class="trail-making-feedback">
            <p>${i18n.t('TRAIL_MAKING.PRACTICE1_RETRY_MESSAGE')}</p>
            <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
          </div>
        `,
        choices: [' '],
      },
    ],
    conditional_function: () => isSecondAttempt || hadErrors,
  };

  // --- Re-intro screen + 2nd attempt (no review button) ---
  const retryBlock = {
    timeline: [
      {
        type: htmlKeyboardResponse,
        stimulus: `
          <div class="trail-making-stage-intro">
            <p style="white-space: pre-line;">${i18n.t('TRAIL_MAKING.PRACTICE1_INTRO')}</p>
            <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
          </div>
        `,
        choices: [' '],
      },
      {
        type: TrailMakingStimulusPlugin,
        stage: 'practice1',
        state,
        provide_feedback: false,
        circle_radius: state.getTrailMakingSettings().circleRadius,
        on_finish: () => {
          if (updateData && jsPsych) {
            updateData(jsPsych.data.get(), state.getAllSettings());
          }
        },
      },
    ],
    conditional_function: () => isSecondAttempt || hadErrors,
  };

  // --- Proceed message screen (always shown after practice completes) ---
  const proceedMessageScreen = {
    type: htmlKeyboardResponse,
    stimulus: () => `
      <div class="trail-making-feedback">
        <p>${i18n.t('TRAIL_MAKING.PRACTICE1_PROCEED_MESSAGE')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
      </div>
    `,
    choices: [' '],
  };

  timeline.push(introScreen);
  timeline.push(firstAttemptStimulus);
  timeline.push(retryMessageNode);
  timeline.push(retryBlock);
  timeline.push(proceedMessageScreen);

  return timeline;
};

/**
 * Build practice stage 2 (numbers + letters 1–D)
 *
 * Timeline structure:
 *   1. Intro screen (neuropsychologist-authored instruction text)
 *   2. Stimulus trial — 1st attempt (review button shown)
 *   3. Retry message screen (conditional: shown if errors >= 1 OR review button clicked)
 *   4. Re-intro screen + 2nd attempt stimulus (conditional: same condition; no review button)
 *   5. Proceed message screen (always shown)
 */
export const buildPractice2 = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
): Timeline => {
  const timeline: Timeline = [];

  if (!state.isStageEnabled('practice2')) {
    return timeline;
  }

  // Tracks whether the review button was clicked (forces 2nd attempt path)
  let isSecondAttempt = false;
  // Tracks whether the 1st attempt had any errors
  let hadErrors = false;

  // --- Intro screen (1st presentation) ---
  const introScreen = {
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="trail-making-stage-intro">
        <p style="white-space: pre-line;">${i18n.t('TRAIL_MAKING.PRACTICE2_INTRO')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
      </div>
    `,
    choices: [' '],
  };

  // --- 1st attempt stimulus (review button shown) ---
  const firstAttemptStimulus = {
    type: TrailMakingStimulusPlugin,
    stage: 'practice2',
    state,
    provide_feedback: false,
    circle_radius: state.getTrailMakingSettings().circleRadius,
    on_load: () => {
      const displayEl =
        document.getElementById('jspsych-display-element') ?? document.body;
      const reviewBtn = document.createElement('button');
      reviewBtn.id = 'practice2-review-btn';
      reviewBtn.textContent = i18n.t('TRAIL_MAKING.PRACTICE2_REVIEW_BUTTON');
      reviewBtn.style.cssText = `
        display: block;
        margin: 12px auto 0;
        padding: 10px 20px;
        font-size: 0.95em;
        cursor: pointer;
        background-color: transparent;
        color: #4a90e2;
        border: 1px solid #4a90e2;
        border-radius: 4px;
      `;
      reviewBtn.addEventListener('click', () => {
        isSecondAttempt = true;
        reviewBtn.remove();
        if (jsPsych) {
          jsPsych.finishTrial({ stage: 'practice2', reviewRequested: true });
        }
      });
      displayEl.appendChild(reviewBtn);
    },
    on_finish: () => {
      if (updateData && jsPsych) {
        updateData(jsPsych.data.get(), state.getAllSettings());
      }
      const results = state.getStageResults();
      const lastResult = results[results.length - 1];
      if (lastResult) {
        hadErrors =
          lastResult.errorsNonSelfCorrected + lastResult.errorsSelfCorrected >
          0;
      }
    },
  };

  // --- Retry message screen (shown before 2nd attempt) ---
  const retryMessageNode = {
    timeline: [
      {
        type: htmlKeyboardResponse,
        stimulus: () => `
          <div class="trail-making-feedback">
            <p>${i18n.t('TRAIL_MAKING.PRACTICE2_RETRY_MESSAGE')}</p>
            <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
          </div>
        `,
        choices: [' '],
      },
    ],
    conditional_function: () => isSecondAttempt || hadErrors,
  };

  // --- Re-intro screen + 2nd attempt (no review button) ---
  const retryBlock = {
    timeline: [
      {
        type: htmlKeyboardResponse,
        stimulus: `
          <div class="trail-making-stage-intro">
            <p style="white-space: pre-line;">${i18n.t('TRAIL_MAKING.PRACTICE2_INTRO')}</p>
            <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
          </div>
        `,
        choices: [' '],
      },
      {
        type: TrailMakingStimulusPlugin,
        stage: 'practice2',
        state,
        provide_feedback: false,
        circle_radius: state.getTrailMakingSettings().circleRadius,
        on_finish: () => {
          if (updateData && jsPsych) {
            updateData(jsPsych.data.get(), state.getAllSettings());
          }
        },
      },
    ],
    conditional_function: () => isSecondAttempt || hadErrors,
  };

  // --- Proceed message screen (always shown after practice completes) ---
  const proceedMessageScreen = {
    type: htmlKeyboardResponse,
    stimulus: () => `
      <div class="trail-making-feedback">
        <p>${i18n.t('TRAIL_MAKING.PRACTICE2_PROCEED_MESSAGE')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
      </div>
    `,
    choices: [' '],
  };

  timeline.push(introScreen);
  timeline.push(firstAttemptStimulus);
  timeline.push(retryMessageNode);
  timeline.push(retryBlock);
  timeline.push(proceedMessageScreen);

  return timeline;
};
