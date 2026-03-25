import { GeneralSettingsType } from '@/modules/context/SettingsContext';

export type ScreenCalibration = {
  fontSize?: GeneralSettingsType['fontSize'];
  scale?: number;
};

const FONT_SIZES: GeneralSettingsType['fontSize'][] = [
  'small',
  'normal',
  'large',
  'extra-large',
];

const isValidFontSize = (
  value: unknown,
): value is GeneralSettingsType['fontSize'] =>
  typeof value === 'string' &&
  FONT_SIZES.includes(value as GeneralSettingsType['fontSize']);

const isValidScale = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value > 0.5 &&
  value < 3;

export const parseScreenCalibration = (
  value: unknown,
): ScreenCalibration | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const calibration = value as {
    fontSize?: unknown;
    scale?: unknown;
  };

  const parsed: ScreenCalibration = {};

  if (isValidFontSize(calibration.fontSize)) {
    parsed.fontSize = calibration.fontSize;
  }

  if (isValidScale(calibration.scale)) {
    parsed.scale = calibration.scale;
  }

  if (parsed.fontSize === undefined && parsed.scale === undefined) {
    return undefined;
  }

  return parsed;
};
