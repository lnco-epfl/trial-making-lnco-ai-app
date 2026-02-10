import { FC, useMemo, useState } from 'react';

import { Box, Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { isEqual } from 'lodash';

import {
  BreakSettingsType,
  GeneralSettingsType,
  NextStepSettings,
  PhotoDiodeSettings,
  TrailMakingSettingsType,
  useSettings,
} from '../context/SettingsContext';
import BreakSettingsView from './BreakSettingsView';
import GeneralSettingsView from './GeneralSettingsView';
import NextStepSettingsView from './NextStepSettings';
import PhotoDiodeSettingsView from './PhotoDiodeSettingsView';
import TrailMakingSettingsView from './TrailMakingSettingsView';

const SettingsView: FC = () => {
  const {
    generalSettings: generalSettingsSaved,
    trailMakingSettings: trailMakingSettingsSaved,
    breakSettings: breakSettingsSaved,
    photoDiodeSettings: photoDiodeSettingsSaved,
    nextStepSettings: nextStepSettingsSaved,
    saveSettings,
  } = useSettings();

  const [generalSettings, updateGeneralSettings] =
    useState<GeneralSettingsType>(generalSettingsSaved);
  const [trailMakingSettings, updateTrailMakingSettings] =
    useState<TrailMakingSettingsType>(trailMakingSettingsSaved);
  const [breakSettings, updateBreakSettings] =
    useState<BreakSettingsType>(breakSettingsSaved);
  const [photoDiodeSettings, updatePhotoDiodeSettings] =
    useState<PhotoDiodeSettings>(photoDiodeSettingsSaved);
  const [nextStepSettings, updateNextStepSettings] = useState<NextStepSettings>(
    nextStepSettingsSaved,
  );

  const saveAllSettings = (): void => {
    saveSettings('generalSettings', generalSettings);
    saveSettings('trailMakingSettings', trailMakingSettings);
    saveSettings('breakSettings', breakSettings);
    saveSettings('photoDiodeSettings', photoDiodeSettings);
    saveSettings('nextStepSettings', nextStepSettings);
  };

  const disableSave = useMemo(() => {
    if (
      isEqual(generalSettingsSaved, generalSettings) &&
      isEqual(trailMakingSettingsSaved, trailMakingSettings) &&
      isEqual(breakSettingsSaved, breakSettings) &&
      isEqual(photoDiodeSettingsSaved, photoDiodeSettings) &&
      isEqual(nextStepSettingsSaved, nextStepSettings)
    ) {
      return true;
    }
    return false;
  }, [
    generalSettingsSaved,
    generalSettings,
    trailMakingSettingsSaved,
    trailMakingSettings,
    breakSettingsSaved,
    breakSettings,
    photoDiodeSettingsSaved,
    photoDiodeSettings,
    nextStepSettingsSaved,
    nextStepSettings,
  ]);

  return (
    <Stack spacing={2}>
      <Typography variant="h3">Settings</Typography>
      <GeneralSettingsView
        generalSettings={generalSettings}
        onChange={updateGeneralSettings}
      />
      <TrailMakingSettingsView
        trailMakingSettings={trailMakingSettings}
        onChange={updateTrailMakingSettings}
      />
      <BreakSettingsView
        breakSettings={breakSettings}
        onChange={updateBreakSettings}
      />
      <PhotoDiodeSettingsView
        photoDiodeSettings={photoDiodeSettings}
        onChange={updatePhotoDiodeSettings}
      />
      <NextStepSettingsView
        nextStepSettings={nextStepSettings}
        onChange={updateNextStepSettings}
      />
      <Box>
        <Button
          variant="contained"
          onClick={saveAllSettings}
          disabled={disableSave}
        >
          Save
        </Button>
      </Box>
    </Stack>
  );
};

export default SettingsView;
