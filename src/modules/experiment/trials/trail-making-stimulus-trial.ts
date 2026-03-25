import { JsPsych, ParameterType } from 'jspsych';

import { CirclePosition } from '@/modules/context/SettingsContext';

import {
  ClickData,
  ExperimentState,
  TrailMakingStage,
} from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import {
  PRACTICE1_FIELD,
  PRACTICE2_FIELD,
  TASK1_FIELD,
  TASK2_FIELD,
} from '../utils/constants';

export type TrailMakingParametersType = {
  stage: TrailMakingStage;
  state: ExperimentState;
  provide_feedback: boolean;
  practice_attempt?: 1 | 2;
  circle_radius: number;
  calibration_scale: number;
};

export type TrailMakingDataType = {
  stage: TrailMakingStage;
  timeTaken: number;
  errorsSelfCorrected: number;
  errorsNonSelfCorrected: number;
  clickSequence: ClickData[];
  frameClicks: FrameClickData[];
  completed: boolean;
};

export type FrameClickData = {
  timestamp: number;
  relativeX: number;
  relativeY: number;
  normalizedX: number;
  normalizedY: number;
  targetLabel: string | null;
  isCircleClick: boolean;
  isUndo: boolean;
};

/**
 * Field definitions mapping for each stage
 */
const FIELD_DEFINITIONS = {
  practice1: PRACTICE1_FIELD,
  practice2: PRACTICE2_FIELD,
  task1: TASK1_FIELD,
  task2: TASK2_FIELD,
} as const;

/**
 * Calculate the largest field height across all stages
 * This will be used to scale all fields proportionally
 */
const MAX_FIELD_HEIGHT = Math.max(
  PRACTICE1_FIELD.size[1],
  PRACTICE2_FIELD.size[1],
  TASK1_FIELD.size[1],
  TASK2_FIELD.size[1],
);

/**
 * Target height in vh for the largest field
 */
const TARGET_MAX_HEIGHT_VH = 80;

/**
 * Calculate scaled dimensions for a given stage
 * The largest field will be TARGET_MAX_HEIGHT_VH, others scale proportionally
 */
const getFieldDimensions = (
  stage: TrailMakingStage,
  scale = 1,
): { width: number; height: number } => {
  const fieldDef = FIELD_DEFINITIONS[stage];
  const [fieldWidth, fieldHeight] = fieldDef.size;

  // Scale factor: vh per field unit
  const scaleFactorVh = TARGET_MAX_HEIGHT_VH / MAX_FIELD_HEIGHT;

  return {
    width: fieldWidth * scaleFactorVh * scale,
    height: fieldHeight * scaleFactorVh * scale,
  };
};

const info = {
  name: 'trail-making-stimulus',
  description: 'Interactive Trail Making Task trial',
  parameters: {
    stage: {
      type: ParameterType.STRING,
      default: 'practice1',
      description: 'The current stage (practice1, task1, practice2, task2)',
    },
    layout: {
      type: ParameterType.COMPLEX,
      default: { circles: [], sequence: [] },
      description: 'The layout configuration with circles and sequence',
    },
    state: {
      type: ParameterType.COMPLEX,
      default: undefined,
      description: 'The ExperimentState instance managing trial flow',
    },
    provide_feedback: {
      type: ParameterType.BOOL,
      default: true,
      description: 'Whether to show immediate feedback',
    },
    practice_attempt: {
      type: ParameterType.INT,
      default: 1,
      description: 'Practice attempt number (1 or 2)',
    },
    circle_radius: {
      type: ParameterType.INT,
      default: 25,
      description: 'Radius of circles in pixels',
    },
    calibration_scale: {
      type: ParameterType.FLOAT,
      default: 1,
      description:
        'Requested calibration scale factor, capped at runtime to fit viewport',
    },
  },
};

/**
 * @class TrailMakingStimulusPlugin
 * @description A custom jsPsych plugin that implements an interactive Trail Making Task.
 * Participants click on circles in the correct sequence (1, 2, 3... or 1, A, 2, B...).
 * Lines are drawn between correctly clicked circles. Errors can be self-corrected by
 * clicking the wrong circle again.
 *
 * Features:
 * - Interactive circle clicking with visual feedback
 * - Line drawing between connected circles
 * - Real-time error detection and self-correction tracking
 * - START/END markers for practice rounds
 * - Configurable circle size and positions
 * - Tracks time taken and error metrics
 */
class TrailMakingStimulusPlugin {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(
    displayElement: HTMLElement,
    trial: {
      stage: TrailMakingStage;
      state: ExperimentState;
      provide_feedback: boolean;
      practice_attempt?: 1 | 2;
      circle_radius: number;
      calibration_scale: number;
    },
  ): void {
    const {
      state,
      stage,
      circle_radius: circleRadius,
      provide_feedback: provideFeedback,
      practice_attempt: practiceAttempt = 1,
      calibration_scale: calibrationScale,
    } = trial;
    const t = i18n.t.bind(i18n);
    const { fontSize } = state.getGeneralSettings();
    const isPracticeStage = stage === 'practice1' || stage === 'practice2';
    const usesDeferredEvaluation = !provideFeedback || isPracticeStage;

    // Reset state for this stage (in case state was modified by previous stages during timeline construction)
    state.startStage(stage);
    const layout = state.getCurrentLayout();

    const clickSequence: string[] = [];
    const frameClicks: FrameClickData[] = [];
    let lastClickedLabel: string | null = null;
    const lines: {
      element: SVGLineElement;
      fromLabel: string;
      toLabel: string;
    }[] = [];
    let svgElement: SVGSVGElement | null = null;
    let trialEnded = false;
    let doneButton: HTMLButtonElement | null = null;
    let feedbackPanel: HTMLDivElement | null = null;
    let interactionLocked = false;
    let pendingUndoLabel: string | null = null;
    const circleElements = new Map<string, HTMLElement>();

    const updateDoneButton = (): void => {
      if (doneButton && usesDeferredEvaluation) {
        doneButton.disabled = false;
        doneButton.style.backgroundColor = '#4a90e2';
        doneButton.style.color = 'white';
        doneButton.style.cursor = 'pointer';
      }
    };

    const removeLastLine = (): void => {
      if (lines.length > 0) {
        const lastLine = lines.pop();
        if (lastLine?.element?.parentNode) {
          lastLine.element.parentNode.removeChild(lastLine.element);
        }
      }
    };

    const clearFeedbackPanel = (): void => {
      if (feedbackPanel && feedbackPanel.parentNode) {
        feedbackPanel.parentNode.removeChild(feedbackPanel);
      }
      feedbackPanel = null;
    };

    const updateCircleColor = (circleEl: HTMLElement, label: string): void => {
      if (usesDeferredEvaluation) {
        if (label === lastClickedLabel) {
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = '#FFD700';
          // eslint-disable-next-line no-param-reassign
          circleEl.style.borderColor = '#999';
        } else if (clickSequence.includes(label)) {
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = '#E0E0E0';
          // eslint-disable-next-line no-param-reassign
          circleEl.style.borderColor = '#666';
        } else {
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = 'white';
          // eslint-disable-next-line no-param-reassign
          circleEl.style.borderColor = '#333';
        }
      }
    };

    const recolorAllCircles = (): void => {
      if (usesDeferredEvaluation) {
        circleElements.forEach((circleEl, label) => {
          updateCircleColor(circleEl, label);
        });
      }
    };

    const drawLineToCircle = (toCircle: CirclePosition): void => {
      if (!svgElement) return;

      if (clickSequence.length < 2) return;

      const prevLabel = clickSequence[clickSequence.length - 2];
      const prevCircle = layout.circles.find((c) => c.label === prevLabel);

      if (!prevCircle) return;

      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line',
      );
      line.setAttribute('x1', `${prevCircle.x}%`);
      line.setAttribute('y1', `${prevCircle.y}%`);
      line.setAttribute('x2', `${toCircle.x}%`);
      line.setAttribute('y2', `${toCircle.y}%`);
      line.setAttribute('stroke', '#228B22');
      line.setAttribute('stroke-width', '3');
      line.style.pointerEvents = 'none';

      svgElement.appendChild(line);
      lines.push({
        element: line,
        fromLabel: prevLabel,
        toLabel: toCircle.label,
      });
    };

    const evaluatePracticeAttempt = (): {
      success: boolean;
      wrongIndex: number;
    } => {
      const expected = layout.sequence;

      const effectiveSequence = clickSequence.reduce<string[]>((acc, label) => {
        if (acc.length >= 2 && label === acc[acc.length - 2]) {
          acc.pop();
          return acc;
        }

        acc.push(label);
        return acc;
      }, []);

      const comparisonLength = Math.max(
        effectiveSequence.length,
        expected.length,
      );

      for (let index = 0; index < comparisonLength; index += 1) {
        if (effectiveSequence[index] !== expected[index]) {
          return { success: false, wrongIndex: index };
        }
      }

      if (effectiveSequence.length === expected.length) {
        return { success: true, wrongIndex: -1 };
      }

      return { success: false, wrongIndex: expected.length };
    };

    const setAllSuccessColors = (): void => {
      circleElements.forEach((circleEl) => {
        // eslint-disable-next-line no-param-reassign
        circleEl.style.backgroundColor = '#90EE90';
        // eslint-disable-next-line no-param-reassign
        circleEl.style.borderColor = '#228B22';
      });
      lines.forEach((lineData) => {
        lineData.element.setAttribute('stroke', '#228B22');
      });
    };

    const highlightWrongAnswer = (wrongIndex: number): void => {
      const isValidTransition = (
        fromLabel: string,
        toLabel: string,
      ): boolean => {
        const fromIndex = layout.sequence.indexOf(fromLabel);
        if (fromIndex < 0 || fromIndex >= layout.sequence.length - 1) {
          return false;
        }

        return layout.sequence[fromIndex + 1] === toLabel;
      };

      if (wrongIndex < clickSequence.length) {
        const wrongLabel = clickSequence[wrongIndex];
        const wrongCircle = circleElements.get(wrongLabel);
        if (wrongCircle) {
          wrongCircle.style.backgroundColor = '#FFB6C6';
          wrongCircle.style.borderColor = '#DC143C';
        }
      }

      if (wrongIndex > 0 && wrongIndex - 1 < lines.length) {
        lines[wrongIndex - 1].element.setAttribute('stroke', '#DC143C');
      }

      for (
        let lineIndex = wrongIndex;
        lineIndex < lines.length;
        lineIndex += 1
      ) {
        if (lineIndex + 1 >= clickSequence.length) {
          break;
        }

        const currentLabel = clickSequence[lineIndex];
        const nextLabel = clickSequence[lineIndex + 1];

        if (!isValidTransition(currentLabel, nextLabel)) {
          lines[lineIndex].element.setAttribute('stroke', '#DC143C');
        }
      }
    };

    const showFeedbackPanel = (
      html: string,
      buttonText: string,
      onClick: () => void,
      buttonColor: string,
    ): void => {
      clearFeedbackPanel();
      feedbackPanel = document.createElement('div');
      feedbackPanel.className = 'trail-making-practice-feedback-panel';
      feedbackPanel.style.cssText = `
        margin-top: 16px;
        text-align: center;
        max-width: 700px;
      `;

      const message = document.createElement('div');
      message.innerHTML = html;
      feedbackPanel.appendChild(message);

      const actionButton = document.createElement('button');
      actionButton.textContent = buttonText;
      actionButton.style.cssText = `
        margin-top: 12px;
        padding: 10px 24px;
        font-size: 1rem;
        cursor: pointer;
        background-color: ${buttonColor};
        color: white;
        border: 1px solid ${buttonColor};
        border-radius: 4px;
      `;
      actionButton.addEventListener('click', onClick);
      feedbackPanel.appendChild(actionButton);

      displayElement.appendChild(feedbackPanel);
    };

    const endTrial = (): void => {
      if (trialEnded) return;
      trialEnded = true;

      const result = state.completeStage();

      const trialData: TrailMakingDataType = {
        stage: result.stage,
        timeTaken: result.timeTaken,
        errorsSelfCorrected: result.errorsSelfCorrected,
        errorsNonSelfCorrected: result.errorsNonSelfCorrected,
        clickSequence: result.clickSequence,
        frameClicks,
        completed: result.completed,
      };

      this.jsPsych.finishTrial(trialData);
    };

    const onDoneClick = (): void => {
      if (trialEnded) return;

      if (!isPracticeStage) {
        endTrial();
        return;
      }

      const evaluation = evaluatePracticeAttempt();
      interactionLocked = true;

      if (evaluation.success) {
        setAllSuccessColors();
        showFeedbackPanel(
          `<p style="color:#228B22;font-weight:700;">${t('TRAIL_MAKING.PRACTICE_TRIAL_SUCCESS')}</p>`,
          t('TRAIL_MAKING.CONTINUE_BUTTON_INLINE'),
          () => {
            endTrial();
          },
          '#228B22',
        );
        return;
      }

      highlightWrongAnswer(evaluation.wrongIndex);

      if (practiceAttempt >= 2) {
        showFeedbackPanel(
          `<p style="color:#DC143C;font-weight:700;">${t('TRAIL_MAKING.PRACTICE_TRIAL_ERROR')}</p>`,
          t('TRAIL_MAKING.CONTINUE_BUTTON_INLINE'),
          () => {
            endTrial();
          },
          '#4a90e2',
        );
        return;
      }

      showFeedbackPanel(
        `<p style="color:#DC143C;font-weight:700;">${t('TRAIL_MAKING.PRACTICE_TRIAL_ERROR')}</p><p>${t('TRAIL_MAKING.PRACTICE_TRIAL_RETRY_PROMPT')}</p>`,
        t('TRAIL_MAKING.RETRY_BUTTON'),
        () => {
          endTrial();
        },
        '#4a90e2',
      );
    };

    const handleCircleClick = (
      circle: CirclePosition,
      _circleEl: HTMLElement,
    ): void => {
      if (trialEnded || interactionLocked) return;

      if (usesDeferredEvaluation) {
        updateDoneButton();
      }

      if (circle.label === lastClickedLabel) {
        const didUndo = state.undoLastClick();
        if (!didUndo) {
          return;
        }

        pendingUndoLabel = circle.label;

        clickSequence.pop();
        removeLastLine();
        lastClickedLabel =
          clickSequence.length > 0
            ? clickSequence[clickSequence.length - 1]
            : null;
        recolorAllCircles();
        return;
      }

      state.recordClick(circle.label, layout);
      clickSequence.push(circle.label);

      if (clickSequence.length > 1) {
        drawLineToCircle(circle);
      }

      lastClickedLabel = circle.label;
      recolorAllCircles();
    };

    // Setup display element
    const element = displayElement;
    element.className = `trail-making-trial font-${fontSize}`;

    const progressBarHeight =
      document.getElementById('jspsych-progressbar-container')?.offsetHeight ??
      0;
    const availableHeight = window.innerHeight - progressBarHeight;
    const baselineHeight = (TARGET_MAX_HEIGHT_VH / 100) * window.innerHeight;
    const maxFitScale =
      baselineHeight > 0
        ? Math.max(0, availableHeight) / baselineHeight
        : calibrationScale;
    const effectiveScale = Math.max(
      0.1,
      Math.min(calibrationScale, maxFitScale),
    );
    const effectiveRadius = circleRadius * effectiveScale;

    // Get field dimensions for this stage
    const fieldDimensions = getFieldDimensions(stage, effectiveScale);

    // Create container
    const container = document.createElement('div');
    container.className = 'trail-making-container';
    container.style.cssText = `
      position: relative;
      width: ${fieldDimensions.width}vh;
      height: ${fieldDimensions.height}vh;
      margin: 0 auto;
      border: 2px solid #333;
      background-color: #f9f9f9;
    `;

    const recordFrameClick = (event: MouseEvent): void => {
      const frameRect = container.getBoundingClientRect();
      const relativeX = event.clientX - frameRect.left;
      const relativeY = event.clientY - frameRect.top;

      if (
        relativeX < 0 ||
        relativeX > frameRect.width ||
        relativeY < 0 ||
        relativeY > frameRect.height
      ) {
        return;
      }

      const targetElement = event.target as HTMLElement;
      const circleTarget = targetElement.closest('.trail-making-circle');
      const targetLabel =
        circleTarget instanceof HTMLElement
          ? (circleTarget.dataset.label ?? null)
          : null;

      frameClicks.push({
        timestamp: Date.now(),
        relativeX,
        relativeY,
        normalizedX: frameRect.width > 0 ? relativeX / frameRect.width : 0,
        normalizedY: frameRect.height > 0 ? relativeY / frameRect.height : 0,
        targetLabel,
        isCircleClick: Boolean(targetLabel),
        isUndo:
          targetLabel !== null &&
          pendingUndoLabel !== null &&
          targetLabel === pendingUndoLabel,
      });

      pendingUndoLabel = null;
    };

    // Create SVG for drawing lines
    svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    container.appendChild(svgElement);
    container.addEventListener('click', (event) => {
      recordFrameClick(event);
    });

    // Create circles
    layout.circles.forEach((circle) => {
      const circleEl = document.createElement('div');
      circleEl.className = 'trail-making-circle';
      circleEl.dataset.label = circle.label;
      circleEl.style.cssText = `
        position: absolute;
        left: ${circle.x}%;
        top: ${circle.y}%;
        transform: translate(-50%, -50%);
        width: ${effectiveRadius * 2}px;
        height: ${effectiveRadius * 2}px;
        border-radius: 50%;
        border: 3px solid #333;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        font-weight: bold;
        cursor: pointer;
        user-select: none;
        z-index: 5;
        transition: all 0.2s ease;
      `;
      circleEl.textContent = circle.label;

      circleElements.set(circle.label, circleEl);

      // Add click handler
      circleEl.addEventListener('click', () => {
        handleCircleClick(circle, circleEl);
      });

      circleEl.addEventListener('mouseenter', () => {
        if (!clickSequence.includes(circle.label) && !interactionLocked) {
          circleEl.style.backgroundColor = '#e8e8e8';
        }
      });
      circleEl.addEventListener('mouseleave', () => {
        if (!clickSequence.includes(circle.label) && !interactionLocked) {
          circleEl.style.backgroundColor = 'white';
        }
      });

      container.appendChild(circleEl);
    });

    // Add start/end markers for all stages using sequence-based circle identification
    const firstLabel = layout.sequence[0];
    const lastLabel = layout.sequence[layout.sequence.length - 1];
    const firstCircle = layout.circles.find((c) => c.label === firstLabel);
    const lastCircle = layout.circles.find((c) => c.label === lastLabel);

    if (firstCircle && lastCircle) {
      const startMarker = document.createElement('div');
      startMarker.style.cssText = `
        position: absolute;
        left: ${firstCircle.x}%;
        top: calc(${firstCircle.y}% + ${effectiveRadius + 6}px);
        transform: translateX(-50%);
        font-size: 0.75em;
        font-weight: bold;
        color: #228B22;
        z-index: 10;
        white-space: nowrap;
        pointer-events: none;
      `;
      startMarker.textContent = t('TRAIL_MAKING.START_LABEL');
      container.appendChild(startMarker);

      const endMarker = document.createElement('div');
      endMarker.style.cssText = `
        position: absolute;
        left: ${lastCircle.x}%;
        top: calc(${lastCircle.y}% + ${effectiveRadius + 6}px);
        transform: translateX(-50%);
        font-size: 0.75em;
        font-weight: bold;
        color: #DC143C;
        z-index: 10;
        white-space: nowrap;
        pointer-events: none;
      `;
      endMarker.textContent = t('TRAIL_MAKING.END_LABEL');
      container.appendChild(endMarker);
    }

    displayElement.appendChild(container);

    if (usesDeferredEvaluation) {
      doneButton = document.createElement('button');
      doneButton.textContent = t('TRAIL_MAKING.DONE_BUTTON');
      doneButton.disabled = true;
      doneButton.style.cssText = `
        margin-top: 20px;
        padding: 10px 30px;
        font-size: 1.1em;
        cursor: not-allowed;
        background-color: #cccccc;
        color: #000;
        border: 1px solid #999;
        border-radius: 4px;
      `;
      doneButton.addEventListener('click', () => {
        onDoneClick();
      });
      displayElement.appendChild(doneButton);
    }
  }
}

export default TrailMakingStimulusPlugin;
