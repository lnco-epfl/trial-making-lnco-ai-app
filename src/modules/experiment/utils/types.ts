// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Timeline = any[];

export type Trial = {
  type?: unknown;
} & Record<string, unknown>;

export type FieldDefinition = {
  type: 'practice1' | 'task1' | 'practice2' | 'task2';
  size: [number, number];
  targets: {
    label: string;
    x: number;
    y: number;
  }[];
};

// Minimal shape stage builders need — lets experiment.ts swap in a no-op
// stub when narration is disabled without builders knowing about settings.
export type NarrationPlayer = {
  play: (src: string) => void;
  stop: () => void;
};
