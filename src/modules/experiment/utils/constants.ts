import { FieldDefinition } from './types';

const arrowSize = 120;

export const leftArrowSVG = `
<svg width="${arrowSize}" height="${arrowSize}" viewBox="0 0 24 24">
  <!-- shaft -->
  <line x1="18" y1="12" x2="8" y2="12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round" />
  <!-- head -->
  <path d="M4 12 L8 8 L8 16 Z" fill="currentColor" />
</svg>
`;

export const rightArrowSVG = `
<svg width="${arrowSize}" height="${arrowSize}" viewBox="0 0 24 24">
  <!-- shaft -->
  <line x1="4" y1="12" x2="16" y2="12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round" />
  <!-- head -->
  <path d="M20 12 L16 8 L16 16 Z" fill="currentColor" />
</svg>
`;

export const neutralSVG = `
<svg width="${arrowSize}" height="${arrowSize}" viewBox="0 0 24 24">
  <rect x="4" y="11" width="16" height="2" fill="currentColor"/>
</svg>
`;

/**
 * Timing constants for experiment trials (in milliseconds)
 * These can be adjusted here to change timing across the entire experiment
 */
export const TIMING = {
  FIXATION_DURATION: 500, // Duration to show fixation cross before stimulus
  LATE_RESPONSE_BUFFER: 0, // Time window after stimulus removal to still accept responses
  POST_TRIAL_GAP: 500, // Time between end of trial and next trial starts
  COUNTDOWN_INTERVAL: 1000, // Interval for break countdown timer (1 second)
} as const;

export const PRACTICE1_FIELD: FieldDefinition = {
  type: 'practice1',
  size: [700, 400],
  targets: [
    {
      label: '1',
      x: 53.57,
      y: 47.5,
    },
    {
      label: '2',
      x: 73.07,
      y: 12.5,
    },
    {
      label: '3',
      x: 90.36,
      y: 65.63,
    },
    {
      label: '4',
      x: 64.64,
      y: 25,
    },
    {
      label: '5',
      x: 77.14,
      y: 88.5,
    },
    {
      label: '6',
      x: 16.07,
      y: 88.75,
    },
    {
      label: '7',
      x: 13.36,
      y: 31.25,
    },
    {
      label: '8',
      x: 44,
      y: 27.5,
    },
  ],
};

export const PRACTICE2_FIELD: FieldDefinition = {
  type: 'practice2',
  size: [700, 400],
  targets: [
    {
      label: '1',
      x: 53.57,
      y: 47.5,
    },
    {
      label: 'A',
      x: 73.07,
      y: 12.5,
    },
    {
      label: '2',
      x: 90.36,
      y: 65.63,
    },
    {
      label: 'B',
      x: 64.64,
      y: 25,
    },
    {
      label: '3',
      x: 77.14,
      y: 88.5,
    },
    {
      label: 'C',
      x: 16.07,
      y: 88.75,
    },
    {
      label: '4',
      x: 13.36,
      y: 31.25,
    },
    {
      label: 'D',
      x: 44,
      y: 27.5,
    },
  ],
};

export const TASK1_FIELD: FieldDefinition = {
  type: 'task1',
  size: [2480, 3500],
  targets: [
    {
      label: '1',
      x: 70.65,
      y: 58.77,
    },
    {
      label: '2',
      x: 45.89,
      y: 69.14,
    },
    {
      label: '3',
      x: 77.02,
      y: 75.23,
    },
    {
      label: '4',
      x: 77.18,
      y: 39.71,
    },
    {
      label: '5',
      x: 41.69,
      y: 41,
    },
    {
      label: '6',
      x: 59.63,
      y: 49.49,
    },
    {
      label: '7',
      x: 38.79,
      y: 57.66,
    },
    {
      label: '8',
      x: 22.34,
      y: 71.8,
    },
    {
      label: '9',
      x: 26.41,
      y: 82.66,
    },
    {
      label: '10',
      x: 35.48,
      y: 71.43,
    },
    {
      label: '11',
      x: 62.5,
      y: 86.11,
    },
    {
      label: '12',
      x: 9.52,
      y: 88,
    },
    {
      label: '13',
      x: 21.97,
      y: 48.71,
    },
    {
      label: '14',
      x: 9.76,
      y: 60,
    },
    {
      label: '15',
      x: 8.87,
      y: 12.86,
    },
    {
      label: '16',
      x: 24.39,
      y: 28.11,
    },
    {
      label: '17',
      x: 55.4,
      y: 12.57,
    },
    {
      label: '18',
      x: 49.88,
      y: 31.74,
    },
    {
      label: '19',
      x: 82.26,
      y: 22,
    },
    {
      label: '20',
      x: 64.52,
      y: 20.43,
    },
    {
      label: '21',
      x: 91.53,
      y: 13.14,
    },
    {
      label: '22',
      x: 90.73,
      y: 39.66,
    },
    {
      label: '23',
      x: 90.81,
      y: 90.17,
    },
    {
      label: '24',
      x: 85.04,
      y: 57.77,
    },
    {
      label: '25',
      x: 79.31,
      y: 86.74,
    },
  ],
};

export const TASK2_FIELD: FieldDefinition = {
  type: 'task2',
  size: [2480, 3500],
  targets: [
    {
      label: '1',
      x: 79.64,
      y: 14.06,
    },
    {
      label: 'A',
      x: 85.32,
      y: 43.49,
    },
    {
      label: '2',
      x: 91.13,
      y: 10.63,
    },
    {
      label: 'B',
      x: 91.45,
      y: 61.17,
    },
    {
      label: '3',
      x: 91.45,
      y: 87.23,
    },
    {
      label: 'C',
      x: 64.6,
      y: 80,
    },
    {
      label: '4',
      x: 82.5,
      y: 79.09,
    },
    {
      label: 'D',
      x: 49.55,
      y: 69.11,
    },
    {
      label: '5',
      x: 55.65,
      y: 88.14,
    },
    {
      label: 'E',
      x: 24.29,
      y: 72.74,
    },
    {
      label: '6',
      x: 8.95,
      y: 87.91,
    },
    {
      label: 'F',
      x: 9.6,
      y: 40.57,
    },
    {
      label: '7',
      x: 22.38,
      y: 51.89,
    },
    {
      label: 'G',
      x: 9.6,
      y: 12.69,
    },
    {
      label: '8',
      x: 62.66,
      y: 14.49,
    },
    {
      label: 'H',
      x: 35.81,
      y: 29.46,
    },
    {
      label: '9',
      x: 26.21,
      y: 18.34,
    },
    {
      label: 'I',
      x: 21.74,
      y: 29,
    },
    {
      label: '10',
      x: 38.39,
      y: 43.29,
    },
    {
      label: 'J',
      x: 59.47,
      y: 50.91,
    },
    {
      label: '11',
      x: 41.53,
      y: 59.43,
    },
    {
      label: 'K',
      x: 77.34,
      y: 60.94,
    },
    {
      label: '12',
      x: 76.61,
      y: 25.6,
    },
    {
      label: 'L',
      x: 45.97,
      y: 31.77,
    },
    {
      label: '13',
      x: 70.65,
      y: 42.14,
    },
  ],
};
