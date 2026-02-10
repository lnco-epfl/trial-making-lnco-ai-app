import { JsPsych, ParameterType } from 'jspsych';

import { CirclePosition } from '@/modules/context/SettingsContext';

import {
  ClickData,
  ExperimentState,
  TrailMakingStage,
} from '../jspsych/experiment-state-class';
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
};

export type TrailMakingDataType = {
  stage: TrailMakingStage;
  timeTaken: number;
  errorsSelfCorrected: number;
  errorsNonSelfCorrected: number;
  clickSequence: ClickData[];
  completed: boolean;
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
): { width: number; height: number } => {
  const fieldDef = FIELD_DEFINITIONS[stage];
  const [fieldWidth, fieldHeight] = fieldDef.size;

  // Scale factor: vh per field unit
  const scaleFactorVh = TARGET_MAX_HEIGHT_VH / MAX_FIELD_HEIGHT;

  return {
    width: fieldWidth * scaleFactorVh,
    height: fieldHeight * scaleFactorVh,
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
    },
  ): void {
    const {
      state,
      stage,
      circle_radius: circleRadius,
      provide_feedback: provideFeedback,
    } = trial;
    const { fontSize } = state.getGeneralSettings();

    // Reset state for this stage (in case state was modified by previous stages during timeline construction)
    state.startStage(stage);
    const layout = state.getCurrentLayout();

    // State variables local to trial
    const clickSequence: string[] = []; // Track all clicks in order
    let lastClickedLabel: string | null = null; // Track the most recent click
    const lines: SVGLineElement[] = [];
    let svgElement: SVGSVGElement | null = null;
    let trialEnded = false;
    let doneButton: HTMLButtonElement | null = null;
    const circleElements = new Map<string, HTMLElement>(); // Store circle elements by label

    // Helper function to get instruction text
    const getInstructionText = (): string => {
      switch (stage) {
        case 'practice1':
          return 'Click the circles in order: 1, 2, 3, 4, 5, 6, 7, 8';
        case 'task1':
          return 'Click the circles in order: 1, 2, 3, ... 25';
        case 'practice2':
          return 'Click the circles in order: 1, A, 2, B, 3, C, 4, D';
        case 'task2':
          return 'Click the circles in order: 1, A, 2, B, 3, C, ... 13';
        default:
          return '';
      }
    };

    // Helper function to update Done button state
    const updateDoneButton = (): void => {
      if (doneButton && !provideFeedback) {
        doneButton.disabled = false;
        doneButton.style.backgroundColor = '#4a90e2';
        doneButton.style.color = 'white';
        doneButton.style.cursor = 'pointer';
      }
    };

    // Helper function to remove the last line
    const removeLastLine = (): void => {
      if (lines.length > 0) {
        const lastLine = lines.pop();
        if (lastLine && lastLine.parentNode) {
          lastLine.parentNode.removeChild(lastLine);
        }
      }
    };

    // Helper function to update circle colors based on selection state
    const updateCircleColor = (circleEl: HTMLElement, label: string): void => {
      if (!provideFeedback) {
        // For main trials: yellow if last clicked, grey if previously clicked
        if (label === lastClickedLabel) {
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = '#FFD700'; // Yellow for most recent
          // eslint-disable-next-line no-param-reassign
          circleEl.style.borderColor = '#999'; // Neutral border
        } else if (clickSequence.includes(label)) {
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = '#E0E0E0'; // Grey for previously clicked
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

    // Helper function to recolor all circles based on current state
    const recolorAllCircles = (): void => {
      if (!provideFeedback) {
        circleElements.forEach((circleEl, label) => {
          updateCircleColor(circleEl, label);
        });
      }
    };

    // Helper function to draw line between two circles
    const drawLineToCircle = (toCircle: CirclePosition): void => {
      if (!svgElement) return;

      if (clickSequence.length < 2) return;

      // Get the previous circle from the sequence
      const prevLabel = clickSequence[clickSequence.length - 2];
      const prevCircle = layout.circles.find((c) => c.label === prevLabel);

      if (!prevCircle) return;

      // Create line
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
      lines.push(line);
    };

    // Helper function to end the trial
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
        completed: result.completed,
      };

      this.jsPsych.finishTrial(trialData);
    };

    // Helper function to handle circle click
    const handleCircleClick = (
      circle: CirclePosition,
      circleEl: HTMLElement,
    ): void => {
      if (trialEnded) return;

      // Enable Done button on first click for main trials
      if (!provideFeedback) {
        updateDoneButton();
      }

      // Check if this is the last clicked circle (undo/correction)
      if (circle.label === lastClickedLabel) {
        // Undo the last click
        clickSequence.pop();
        removeLastLine();
        lastClickedLabel =
          clickSequence.length > 0
            ? clickSequence[clickSequence.length - 1]
            : null;
        recolorAllCircles();
        return;
      }

      // Only allow new clicks (not attempts to correct non-last circles) - but still
      // process them through recordClick for validation and error tracking
      const { isCorrect, isComplete, wasError } = state.recordClick(
        circle.label,
        layout,
      );

      if (isCorrect) {
        // Record successful click
        clickSequence.push(circle.label);

        if (provideFeedback) {
          // Show feedback colors for practice trials
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = '#90EE90'; // Light green
          // eslint-disable-next-line no-param-reassign
          circleEl.style.borderColor = '#228B22'; // Forest green
        }

        // Draw line from previous circle if not the first
        if (clickSequence.length > 1) {
          drawLineToCircle(circle);
        }

        // Update tracking
        lastClickedLabel = circle.label;
        recolorAllCircles();

        if (isComplete) {
          if (provideFeedback) {
            // Auto-complete practice trials
            endTrial();
          }
        }
        return;
      }

      // Handle incorrect clicks
      if (wasError) {
        // Self-correction: clicking the same wrong circle again
        if (provideFeedback) {
          // Show brief gold flash for self-correction in practice
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = '#FFD700'; // Gold
          setTimeout(() => {
            // eslint-disable-next-line no-param-reassign
            circleEl.style.backgroundColor = '#FFB6C6';
          }, 200);
        }
      } else if (provideFeedback) {
        // New error - show red flash only for practice trials
        // eslint-disable-next-line no-param-reassign
        circleEl.style.backgroundColor = '#FFB6C6'; // Light red
        // eslint-disable-next-line no-param-reassign
        circleEl.style.borderColor = '#DC143C'; // Crimson

        // Flash effect
        setTimeout(() => {
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = '#FFB6C6';
        }, 200);
      } else {
        // For main trials, record the incorrect click but don't show color feedback
        // Incorrect click still added to sequence for tracking
        clickSequence.push(circle.label);
        lastClickedLabel = circle.label;
        recolorAllCircles();

        if (clickSequence.length > 1) {
          drawLineToCircle(circle);
        }
      }
    };

    // Setup display element
    const element = displayElement;
    element.className = `trail-making-trial font-${fontSize}`;

    // Get field dimensions for this stage
    const fieldDimensions = getFieldDimensions(stage);

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
        width: ${circleRadius * 2}px;
        height: ${circleRadius * 2}px;
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

      // Store reference for later access during coloring
      circleElements.set(circle.label, circleEl);

      // Add click handler
      circleEl.addEventListener('click', () => {
        handleCircleClick(circle, circleEl);
      });

      // Hover effect - only show for non-clicked circles
      circleEl.addEventListener('mouseenter', () => {
        if (!clickSequence.includes(circle.label)) {
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = '#e8e8e8';
        }
      });
      circleEl.addEventListener('mouseleave', () => {
        if (!clickSequence.includes(circle.label)) {
          // eslint-disable-next-line no-param-reassign
          circleEl.style.backgroundColor = 'white';
        }
      });

      container.appendChild(circleEl);
    });

    // Add instruction text
    const instructionDiv = document.createElement('div');
    instructionDiv.className = 'trail-making-instruction';
    instructionDiv.style.cssText = `
      text-align: center;
      margin-bottom: 10px;
      font-size: 1.2em;
      font-weight: bold;
    `;
    instructionDiv.innerHTML = getInstructionText();

    displayElement.appendChild(instructionDiv);
    displayElement.appendChild(container);

    // Create and add Done button that appears when sequence is complete (only for main trials)
    if (!provideFeedback) {
      doneButton = document.createElement('button');
      doneButton.textContent = 'Done';
      doneButton.disabled = true;
      doneButton.style.cssText = `
        margin-top: 20px;
        padding: 10px 30px;
        font-size: 1.1em;
        cursor: pointer;
        background-color: #cccccc;
        color: #000;
        border: 1px solid #999;
        border-radius: 4px;
      `;
      doneButton.addEventListener('click', () => {
        if (!trialEnded) {
          endTrial();
        }
      });
      displayElement.appendChild(doneButton);
    }

    // Add start/end markers if practice
    if (stage === 'practice1' || stage === 'practice2') {
      const firstCircle = layout.circles[0];
      const lastCircle = layout.circles[layout.circles.length - 1];

      const startMarker = document.createElement('div');
      startMarker.style.cssText = `
        position: absolute;
        left: ${firstCircle.x}%;
        top: calc(${firstCircle.y}% - 50px);
        transform: translateX(-50%);
        font-weight: bold;
        color: green;
        z-index: 10;
      `;
      startMarker.textContent = 'START';
      container.appendChild(startMarker);

      const endMarker = document.createElement('div');
      endMarker.style.cssText = `
        position: absolute;
        left: ${lastCircle.x}%;
        top: calc(${lastCircle.y}% + 50px);
        transform: translateX(-50%);
        font-weight: bold;
        color: red;
        z-index: 10;
      `;
      endMarker.textContent = 'END';
      container.appendChild(endMarker);
    }
  }
}

export default TrailMakingStimulusPlugin;
