import { FC } from 'react';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Button, Stack as MuiStack } from '@mui/material';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { format } from 'date-fns';
import { DataCollection } from 'jspsych';

import useExperimentResults from '../context/ExperimentContext';
import ResultsRow from './ResultsRow';

const downloadJson: (json: string, filename: string) => void = (
  json: string,
  filename: string,
): void => {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement('a');
  anchor.setAttribute('hidden', '');
  anchor.setAttribute('href', url);
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

const downloadCsv: (csv: string, filename: string) => void = (
  csv: string,
  filename: string,
): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement('a');
  anchor.setAttribute('hidden', '');
  anchor.setAttribute('href', url);
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

const trialsToCsv = (trials: unknown[]): string => {
  if (trials.length === 0) return '';

  // Get all unique keys from trials
  const allKeys = new Set<string>();
  trials.forEach((trial) => {
    if (trial && typeof trial === 'object') {
      Object.keys(trial).forEach((key) => allKeys.add(key));
    }
  });

  const keys = Array.from(allKeys).sort();
  const header = keys.join(',');
  const rows = trials.map((trial) =>
    keys
      .map((key) => {
        const value =
          trial && typeof trial === 'object'
            ? (trial as Record<string, unknown>)[key]
            : '';
        // Escape CSV values
        if (value === null || value === undefined) return '';
        const strValue = String(value);
        if (
          strValue.includes(',') ||
          strValue.includes('"') ||
          strValue.includes('\n')
        ) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
      .join(','),
  );

  return [header, ...rows].join('\n');
};

const ResultsView: FC = () => {
  const { allExperimentResultsAppData, deleteExperimentResult } =
    useExperimentResults();

  const allData = (): string => {
    const completeJSON: string[] = [];
    allExperimentResultsAppData?.forEach((data) => {
      const experimentJSON = data.data.rawData
        ? new DataCollection(data.data.rawData.trials)
        : undefined;
      if (experimentJSON) {
        completeJSON.push(experimentJSON.json());
      }
    });
    return `[${completeJSON.toString()}]`;
  };

  const allDataCsv = (): string => {
    const allTrials: unknown[] = [];
    allExperimentResultsAppData?.forEach((data) => {
      if (data.data.rawData?.trials) {
        // Add user information to each trial
        data.data.rawData.trials.forEach((trial) => {
          if (trial && typeof trial === 'object') {
            const trialWithUser = {
              ...trial,
              user: data.creator?.name,
              user_id: data.creator?.id,
            };
            allTrials.push(trialWithUser);
          } else {
            allTrials.push(trial);
          }
        });
      }
    });
    return trialsToCsv(allTrials);
  };

  return (
    <Stack spacing={2}>
      <Stack justifyContent="space-between" direction="row">
        <Typography variant="h3">TMT Task Results</Typography>
        <MuiStack direction="row" spacing={1}>
          <Button
            variant="text"
            onClick={() => {
              downloadJson(
                allData(),
                `tmt_all_${format(new Date(), 'yyyyMMdd_HH.mm')}.json`,
              );
            }}
          >
            <FileDownloadIcon />
            Export All (JSON)
          </Button>
          <Button
            variant="text"
            onClick={() => {
              downloadCsv(
                allDataCsv(),
                `tmt_all_${format(new Date(), 'yyyyMMdd_HH.mm')}.csv`,
              );
            }}
          >
            <FileDownloadIcon />
            Export All (CSV)
          </Button>
        </MuiStack>
      </Stack>
      <TableContainer component={Paper}>
        <Table aria-label="answers table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Accuracy (%)</TableCell>
              <TableCell>Correct/Total</TableCell>
              <TableCell>Data Size</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allExperimentResultsAppData?.map((data) => {
              const rawData = data.data.rawData
                ? new DataCollection(data.data.rawData.trials)
                : undefined;
              const trials = rawData?.values() || [];
              const correctTrials = trials.filter(
                (trial: { correct?: boolean }) => trial.correct === true,
              );
              const totalTrials = trials.filter(
                (trial: { correct?: boolean }) =>
                  trial.correct === true || trial.correct === false,
              );
              const accuracy =
                totalTrials.length > 0
                  ? (correctTrials.length / totalTrials.length) * 100
                  : 0;

              const userData = data.data.rawData?.trials || [];
              const csvData = trialsToCsv(userData);

              return (
                <ResultsRow
                  key={data.id}
                  name={data.creator?.name}
                  accuracy={accuracy}
                  correctCount={correctTrials.length}
                  totalTrials={totalTrials.length}
                  length={rawData ? rawData.count() : 0}
                  rawDataDownload={() =>
                    downloadJson(
                      rawData ? rawData.json() : '[]',
                      `tmt_${data.creator?.name}_${data.updatedAt}_${format(new Date(), 'yyyyMMdd_HH.mm')}.json`,
                    )
                  }
                  csvDataDownload={() =>
                    downloadCsv(
                      csvData,
                      `tmt_${data.creator?.name}_${data.updatedAt}_${format(new Date(), 'yyyyMMdd_HH.mm')}.csv`,
                    )
                  }
                  onDelete={() => deleteExperimentResult(data.id)}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default ResultsView;
