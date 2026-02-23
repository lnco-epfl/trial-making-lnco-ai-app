import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { TrailMakingSettingsType } from '../context/SettingsContext';

type Props = {
  trailMakingSettings: TrailMakingSettingsType;
  onChange: (newSettings: TrailMakingSettingsType) => void;
};

const TrailMakingSettingsView: FC<Props> = ({
  trailMakingSettings,
  onChange,
}) => {
  const { t } = useTranslation();

  const handleChange = (
    setting: keyof TrailMakingSettingsType,
    value: unknown,
  ): void => {
    onChange({
      ...trailMakingSettings,
      [setting]: value,
    });
  };

  return (
    <Stack spacing={2} padding={2}>
      <Typography variant="h6">
        {t('SETTINGS.TRAIL_MAKING_TITLE') || 'Trail Making Task Settings'}
      </Typography>

      <Typography variant="subtitle2">
        {t('SETTINGS.STAGE_CONFIGURATION') || 'Stage Configuration'}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={trailMakingSettings.enablePractice1}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('enablePractice1', e.target.checked)
            }
          />
        }
        label={
          t('SETTINGS.ENABLE_PRACTICE1') || 'Enable Practice 1 (Numbers 1-8)'
        }
      />

      <FormControlLabel
        control={
          <Switch
            checked={trailMakingSettings.enableTask1}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('enableTask1', e.target.checked)
            }
          />
        }
        label={t('SETTINGS.ENABLE_TASK1') || 'Enable Task 1 (Numbers 1-25)'}
      />

      <FormControlLabel
        control={
          <Switch
            checked={trailMakingSettings.enablePractice2}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('enablePractice2', e.target.checked)
            }
          />
        }
        label={
          t('SETTINGS.ENABLE_PRACTICE2') ||
          'Enable Practice 2 (Numbers + Letters 1-D)'
        }
      />

      <FormControlLabel
        control={
          <Switch
            checked={trailMakingSettings.enableTask2}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('enableTask2', e.target.checked)
            }
          />
        }
        label={
          t('SETTINGS.ENABLE_TASK2') || 'Enable Task 2 (Numbers + Letters 1-13)'
        }
      />

      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        {t('SETTINGS.DISPLAY_SETTINGS') || 'Display Settings'}
      </Typography>

      <TextField
        fullWidth
        type="number"
        label={t('SETTINGS.CIRCLE_RADIUS') || 'Circle Radius (pixels)'}
        helperText={
          t('SETTINGS.CIRCLE_RADIUS_HELP') ||
          'Size of the circles containing numbers/letters'
        }
        value={trailMakingSettings.circleRadius}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('circleRadius', parseInt(e.target.value, 10))
        }
        inputProps={{ min: 15, max: 50 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={trailMakingSettings.showInstructions}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('showInstructions', e.target.checked)
            }
          />
        }
        label={t('SETTINGS.SHOW_INSTRUCTIONS') || 'Show detailed instructions'}
      />

      <FormControlLabel
        control={
          <Switch
            checked={trailMakingSettings.provideFeedback}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('provideFeedback', e.target.checked)
            }
          />
        }
        label={
          t('SETTINGS.PROVIDE_FEEDBACK') ||
          'Provide immediate feedback in practice'
        }
      />

      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        {t('SETTINGS.TRAIL_MAKING_NOTE') ||
          'Note: Custom layouts for each stage can be configured in the advanced settings. Default layouts are used if not specified.'}
      </Typography>
    </Stack>
  );
};

export default TrailMakingSettingsView;
