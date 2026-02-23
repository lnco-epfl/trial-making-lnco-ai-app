import {
  AllSettingsType,
  BreakSettingsType,
  GeneralSettingsType,
  NextStepSettings,
  PhotoDiodeSettings,
  TrailMakingLayout,
  TrailMakingSettingsType,
} from '@/modules/context/SettingsContext';
import {
  PRACTICE1_FIELD,
  PRACTICE2_FIELD,
  TASK1_FIELD,
  TASK2_FIELD,
} from '@/modules/experiment/utils/constants';

/**
 * Trail Making Task stages
 */
export type TrailMakingStage =
  | 'practice1' // Numbers 1-8
  | 'task1' // Numbers 1-25
  | 'practice2' // Numbers+Letters 1-D
  | 'task2'; // Numbers+Letters 1-13

/**
 * Trail Making trial definition
 */
export interface TrailMakingTrial {
  stage: TrailMakingStage;
  layout: TrailMakingLayout;
  isPractice: boolean;
}

/**
 * Click data for tracking user interactions
 */
export interface ClickData {
  label: string; // which circle was clicked
  timestamp: number; // when it was clicked
  isCorrect: boolean; // was it the correct next click?
  wasError: boolean; // was this fixing a previous error (self-correction)?
}

/**
 * Trial result data
 */
export interface TrailMakingResult {
  stage: TrailMakingStage;
  timeTaken: number; // seconds
  errorsSelfCorrected: number;
  errorsNonSelfCorrected: number;
  clickSequence: ClickData[];
  completed: boolean;
}

/**
 * Default layouts for each stage
 */
function getDefaultLayout(stage: TrailMakingStage): TrailMakingLayout {
  switch (stage) {
    case 'practice1':
      return {
        circles: PRACTICE1_FIELD.targets.map((target) => ({
          x: target.x,
          y: target.y,
          label: target.label,
        })),
        sequence: ['1', '2', '3', '4', '5', '6', '7', '8'],
      };
    case 'task1':
      return {
        circles: TASK1_FIELD.targets.map((target) => ({
          x: target.x,
          y: target.y,
          label: target.label,
        })),
        sequence: Array.from({ length: 25 }, (_, i) => `${i + 1}`),
      };
    case 'practice2':
      return {
        circles: PRACTICE2_FIELD.targets.map((target) => ({
          x: target.x,
          y: target.y,
          label: target.label,
        })),
        sequence: ['1', 'A', '2', 'B', '3', 'C', '4', 'D'],
      };
    case 'task2':
      return {
        circles: TASK2_FIELD.targets.map((target) => ({
          x: target.x,
          y: target.y,
          label: target.label,
        })),
        sequence: [
          '1',
          'A',
          '2',
          'B',
          '3',
          'C',
          '4',
          'D',
          '5',
          'E',
          '6',
          'F',
          '7',
          'G',
          '8',
          'H',
          '9',
          'I',
          '10',
          'J',
          '11',
          'K',
          '12',
          'L',
          '13',
        ],
      };
    default:
      throw new Error(`Unknown stage: ${stage}`);
  }
}

interface State {
  currentStage: TrailMakingStage | null;
  currentClickIndex: number; // which circle in sequence should be clicked next
  clickHistory: ClickData[];
  startTime: number | null;
  stageResults: TrailMakingResult[];
}

export class ExperimentState {
  private state: State;

  private generalSettings: GeneralSettingsType;

  private trailMakingSettings: TrailMakingSettingsType;

  private breakSettings: BreakSettingsType;

  private photoDiodeSettings: PhotoDiodeSettings;

  private nextStepSettings: NextStepSettings;

  constructor(settings: AllSettingsType) {
    this.generalSettings = settings.generalSettings;
    this.trailMakingSettings = settings.trailMakingSettings;
    this.breakSettings = settings.breakSettings;
    this.photoDiodeSettings = settings.photoDiodeSettings;
    this.nextStepSettings = settings.nextStepSettings;

    // Initialize with empty state
    this.state = {
      currentStage: null,
      currentClickIndex: 0,
      clickHistory: [],
      startTime: null,
      stageResults: [],
    };
  }

  // Getters for settings
  getGeneralSettings(): GeneralSettingsType {
    return this.generalSettings;
  }

  getTrailMakingSettings(): TrailMakingSettingsType {
    return this.trailMakingSettings;
  }

  getBreakSettings(): BreakSettingsType {
    return this.breakSettings;
  }

  getPhotoDiodeSettings(): PhotoDiodeSettings {
    return this.photoDiodeSettings;
  }

  getNextStepSettings(): NextStepSettings {
    return this.nextStepSettings;
  }

  getAllSettings(): AllSettingsType {
    return {
      generalSettings: this.generalSettings,
      trailMakingSettings: this.trailMakingSettings,
      breakSettings: this.breakSettings,
      photoDiodeSettings: this.photoDiodeSettings,
      nextStepSettings: this.nextStepSettings,
    };
  }

  // Stage management
  startStage(stage: TrailMakingStage): void {
    this.state.currentStage = stage;
    this.state.currentClickIndex = 0;
    this.state.clickHistory = [];
    this.state.startTime = Date.now();
  }

  getCurrentStage(): TrailMakingStage | null {
    return this.state.currentStage;
  }

  getCurrentLayout(): TrailMakingLayout {
    const stage = this.state.currentStage;
    if (!stage) {
      throw new Error('No current stage');
    }

    // Try to get custom layout from settings, fall back to default
    switch (stage) {
      case 'practice1':
        return (
          this.trailMakingSettings.practice1Layout || getDefaultLayout(stage)
        );
      case 'task1':
        return this.trailMakingSettings.task1Layout || getDefaultLayout(stage);
      case 'practice2':
        return (
          this.trailMakingSettings.practice2Layout || getDefaultLayout(stage)
        );
      case 'task2':
        return this.trailMakingSettings.task2Layout || getDefaultLayout(stage);
      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  }

  // Click tracking
  recordClick(
    label: string,
    layout: TrailMakingLayout,
  ): {
    isCorrect: boolean;
    isComplete: boolean;
    wasError: boolean;
  } {
    const expectedLabel = layout.sequence[this.state.currentClickIndex];
    const isCorrect = label === expectedLabel;

    // Check if this is a self-correction (clicking the same incorrect circle again)
    const lastClick =
      this.state.clickHistory[this.state.clickHistory.length - 1];
    const wasError =
      lastClick && !lastClick.isCorrect && lastClick.label === label;

    const clickData: ClickData = {
      label,
      timestamp: Date.now(),
      isCorrect,
      wasError,
    };

    this.state.clickHistory.push(clickData);

    if (isCorrect) {
      this.state.currentClickIndex += 1;
    }

    const isComplete = this.state.currentClickIndex >= layout.sequence.length;

    return { isCorrect, isComplete, wasError };
  }

  undoLastClick(): boolean {
    const lastClick = this.state.clickHistory.pop();

    if (!lastClick) {
      return false;
    }

    if (lastClick.isCorrect) {
      this.state.currentClickIndex = Math.max(
        0,
        this.state.currentClickIndex - 1,
      );
    }

    return true;
  }

  // Get current expected click
  getExpectedClick(): string {
    const layout = this.getCurrentLayout();
    return layout.sequence[this.state.currentClickIndex];
  }

  getCurrentClickIndex(): number {
    return this.state.currentClickIndex;
  }

  getClickHistory(): ClickData[] {
    return this.state.clickHistory;
  }

  // Results calculation
  completeStage(): TrailMakingResult {
    const stage = this.state.currentStage;
    if (!stage || !this.state.startTime) {
      throw new Error('No active stage');
    }

    const timeTaken = (Date.now() - this.state.startTime) / 1000; // Convert to seconds

    // Calculate errors
    let errorsSelfCorrected = 0;
    let errorsNonSelfCorrected = 0;

    // Track which incorrect clicks were corrected
    const uncorrectedErrors = new Set<string>();

    this.state.clickHistory.forEach((click) => {
      if (!click.isCorrect) {
        if (click.wasError) {
          // This is a self-correction click (clicking same wrong circle again)
          errorsSelfCorrected += 1;
          uncorrectedErrors.delete(click.label);
        } else {
          // New incorrect click
          uncorrectedErrors.add(click.label);
        }
      }
    });

    errorsNonSelfCorrected = uncorrectedErrors.size;

    const result: TrailMakingResult = {
      stage,
      timeTaken,
      errorsSelfCorrected,
      errorsNonSelfCorrected,
      clickSequence: this.state.clickHistory,
      completed: true,
    };

    this.state.stageResults.push(result);
    return result;
  }

  getStageResults(): TrailMakingResult[] {
    return this.state.stageResults;
  }

  // Helper to determine if a stage is enabled
  isStageEnabled(stage: TrailMakingStage): boolean {
    switch (stage) {
      case 'practice1':
        return this.trailMakingSettings.enablePractice1;
      case 'task1':
        return this.trailMakingSettings.enableTask1;
      case 'practice2':
        return this.trailMakingSettings.enablePractice2;
      case 'task2':
        return this.trailMakingSettings.enableTask2;
      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  }

  // Get list of enabled stages in order
  getEnabledStages(): TrailMakingStage[] {
    const stages: TrailMakingStage[] = [
      'practice1',
      'task1',
      'practice2',
      'task2',
    ];
    return stages.filter((stage) => this.isStageEnabled(stage));
  }
}
