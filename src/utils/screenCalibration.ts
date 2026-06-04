import { GeneralSettingsType } from '@/modules/context/SettingsContext';

export type ScreenCalibration = {
  fontSize?: GeneralSettingsType['fontSize'];
  scale?: number;
  participantId?: string;
  participantCode?: string;
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

const isValidParticipantField = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

export const parseScreenCalibration = (
  value: unknown,
): ScreenCalibration | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const calibration = value as {
    fontSize?: unknown;
    scale?: unknown;
    participantId?: unknown;
    participantCode?: unknown;
  };

  const parsed: ScreenCalibration = {};

  if (isValidFontSize(calibration.fontSize)) {
    parsed.fontSize = calibration.fontSize;
  }

  if (isValidScale(calibration.scale)) {
    parsed.scale = calibration.scale;
  }

  if (isValidParticipantField(calibration.participantId)) {
    parsed.participantId = calibration.participantId;
  }

  if (isValidParticipantField(calibration.participantCode)) {
    parsed.participantCode = calibration.participantCode;
  }

  if (
    parsed.fontSize === undefined &&
    parsed.scale === undefined &&
    parsed.participantId === undefined &&
    parsed.participantCode === undefined
  ) {
    return undefined;
  }

  return parsed;
};
