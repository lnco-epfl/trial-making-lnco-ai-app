import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import TrailMakingStimulusPlugin from '../trials/trail-making-stimulus-trial';
import { Timeline } from '../utils/types';

/**
 * Build main task 1 (numbers 1–25)
 */
export const buildTask1 = (
  state: ExperimentState,
  updateData: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych: JsPsych,
  screenScale?: number,
): Timeline => {
  const timeline: Timeline = [];

  // Skip if not enabled
  if (!state.isStageEnabled('task1')) {
    return timeline;
  }

  // Stimulus trial
  timeline.push({
    type: TrailMakingStimulusPlugin,
    stage: 'task1',
    state,
    provide_feedback: false,
    circle_radius: state.getTrailMakingSettings().circleRadius,
    screen_scale: screenScale,
    on_finish: () => {
      updateData(jsPsych.data.get(), state.getAllSettings());
    },
  });

  // Completion screen — neuropsychologist-authored message; no performance metrics shown
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="trail-making-complete">
        <p>${i18n.t('TRAIL_MAKING.TASK1_COMPLETE_MESSAGE')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
      </div>
    `,
    choices: [' '],
  });

  return timeline;
};

/**
 * Build main task 2 (numbers + letters 1–13)
 */
export const buildTask2 = (
  state: ExperimentState,
  updateData: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych: JsPsych,
  screenScale?: number,
): Timeline => {
  const timeline: Timeline = [];

  // Skip if not enabled
  if (!state.isStageEnabled('task2')) {
    return timeline;
  }

  // Stimulus trial
  timeline.push({
    type: TrailMakingStimulusPlugin,
    stage: 'task2',
    state,
    provide_feedback: false,
    circle_radius: state.getTrailMakingSettings().circleRadius,
    screen_scale: screenScale,
    on_finish: () => {
      updateData(jsPsych.data.get(), state.getAllSettings());
    },
  });

  // Completion screen — neuropsychologist-authored message; no performance metrics shown
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="trail-making-complete">
        <p>${i18n.t('TRAIL_MAKING.TASK2_COMPLETE_MESSAGE')}</p>
        <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
      </div>
    `,
    choices: [' '],
  });

  return timeline;
};
