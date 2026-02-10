import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import TrailMakingStimulusPlugin from '../trials/trail-making-stimulus-trial';
import { Timeline } from '../utils/types';

/**
 * Build main task 1 (numbers 1-25)
 */
export const buildTask1 = (
  state: ExperimentState,
  updateData: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych: JsPsych,
): Timeline => {
  const timeline: Timeline = [];

  // Skip if not enabled
  if (!state.isStageEnabled('task1')) {
    return timeline;
  }

  // Ready screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="trail-making-ready">
        <h2>${i18n.t('TRAIL_MAKING.TASK1_READY_TITLE')}</h2>
        <p>${i18n.t('TRAIL_MAKING.TASK1_READY_MESSAGE')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
      </div>
    `,
    choices: [' '],
  });

  // Create trial (stage initialization is now done in plugin)
  timeline.push({
    type: TrailMakingStimulusPlugin,
    stage: 'task1',
    state,
    provide_feedback: false, // No feedback in main task
    circle_radius: state.getTrailMakingSettings().circleRadius,
    on_finish: () => {
      updateData(jsPsych.data.get(), state.getAllSettings());
    },
  });

  // Completion screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: () => {
      const results = state.getStageResults();
      const lastResult = results[results.length - 1];
      return `
        <div class="trail-making-complete">
          <h2>${i18n.t('TRAIL_MAKING.TASK1_COMPLETE_TITLE')}</h2>
          <p>${i18n.t('TRAIL_MAKING.TASK1_COMPLETE_MESSAGE')}</p>
          <p><strong>${i18n.t('TRAIL_MAKING.TIME_TAKEN')}</strong> ${lastResult.timeTaken.toFixed(2)} ${i18n.t('TRAIL_MAKING.SECONDS')}</p>
          <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
        </div>
      `;
    },
    choices: [' '],
  });

  return timeline;
};

/**
 * Build main task 2 (numbers + letters 1-13)
 */
export const buildTask2 = (
  state: ExperimentState,
  updateData: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych: JsPsych,
): Timeline => {
  const timeline: Timeline = [];

  // Skip if not enabled
  if (!state.isStageEnabled('task2')) {
    return timeline;
  }

  // Ready screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="trail-making-ready">
        <h2>${i18n.t('TRAIL_MAKING.TASK2_READY_TITLE')}</h2>
        <p>${i18n.t('TRAIL_MAKING.TASK2_READY_MESSAGE')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
      </div>
    `,
    choices: [' '],
  });

  // Create trial (stage initialization is now done in plugin)
  timeline.push({
    type: TrailMakingStimulusPlugin,
    stage: 'task2',
    state,
    provide_feedback: false, // No feedback in main task
    circle_radius: state.getTrailMakingSettings().circleRadius,
    on_finish: () => {
      updateData(jsPsych.data.get(), state.getAllSettings());
    },
  });

  // Completion screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: () => {
      const results = state.getStageResults();
      const lastResult = results[results.length - 1];
      return `
        <div class="trail-making-complete">
          <h2>${i18n.t('TRAIL_MAKING.TASK2_COMPLETE_TITLE')}</h2>
          <p>${i18n.t('TRAIL_MAKING.TASK2_COMPLETE_MESSAGE')}</p>
          <p><strong>${i18n.t('TRAIL_MAKING.TIME_TAKEN')}</strong> ${lastResult.timeTaken.toFixed(2)} ${i18n.t('TRAIL_MAKING.SECONDS')}</p>
          <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
        </div>
      `;
    },
    choices: [' '],
  });

  return timeline;
};
