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
 *   2. Stimulus trial — 1st attempt
 *   3. Retry message screen (conditional: shown if errors >= 1)
 *   4. Re-intro screen + 2nd attempt stimulus (conditional: same condition)
 *   5. Proceed message screen (always shown)
 */
export const buildPractice1 = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
  screenScale?: number,
): Timeline => {
  const timeline: Timeline = [];

  if (!state.isStageEnabled('practice1')) {
    return timeline;
  }

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

  // --- 1st attempt stimulus ---
  const firstAttemptStimulus = {
    type: TrailMakingStimulusPlugin,
    stage: 'practice1',
    state,
    provide_feedback: false,
    circle_radius: state.getTrailMakingSettings().circleRadius,
    screen_scale: screenScale,
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
    conditional_function: () => hadErrors,
  };

  // --- Re-intro screen + 2nd attempt ---
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
        screen_scale: screenScale,
        on_finish: () => {
          if (updateData && jsPsych) {
            updateData(jsPsych.data.get(), state.getAllSettings());
          }
        },
      },
    ],
    conditional_function: () => hadErrors,
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
 *   2. Stimulus trial — 1st attempt
 *   3. Retry message screen (conditional: shown if errors >= 1)
 *   4. Re-intro screen + 2nd attempt stimulus (conditional: same condition)
 *   5. Proceed message screen (always shown)
 */
export const buildPractice2 = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
  screenScale?: number,
): Timeline => {
  const timeline: Timeline = [];

  if (!state.isStageEnabled('practice2')) {
    return timeline;
  }

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

  // --- 1st attempt stimulus ---
  const firstAttemptStimulus = {
    type: TrailMakingStimulusPlugin,
    stage: 'practice2',
    state,
    provide_feedback: false,
    circle_radius: state.getTrailMakingSettings().circleRadius,
    screen_scale: screenScale,
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
    conditional_function: () => hadErrors,
  };

  // --- Re-intro screen + 2nd attempt ---
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
        screen_scale: screenScale,
        on_finish: () => {
          if (updateData && jsPsych) {
            updateData(jsPsych.data.get(), state.getAllSettings());
          }
        },
      },
    ],
    conditional_function: () => hadErrors,
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
