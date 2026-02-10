import { FC, ReactElement, createContext, useContext } from 'react';

import { hooks, mutations } from '../../config/queryClient';
import Loader from '../common/Loader';

export type GeneralSettingsType = {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  skipInstructions: boolean;
  skipPractice: boolean;
};

export type CirclePosition = {
  x: number; // x coordinate (0-100 as percentage)
  y: number; // y coordinate (0-100 as percentage)
  label: string; // '1', '2', 'A', 'B', etc.
};

export type TrailMakingLayout = {
  circles: CirclePosition[];
  sequence: string[]; // correct order: ['1', '2', '3', ...] or ['1', 'A', '2', 'B', ...]
};

export type TrailMakingSettingsType = {
  // Stage configurations
  enablePractice1: boolean; // Practice with numbers 1-8
  enableTask1: boolean; // Full task with numbers 1-25
  enablePractice2: boolean; // Practice with numbers+letters 1-D
  enableTask2: boolean; // Full task with numbers+letters 1-13

  // Layout configurations (hardcoded layouts for each stage)
  practice1Layout: TrailMakingLayout | null; // 1-8
  task1Layout: TrailMakingLayout | null; // 1-25
  practice2Layout: TrailMakingLayout | null; // 1,A,2,B,3,C,4,D
  task2Layout: TrailMakingLayout | null; // 1,a,2,b...13

  // Display settings
  circleRadius: number; // radius of circles in pixels
  showInstructions: boolean; // show detailed instructions
  provideFeedback: boolean; // provide immediate feedback on practice
};

export type BreakSettingsType = {
  enableBreaks: boolean;
  breakFrequency: number; // trials between breaks
  breakDuration: number; // seconds
};

export type PhotoDiodeSettings = {
  usePhotoDiode: 'top-left' | 'top-right' | 'customize' | 'off';
  photoDiodeLeft?: string;
  photoDiodeTop?: string;
  photoDiodeHeight?: string;
  photoDiodeWidth?: string;
  testPhotoDiode?: boolean;
};

export type NextStepSettings = {
  linkToNextPage: boolean;
  title: string;
  description: string;
  link: string;
  linkText: string;
};

// mapping between Setting names and their data type
export type AllSettingsType = {
  generalSettings: GeneralSettingsType;
  trailMakingSettings: TrailMakingSettingsType;
  breakSettings: BreakSettingsType;
  photoDiodeSettings: PhotoDiodeSettings;
  nextStepSettings: NextStepSettings;
};

// default values for the data property of settings by name
const defaultSettingsValues: AllSettingsType = {
  generalSettings: {
    fontSize: 'normal',
    skipInstructions: false,
    skipPractice: false,
  },
  trailMakingSettings: {
    enablePractice1: true,
    enableTask1: true,
    enablePractice2: true,
    enableTask2: true,
    practice1Layout: null, // Will be set by admin
    task1Layout: null,
    practice2Layout: null,
    task2Layout: null,
    circleRadius: 18,
    showInstructions: true,
    provideFeedback: true,
  },
  breakSettings: {
    enableBreaks: false,
    breakFrequency: 30,
    breakDuration: 30,
  },
  photoDiodeSettings: {
    usePhotoDiode: 'off',
  },
  nextStepSettings: {
    linkToNextPage: false,
    title: '',
    description: '',
    link: '',
    linkText: '',
  },
};

// list of the settings names
const ALL_SETTING_NAMES = [
  'generalSettings',
  'trailMakingSettings',
  'breakSettings',
  'photoDiodeSettings',
  'nextStepSettings',
] as const;

// automatically generated types
type AllSettingsNameType = (typeof ALL_SETTING_NAMES)[number];
type AllSettingsDataType = AllSettingsType[keyof AllSettingsType];

export type SettingsContextType = AllSettingsType & {
  saveSettings: (
    name: AllSettingsNameType,
    newValue: AllSettingsDataType,
  ) => void;
};

const defaultContextValue = {
  ...defaultSettingsValues,
  saveSettings: () => null,
};

const SettingsContext = createContext<SettingsContextType>(defaultContextValue);

type Prop = {
  children: ReactElement | ReactElement[];
};

export const SettingsProvider: FC<Prop> = ({ children }) => {
  const { mutate: postAppSetting } = mutations.usePostAppSetting();
  const { mutate: patchAppSetting } = mutations.usePatchAppSetting();
  const {
    data: appSettingsList,
    isLoading,
    isSuccess,
  } = hooks.useAppSettings();

  const saveSettings = (
    name: AllSettingsNameType,
    newValue: AllSettingsDataType,
  ): void => {
    if (appSettingsList) {
      const previousSetting = appSettingsList.find((s) => s.name === name);
      // setting does not exist
      if (!previousSetting) {
        postAppSetting({
          data: newValue,
          name,
        });
      } else {
        patchAppSetting({
          id: previousSetting.id,
          data: newValue,
        });
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const getContextValue = (): SettingsContextType => {
    if (isSuccess) {
      const allSettings: AllSettingsType = ALL_SETTING_NAMES.reduce(
        <T extends AllSettingsNameType>(acc: AllSettingsType, key: T) => {
          const setting = appSettingsList.find((s) => s.name === key);
          if (setting) {
            const settingData =
              setting?.data as unknown as AllSettingsType[typeof key];
            acc[key] = settingData;
          } else {
            acc[key] = defaultSettingsValues[key];
          }
          return acc;
        },
        defaultSettingsValues,
      );
      return {
        ...allSettings,
        saveSettings,
      };
    }
    return defaultContextValue;
  };

  const contextValue = getContextValue();

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType =>
  useContext<SettingsContextType>(SettingsContext);
