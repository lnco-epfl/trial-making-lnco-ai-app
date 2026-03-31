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
  circle_radius: number;
  screen_scale?: number;
  retry_attempt?: boolean;
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
 * Baseline height in px for the tallest field at scale = 1.
 * Derived from the LNCO.ai calibration convention: 10 cm = 380 px → 1 cm = 38 px → 22 cm = 836 px.
 */
const BASE_HEIGHT_PX = 836;

/**
 * Fixed vertical reserve for UI chrome (progress bar + instruction text + done button + margins).
 * ~40px progress bar + ~35px instruction + ~60px button + margins ≈ 200px.
 */
const UI_RESERVE_PX = 200;

const MIN_CIRCLE_RADIUS_PX = 8;
const MAIN_TASK_START_DELAY_MS = 3000;

/**
 * Calculate scaled dimensions for a given stage.
 * The tallest field renders at 22 cm (836 px) at scale = 1; shorter fields scale proportionally.
 * The result is capped so the field never exceeds the available viewport height.
 */
const getFieldDimensions = (
  stage: TrailMakingStage,
  requestedScale: number,
): { widthPx: number; heightPx: number; effectiveScale: number } => {
  const fieldDef = FIELD_DEFINITIONS[stage];
  const [fieldWidth, fieldHeight] = fieldDef.size;
  const safeScale =
    Number.isFinite(requestedScale) && requestedScale > 0 ? requestedScale : 1;

  const capHeightPx = Math.max(window.innerHeight - UI_RESERVE_PX, 220);
  const capWidthPx = Math.max(window.innerWidth - 32, 220);

  const basePxPerUnit = BASE_HEIGHT_PX / MAX_FIELD_HEIGHT;
  const requestedWidthPx = fieldWidth * basePxPerUnit * safeScale;
  const requestedHeightPx = fieldHeight * basePxPerUnit * safeScale;

  // Shrink to fit the viewport cap if needed; never expand beyond the requested size.
  const fitScale = Math.min(
    capWidthPx / requestedWidthPx,
    capHeightPx / requestedHeightPx,
    1,
  );

  return {
    widthPx: requestedWidthPx * fitScale,
    heightPx: requestedHeightPx * fitScale,
    effectiveScale: safeScale * fitScale,
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
    circle_radius: {
      type: ParameterType.INT,
      default: 25,
      description: 'Radius of circles in pixels',
    },
    screen_scale: {
      type: ParameterType.FLOAT,
      default: 1,
      description: 'Host-provided screen calibration scale',
    },
    retry_attempt: {
      type: ParameterType.BOOL,
      default: false,
      description: 'Whether this trial is the second practice retry attempt',
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
      circle_radius: number;
      screen_scale?: number;
      retry_attempt?: boolean;
    },
  ): void {
    const {
      state,
      stage,
      circle_radius: circleRadius,
      provide_feedback: provideFeedback,
      screen_scale: screenScale = 1,
      retry_attempt: isRetryAttempt = false,
    } = trial;
    const t = i18n.t.bind(i18n);
    const { fontSize } = state.getGeneralSettings();
    const isPracticeStage = stage === 'practice1' || stage === 'practice2';
    const isMainTaskStage = stage === 'task1' || stage === 'task2';
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
    let interactionLocked = isMainTaskStage;
    let startOverlay: HTMLDivElement | null = null;
    let startHint: HTMLParagraphElement | null = null;
    let startGateTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let hasMainTaskStarted = !isMainTaskStage;
    let startKeyHandler: ((event: KeyboardEvent) => void) | null = null;
    let pendingUndoLabel: string | null = null;
    const circleElements = new Map<string, HTMLElement>();

    const getMainTaskInstructionText = (): string =>
      stage === 'task1'
        ? t('TRAIL_MAKING.TASK1_READY_MESSAGE')
        : t('TRAIL_MAKING.TASK2_READY_MESSAGE');

    const clearStartGate = (): void => {
      if (startGateTimeoutId !== null) {
        clearTimeout(startGateTimeoutId);
        startGateTimeoutId = null;
      }

      if (startKeyHandler) {
        window.removeEventListener('keydown', startKeyHandler);
        startKeyHandler = null;
      }
    };

    const unlockMainTask = (): void => {
      if (hasMainTaskStarted) {
        return;
      }

      hasMainTaskStarted = true;
      interactionLocked = false;
      state.markStageStartTime();
      clearStartGate();

      if (startOverlay && startOverlay.parentNode) {
        startOverlay.parentNode.removeChild(startOverlay);
      }
      startOverlay = null;
      startHint = null;
    };

    const setupMainTaskStartOverlay = (): void => {
      startOverlay = document.createElement('div');
      startOverlay.style.cssText = `
        position: absolute;
        top: 0;
        bottom: 0;
        left: -100px;
        right: -100px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.38);
        z-index: 30;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const contentCard = document.createElement('div');
      contentCard.style.cssText = `
        width: 100%;
        max-width: 980px;
        background: rgba(255, 255, 255, 0.83);
        border: 1px solid rgba(0, 0, 0, 0.14);
        border-radius: 8px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
        padding: 24px;
      `;

      const instruction = document.createElement('p');
      instruction.style.cssText = 'white-space: pre-line; margin: 0;';
      instruction.innerHTML = getMainTaskInstructionText();

      startHint = document.createElement('p');
      startHint.className = 'continue-prompt';
      startHint.style.cssText = 'margin: 16px 0 0 0; display: none;';
      startHint.textContent = t('TRAIL_MAKING.PRESS_TO_CONTINUE');

      contentCard.appendChild(instruction);
      contentCard.appendChild(startHint);
      modal.appendChild(contentCard);
      startOverlay.appendChild(modal);
      displayElement.appendChild(startOverlay);

      startGateTimeoutId = setTimeout(() => {
        if (!startHint || hasMainTaskStarted) {
          return;
        }

        startHint.style.display = 'block';
        startKeyHandler = (event: KeyboardEvent) => {
          if (event.code !== 'Space' && event.key !== ' ') {
            return;
          }

          event.preventDefault();
          unlockMainTask();
        };
        window.addEventListener('keydown', startKeyHandler);
      }, MAIN_TASK_START_DELAY_MS);
    };

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
      clearStartGate();

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

      // Hide the done button after it's clicked
      if (doneButton && doneButton.parentNode) {
        doneButton.style.display = 'none';
      }

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
      const errorMessage = isRetryAttempt
        ? `<p style="color:#DC143C;font-weight:700;">${t('TRAIL_MAKING.PRACTICE_TRIAL_ERROR')}</p>`
        : `<p style="color:#DC143C;font-weight:700;">${t('TRAIL_MAKING.PRACTICE_TRIAL_ERROR')}</p><p>${t('TRAIL_MAKING.PRACTICE_TRIAL_REVIEW_INSTRUCTIONS')}</p>`;

      showFeedbackPanel(
        errorMessage,
        isRetryAttempt
          ? t('TRAIL_MAKING.CONTINUE_BUTTON_INLINE')
          : t('TRAIL_MAKING.BACK_TO_INSTRUCTIONS_BUTTON'),
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
    element.style.position = 'relative';

    // Get field dimensions for this stage
    const fieldDimensions = getFieldDimensions(stage, screenScale);
    const effectiveCircleRadius = Math.max(
      MIN_CIRCLE_RADIUS_PX,
      Math.round(circleRadius * fieldDimensions.effectiveScale),
    );

    // Create container
    const container = document.createElement('div');
    container.className = 'trail-making-container';
    container.style.cssText = `
      position: relative;
      width: ${fieldDimensions.widthPx}px;
      height: ${fieldDimensions.heightPx}px;
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

      if (isMainTaskStage && !hasMainTaskStarted) {
        return;
      }

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
        width: ${effectiveCircleRadius * 2}px;
        height: ${effectiveCircleRadius * 2}px;
        border-radius: 50%;
        border: 3px solid #333;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${Math.round(effectiveCircleRadius * 0.8)}px;
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
        top: calc(${firstCircle.y}% + ${effectiveCircleRadius + 6}px);
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
        top: calc(${lastCircle.y}% + ${effectiveCircleRadius + 6}px);
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

    if (isMainTaskStage) {
      setupMainTaskStartOverlay();
    }
  }
}

export default TrailMakingStimulusPlugin;
