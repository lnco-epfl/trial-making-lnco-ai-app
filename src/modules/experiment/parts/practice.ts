import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import TrailMakingStimulusPlugin from '../trials/trail-making-stimulus-trial';
import { PRACTICE1_FIELD, PRACTICE2_FIELD } from '../utils/constants';
import { Timeline } from '../utils/types';

const PREVIEW_WIDTH = 520;
const PREVIEW_HEIGHT = 300;

const renderPracticePreview = (
  field: typeof PRACTICE1_FIELD,
  startLabel: string,
  endLabel: string,
): string => {
  const circles = field.targets
    .map((target) => {
      const x = (target.x / 100) * PREVIEW_WIDTH;
      const y = (target.y / 100) * PREVIEW_HEIGHT;
      const isStart = target.label === startLabel;
      const isEnd = target.label === endLabel;
      let badge = '';

      if (isStart) {
        badge = `<text x="${x}" y="${y + 28}" class="preview-badge preview-start">${i18n.t('TRAIL_MAKING.START_LABEL')}</text>`;
      } else if (isEnd) {
        badge = `<text x="${x}" y="${y + 28}" class="preview-badge preview-end">${i18n.t('TRAIL_MAKING.END_LABEL')}</text>`;
      }

      return `
        <circle cx="${x}" cy="${y}" r="15" class="preview-circle"></circle>
        <text x="${x}" y="${y + 5}" class="preview-label">${target.label}</text>
        ${badge}
      `;
    })
    .join('');

  return `
    <div class="practice-preview" aria-hidden="true">
      <svg class="practice-preview-svg" viewBox="0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}" preserveAspectRatio="xMidYMid meet">
        <rect x="0" y="0" width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}" class="preview-bg"></rect>
        ${circles}
      </svg>
    </div>
  `;
};

/**
 * Build practice stage 1 (numbers 1–8)
 *
 * Timeline structure:
 *   1. Intro screen (neuropsychologist-authored instruction text)
 *   2. Stimulus trial — 1st attempt
 *   3. Re-intro screen + 2nd attempt stimulus (conditional: shown if errors >= 1)
 *   4. Proceed message screen (always shown)
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
        ${renderPracticePreview(PRACTICE1_FIELD, '1', '8')}
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
    on_finish: (trialData: {
      completed?: boolean;
      sequenceErrorEpisodes?: number;
    }) => {
      if (updateData && jsPsych) {
        updateData(jsPsych.data.get(), state.getAllSettings());
      }

      // Prefer the just-finished trial payload to avoid stale/stage-wide lookups.
      const completed = trialData?.completed;
      const sequenceErrorEpisodes = trialData?.sequenceErrorEpisodes ?? 0;

      if (typeof completed === 'boolean') {
        hadErrors = !completed || sequenceErrorEpisodes > 0;
        return;
      }

      const results = state.getStageResults();
      const lastResult = results[results.length - 1];
      hadErrors = Boolean(
        lastResult &&
          (!lastResult.completed || lastResult.sequenceErrorEpisodes > 0),
      );
    },
  };

  // --- Re-intro screen + 2nd attempt ---
  const retryBlock = {
    timeline: [
      {
        type: htmlKeyboardResponse,
        stimulus: `
          <div class="trail-making-stage-intro">
            <p style="white-space: pre-line;">${i18n.t('TRAIL_MAKING.PRACTICE1_INTRO')}</p>
            ${renderPracticePreview(PRACTICE1_FIELD, '1', '8')}
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
        retry_attempt: true,
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
 *   3. Re-intro screen + 2nd attempt stimulus (conditional: shown if errors >= 1)
 *   4. Proceed message screen (always shown)
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
        ${renderPracticePreview(PRACTICE2_FIELD, '1', 'D')}
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
    on_finish: (trialData: {
      completed?: boolean;
      sequenceErrorEpisodes?: number;
    }) => {
      if (updateData && jsPsych) {
        updateData(jsPsych.data.get(), state.getAllSettings());
      }

      // Prefer the just-finished trial payload to avoid stale/stage-wide lookups.
      const completed = trialData?.completed;
      const sequenceErrorEpisodes = trialData?.sequenceErrorEpisodes ?? 0;

      if (typeof completed === 'boolean') {
        hadErrors = !completed || sequenceErrorEpisodes > 0;
        return;
      }

      const results = state.getStageResults();
      const lastResult = results[results.length - 1];
      hadErrors = Boolean(
        lastResult &&
          (!lastResult.completed || lastResult.sequenceErrorEpisodes > 0),
      );
    },
  };

  // --- Re-intro screen + 2nd attempt ---
  const retryBlock = {
    timeline: [
      {
        type: htmlKeyboardResponse,
        stimulus: `
          <div class="trail-making-stage-intro">
            <p style="white-space: pre-line;">${i18n.t('TRAIL_MAKING.PRACTICE2_INTRO')}</p>
            ${renderPracticePreview(PRACTICE2_FIELD, '1', 'D')}
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
        retry_attempt: true,
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
  timeline.push(retryBlock);
  timeline.push(proceedMessageScreen);

  return timeline;
};
