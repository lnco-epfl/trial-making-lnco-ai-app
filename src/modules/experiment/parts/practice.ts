import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import TrailMakingStimulusPlugin from '../trials/trail-making-stimulus-trial';
import { Timeline } from '../utils/types';

/**
 * Build practice stage 1 (numbers 1-8)
 */
export const buildPractice1 = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
): Timeline => {
  const timeline: Timeline = [];

  // Skip if not enabled
  if (!state.isStageEnabled('practice1')) {
    return timeline;
  }

  // Intro screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="trail-making-stage-intro">
        <h2>${i18n.t('TRAIL_MAKING.PRACTICE1_TITLE')}</h2>
        <p>${i18n.t('TRAIL_MAKING.PRACTICE1_MESSAGE')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
      </div>
    `,
    choices: [' '],
  });

  // Create trial (stage initialization is now done in plugin)
  timeline.push({
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
  });

  // Feedback screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: () => {
      const results = state.getStageResults();
      const lastResult = results[results.length - 1];
      return `
        <div class="trail-making-feedback">
          <h2>${i18n.t('TRAIL_MAKING.PRACTICE_COMPLETE_TITLE')}</h2>
          <p><strong>${i18n.t('TRAIL_MAKING.TIME_TAKEN')}</strong> ${lastResult.timeTaken.toFixed(2)} ${i18n.t('TRAIL_MAKING.SECONDS')}</p>
          <p><strong>${i18n.t('TRAIL_MAKING.ERRORS_SELF_CORRECTED')}</strong> ${lastResult.errorsSelfCorrected}</p>
          <p><strong>${i18n.t('TRAIL_MAKING.ERRORS_NON_SELF_CORRECTED')}</strong> ${lastResult.errorsNonSelfCorrected}</p>
          <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
        </div>
      `;
    },
    choices: [' '],
  });

  return timeline;
};

/**
 * Build practice stage 2 (numbers + letters 1-D)
 */
export const buildPractice2 = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
): Timeline => {
  const timeline: Timeline = [];

  // Skip if not enabled
  if (!state.isStageEnabled('practice2')) {
    return timeline;
  }

  // Intro screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="trail-making-stage-intro">
        <h2>${i18n.t('TRAIL_MAKING.PRACTICE2_TITLE')}</h2>
        <p>${i18n.t('TRAIL_MAKING.PRACTICE2_MESSAGE')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
      </div>
    `,
    choices: [' '],
  });

  // Create trial (stage initialization is now done in plugin)
  timeline.push({
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
  });

  // Feedback screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: () => {
      const results = state.getStageResults();
      const lastResult = results[results.length - 1];
      return `
        <div class="trail-making-feedback">
          <h2>${i18n.t('TRAIL_MAKING.PRACTICE_COMPLETE_TITLE')}</h2>
          <p><strong>${i18n.t('TRAIL_MAKING.TIME_TAKEN')}</strong> ${lastResult.timeTaken.toFixed(2)} ${i18n.t('TRAIL_MAKING.SECONDS')}</p>
          <p><strong>${i18n.t('TRAIL_MAKING.ERRORS_SELF_CORRECTED')}</strong> ${lastResult.errorsSelfCorrected}</p>
          <p><strong>${i18n.t('TRAIL_MAKING.ERRORS_NON_SELF_CORRECTED')}</strong> ${lastResult.errorsNonSelfCorrected}</p>
          <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
        </div>
      `;
    },
    choices: [' '],
  });

  return timeline;
};
