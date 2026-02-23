import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { JsPsych } from 'jspsych';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { TIMING } from '../utils/constants';
import { Trial } from '../utils/types';

export const breakTrial = (state: ExperimentState, jsPsych: JsPsych): Trial => {
  const duration = state.getBreakSettings().breakDuration;

  return {
    type: htmlKeyboardResponse,
    stimulus: () => `
        <div class="nback-break">
          <h2>${i18n.t('BREAK.TITLE')}</h2>
          <p>${i18n.t('BREAK.MESSAGE')}</p>
          <p class="countdown-text">${i18n.t('BREAK.COUNTDOWN')} <span id="break-countdown">${duration}</span>s</p>
          <p class="continue-prompt">${i18n.t('BREAK.PRESS_TO_CONTINUE')}</p>
        </div>
      `,
    choices: [' '],
    on_load: () => {
      let timeLeft = duration;
      const countdownElement = document.getElementById('break-countdown');

      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        if (countdownElement) {
          countdownElement.textContent = timeLeft.toString();
        }
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          jsPsych.finishTrial();
        }
      }, TIMING.COUNTDOWN_INTERVAL);

      // Store interval ID for cleanup
      const windowRecord = window as unknown as Record<string, unknown>;
      windowRecord.breakCountdownInterval = countdownInterval;
    },
    on_finish: () => {
      // Clean up interval
      const windowRecord = window as unknown as Record<string, unknown>;
      if (windowRecord.breakCountdownInterval) {
        clearInterval(windowRecord.breakCountdownInterval as NodeJS.Timeout);
        delete windowRecord.breakCountdownInterval;
      }
    },
    post_trial_gap: TIMING.POST_TRIAL_GAP,
  };
};
