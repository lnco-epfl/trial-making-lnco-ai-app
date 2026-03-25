import FullscreenPlugin from '@jspsych/plugin-fullscreen';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { Timeline, Trial } from '../utils/types';

/**
 * Fullscreen entry screen — welcome + start button
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
 * Build introduction timeline — only the welcome/fullscreen entry screen.
 * Per-stage instruction text is handled within each stage's own builder
 * (buildPractice1, buildPractice2, buildTask1, buildTask2).
 * The state parameter is kept for API compatibility with experiment.ts.
 */
export const buildIntroduction = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state: ExperimentState,
): Timeline => [experimentBeginTrial()];
