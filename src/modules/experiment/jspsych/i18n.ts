import i18n from 'i18next';

import enTranslation from '../../../langs/en.json';
import frTranslation from '../../../langs/fr.json';

/**
 * @function getQueryParam
 * @description Retrieves the value of a specified query parameter from the URL. Current options are ?lang=en and ?lang=fr
 *
 * @param {string} param - The name of the query parameter to retrieve.
 * @returns {string | null} - The value of the query parameter, or null if not found.
 */
export const getQueryParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Initialize i18next
const language = getQueryParam('lang') || 'en'; // Default to 'en' if not specified

// Initialize synchronously to ensure translations are available immediately
i18n.init({
  resources: {
    en: {
      translation: enTranslation.translations,
    },
    fr: {
      translation: frTranslation.translations,
    },
  },
  lng: language, // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  initImmediate: false, // Initialize synchronously
});

// Base names (without language suffix or extension) for every narration
// clip used across the experiment. This is the single source of truth:
// on-disk files are expected at `assets/audio/${baseName}-${lang}.mp3`.
export const NARRATION_BASE_NAMES = [
  'tst_practice_instructions1',
  'tst_practice_complete1',
  'tst_practice_instructions2',
  'tst_main_instructions1',
  'tst_main_timeout1',
  'tst_main_complete1',
  'tst_main_instructions2',
  'tst_main_timeout2',
  'tst_main_complete2',
] as const;

export type NarrationBaseName = (typeof NARRATION_BASE_NAMES)[number];

/**
 * @function getNarrationSrc
 * @description Builds the narration clip path for the currently active i18n language.
 */
export const getNarrationSrc = (baseName: NarrationBaseName): string =>
  `assets/audio/${baseName}-${i18n.language}.mp3`;

export default i18n;
