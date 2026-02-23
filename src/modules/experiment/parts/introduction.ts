import FullscreenPlugin from '@jspsych/plugin-fullscreen';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { Timeline, Trial } from '../utils/types';

/**
 * Fullscreen entry screen with instructions
 */
const experimentBeginTrial = (): Trial => ({
  type: FullscreenPlugin,
  choices: [i18n.t('TRAIL_MAKING.START_BUTTON')],
  message: `
    <div class="trail-making-intro">
      <h1>${i18n.t('TRAIL_MAKING.WELCOME_TITLE')}</h1>
      <p>${i18n.t('TRAIL_MAKING.WELCOME_MESSAGE')}</p>
    </div>
  `,
  fullscreen_mode: true,
});

/**
 * Detailed task instructions
 */
const taskInstructions = (): Trial[] => [
  {
    type: FullscreenPlugin,
    choices: [i18n.t('TRAIL_MAKING.CONTINUE_BUTTON')],
    message: `
      <div class="trail-making-ready">
        <h2>${i18n.t('TRAIL_MAKING.INSTRUCTIONS_TITLE')}</h2>
        <p>${i18n.t('TRAIL_MAKING.INSTRUCTIONS_OVERVIEW')}</p>
        <p>${i18n.t('TRAIL_MAKING.INSTRUCTIONS_GOAL')}</p>
      </div>
    `,
  },
  {
    type: FullscreenPlugin,
    choices: [i18n.t('TRAIL_MAKING.CONTINUE_BUTTON')],
    message: `
      <div class="trail-making-ready">
        <h2>${i18n.t('TRAIL_MAKING.INSTRUCTIONS_HOW_TO_TITLE')}</h2>
        <p>${i18n.t('TRAIL_MAKING.INSTRUCTIONS_CLICK')}</p>
        <p>${i18n.t('TRAIL_MAKING.INSTRUCTIONS_SEQUENCE')}</p>
        <p class="important">${i18n.t('TRAIL_MAKING.INSTRUCTIONS_ERROR')}</p>
      </div>
    `,
  },
  {
    type: FullscreenPlugin,
    choices: [i18n.t('TRAIL_MAKING.START_PRACTICE_BUTTON')],
    message: `
      <div class="trail-making-ready">
        <h2>${i18n.t('TRAIL_MAKING.PRACTICE_INTRO_TITLE')}</h2>
        <p>${i18n.t('TRAIL_MAKING.PRACTICE_INTRO_MESSAGE')}</p>
        <p>${i18n.t('TRAIL_MAKING.READY_MESSAGE')}</p>
      </div>
    `,
  },
];

/**
 * Build introduction timeline
 */
export const buildIntroduction = (state: ExperimentState): Timeline => {
  const instructionTimeline: Timeline = [];

  // Skip instructions if configured
  if (state.getGeneralSettings().skipInstructions) {
    instructionTimeline.push(experimentBeginTrial());
    return instructionTimeline;
  }

  // Full introduction sequence
  instructionTimeline.push(experimentBeginTrial());
  instructionTimeline.push(...taskInstructions());

  return instructionTimeline;
};
