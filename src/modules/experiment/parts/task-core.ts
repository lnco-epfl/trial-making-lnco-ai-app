import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';
import { AudioNarration } from 'jspsych-audio-narration';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import TrailMakingStimulusPlugin from '../trials/trail-making-stimulus-trial';
import {
  STAGE_TIME_LIMITS_SEC,
  TASK1_FIELD,
  TASK2_FIELD,
} from '../utils/constants';
import { FieldDefinition, Timeline } from '../utils/types';

const TASK_DISPLAY_W = 200;
const TASK_DISPLAY_H = 283; // preserves 2480:3500 ≈ 1:1.41 aspect ratio

const renderTaskDisplay = (
  field: FieldDefinition,
  startLabel: string,
  endLabel: string,
): string => {
  const circles = field.targets
    .map((target) => {
      const cx = (target.x / 100) * TASK_DISPLAY_W;
      const cy = (target.y / 100) * TASK_DISPLAY_H;
      const isStart = target.label === startLabel;
      const isEnd = target.label === endLabel;
      let badge = '';

      if (isStart) {
        badge = `<text x="${cx}" y="${cy + 20}" class="task-display-label preview-start">${i18n.t('TRAIL_MAKING.START_LABEL')}</text>`;
      } else if (isEnd) {
        badge = `<text x="${cx}" y="${cy + 20}" class="task-display-label preview-end">${i18n.t('TRAIL_MAKING.END_LABEL')}</text>`;
      }

      return `
        <circle cx="${cx}" cy="${cy}" r="9" class="preview-circle"></circle>
        <text x="${cx}" y="${cy + 4}" class="task-display-label">${target.label}</text>
        ${badge}
      `;
    })
    .join('');

  return `
    <div class="task-display" aria-hidden="true">
      <svg class="task-display-svg" viewBox="0 0 ${TASK_DISPLAY_W} ${TASK_DISPLAY_H}" preserveAspectRatio="xMidYMid meet">
        <rect x="0" y="0" width="${TASK_DISPLAY_W}" height="${TASK_DISPLAY_H}" class="preview-bg"></rect>
        ${circles}
      </svg>
    </div>
  `;
};

/**
 * Build main task 1 (numbers 1–25)
 */
export const buildTask1 = (
  state: ExperimentState,
  updateData: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych: JsPsych,
  narration: AudioNarration,
  screenScale?: number,
): Timeline => {
  const timeline: Timeline = [];

  // Skip if not enabled
  if (!state.isStageEnabled('task1')) {
    return timeline;
  }

  // Instruction screen — two-column: text left, task preview right
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="task-instruction-page">
        <div class="task-instruction-left">
          <p style="white-space: pre-line;">${i18n.t('TRAIL_MAKING.TASK1_READY_MESSAGE')}</p>
          <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
        </div>
        <div class="task-instruction-right">
          ${renderTaskDisplay(TASK1_FIELD, '1', '25')}
        </div>
      </div>
    `,
    choices: [' '],
    on_start() {
      narration.play('assets/audio/tst_main_instructions1.mp3');
    },
    on_finish() {
      narration.stop();
    },
  });

  // Stimulus trial
  timeline.push({
    type: TrailMakingStimulusPlugin,
    stage: 'task1',
    state,
    provide_feedback: false,
    circle_radius: state.getTrailMakingSettings().circleRadius,
    screen_scale: screenScale,
    time_limit: STAGE_TIME_LIMITS_SEC.task1,
    on_finish: () => {
      updateData(jsPsych.data.get(), state.getAllSettings());
    },
  });

  // Completion screen — neuropsychologist-authored message; no performance metrics shown
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().last(1).values()[0] as
        | { timedOut?: boolean }
        | undefined;
      const msg = lastTrial?.timedOut
        ? i18n.t('TRAIL_MAKING.TASK1_TIMEOUT_MESSAGE')
        : i18n.t('TRAIL_MAKING.TASK1_COMPLETE_MESSAGE');
      return `
        <div class="trail-making-complete">
          <p>${msg}</p>
          <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
        </div>
      `;
    },
    choices: [' '],
    on_start() {
      const lastTrial = jsPsych.data.get().last(1).values()[0] as
        | { timedOut?: boolean }
        | undefined;
      if (lastTrial?.timedOut) {
        narration.play('assets/audio/tst_main_timeout1.mp3');
      } else {
        narration.play('assets/audio/tst_main_complete1.mp3');
      }
    },
    on_finish() {
      narration.stop();
    },
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
  narration: AudioNarration,
  screenScale?: number,
): Timeline => {
  const timeline: Timeline = [];

  // Skip if not enabled
  if (!state.isStageEnabled('task2')) {
    return timeline;
  }

  // Instruction screen — two-column: text left, task preview right
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="task-instruction-page">
        <div class="task-instruction-left">
          <p style="white-space: pre-line;">${i18n.t('TRAIL_MAKING.TASK2_READY_MESSAGE')}</p>
          <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_BEGIN')}</p>
        </div>
        <div class="task-instruction-right">
          ${renderTaskDisplay(TASK2_FIELD, '1', '13')}
        </div>
      </div>
    `,
    choices: [' '],
    on_start() {
      narration.play('assets/audio/tst_main_instructions2.mp3');
    },
    on_finish() {
      narration.stop();
    },
  });

  // Stimulus trial
  timeline.push({
    type: TrailMakingStimulusPlugin,
    stage: 'task2',
    state,
    provide_feedback: false,
    circle_radius: state.getTrailMakingSettings().circleRadius,
    screen_scale: screenScale,
    time_limit: STAGE_TIME_LIMITS_SEC.task2,
    on_finish: () => {
      updateData(jsPsych.data.get(), state.getAllSettings());
    },
  });

  // Completion screen — neuropsychologist-authored message; no performance metrics shown
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: () => {
      const lastTrial = jsPsych.data.get().last(1).values()[0] as
        | { timedOut?: boolean }
        | undefined;
      const msg = lastTrial?.timedOut
        ? i18n.t('TRAIL_MAKING.TASK2_TIMEOUT_MESSAGE')
        : i18n.t('TRAIL_MAKING.TASK2_COMPLETE_MESSAGE');
      return `
        <div class="trail-making-complete">
          <p>${msg}</p>
          <p class="continue-prompt">${i18n.t('TRAIL_MAKING.PRESS_TO_CONTINUE')}</p>
        </div>
      `;
    },
    choices: [' '],
    on_start() {
      const lastTrial = jsPsych.data.get().last(1).values()[0] as
        | { timedOut?: boolean }
        | undefined;
      if (lastTrial?.timedOut) {
        narration.play('assets/audio/tst_main_timeout2.mp3');
      } else {
        narration.play('assets/audio/tst_main_complete2.mp3');
      }
    },
    on_finish() {
      narration.stop();
    },
  });

  return timeline;
};
