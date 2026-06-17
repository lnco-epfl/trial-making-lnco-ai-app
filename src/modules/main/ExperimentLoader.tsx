import { FC, useEffect, useRef, useState } from 'react';

import { Typography } from '@mui/material';

import { useLocalContext } from '@lnco-ai/apps-query-client';
import { Marked } from '@ts-stack/markdown';
import { DataCollection, JsPsych } from 'jspsych';
import { AudioNarration } from 'jspsych-audio-narration';

import { hooks } from '@/config/queryClient';
import { parseScreenCalibration } from '@/utils/screenCalibration';

import { TrialData } from '../config/appResults';
import useExperimentResults from '../context/ExperimentContext';
import { AllSettingsType, useSettings } from '../context/SettingsContext';
import { run } from '../experiment/experiment';
import { resolveLink } from '../experiment/utils/utils';

interface ExperimentLoaderProps {
  narration: AudioNarration;
}

export const ExperimentLoader: FC<ExperimentLoaderProps> = ({ narration }) => {
  const settings = useSettings();
  const localContext = useLocalContext();
  const { memberId } = localContext;
  const screenCalibration = parseScreenCalibration(
    (localContext as unknown as { screenCalibration?: unknown })
      .screenCalibration,
  );
  const hostScale = screenCalibration?.scale ?? 1;
  const { participantId, participantCode } = screenCalibration ?? {};
  const { data: appContextData } = hooks.useAppContext();
  let participantName = '';

  if (appContextData?.members) {
    participantName =
      appContextData.members.find((member) => member.id === memberId)?.name ??
      '';
  }
  const jsPsychRef = useRef<null | Promise<JsPsych>>(null);

  const { status, experimentResultsAppData, setExperimentResult } =
    useExperimentResults();

  const isCompleted = (
    trials: TrialData[],
    // eslint-disable-next-line @typescript-eslint/no-shadow
    _settings: AllSettingsType,
  ): boolean => {
    const { enableTask1, enableTask2 } = _settings.trailMakingSettings;
    // Determine which is the last enabled main task
    let lastStage: 'task1' | 'task2' | null = null;
    if (enableTask2) lastStage = 'task2';
    else if (enableTask1) lastStage = 'task1';
    if (!lastStage) return false;
    return trials.some(
      (trial) =>
        trial.stage === lastStage && (trial.completed || trial.timedOut),
    );
  };

  const updateData = (
    rawData: DataCollection,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    settings: AllSettingsType,
  ): void => {
    const responseArray = rawData.values();
    setExperimentResult({
      rawData: { trials: responseArray },
      settings,
    });
  };

  const assetPath = {
    images: [],
    audio: [],
    video: [],
    misc: [],
  };

  const [completedContent, setCompletedContent] = useState<JSX.Element | null>(
    null,
  );

  useEffect(() => {
    if (status === 'success' && !experimentResultsAppData) {
      setExperimentResult({
        rawData: { trials: [] },
        settings,
      });
    }
    if (!jsPsychRef.current && experimentResultsAppData?.rawData) {
      if (experimentResultsAppData.rawData?.trials.length === 0) {
        jsPsychRef.current = run({
          assetPaths: assetPath,
          input: {
            settings,
            results: experimentResultsAppData,
            participantName,
            screenScale: hostScale,
            participantId,
            participantCode,
          },
          narration,
          // eslint-disable-next-line @typescript-eslint/no-shadow
          updateData: (data, settings) => updateData(data, settings),
        });
      } else if (
        isCompleted(experimentResultsAppData.rawData.trials, settings)
      ) {
        const { nextStepSettings } = settings;
        if (nextStepSettings.linkToNextPage) {
          const resolvedLink = resolveLink(
            nextStepSettings.link,
            participantName,
          );
          setCompletedContent(
            <div
              className="sd-html"
              style={{ backgroundColor: 'white', padding: '24px' }}
            >
              <h3>{nextStepSettings.title}</h3>
              <p
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: Marked.parse(nextStepSettings.description),
                }}
              />
              <a
                className="link-to-experiment"
                target="_parent"
                href={resolvedLink}
              >
                {nextStepSettings.linkText}
              </a>
            </div>,
          );
        } else {
          setCompletedContent(
            <Typography variant="h5" style={{ backgroundColor: 'white' }}>
              You have previously completed this experiment, please reach out to
              the experimenter if this is not correct.
            </Typography>,
          );
        }
      } else {
        // Restart: last enabled task not yet completed
        jsPsychRef.current = run({
          assetPaths: assetPath,
          input: {
            settings,
            results: experimentResultsAppData,
            participantName,
            screenScale: hostScale,
            participantId,
            participantCode,
          },
          narration,
          // eslint-disable-next-line @typescript-eslint/no-shadow
          updateData: (data, settings) => updateData(data, settings),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    experimentResultsAppData,
    hostScale,
    setExperimentResult,
    settings,
    status,
  ]);

  if (completedContent) {
    return completedContent;
  }
  return <div id="jspsych-display-element" />;
};
