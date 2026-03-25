# Trail Making Task App — Claude Reference

This is a **Trail Making Task** app built on the LNCO.ai / Graasp platform. It runs as an embedded app inside the Graasp Player (participant-facing) and Builder (admin-facing).

## Tech Stack

- **Framework:** React + TypeScript + Vite
- **Experiment engine:** jsPsych 8
- **Package manager:** Yarn
- **Translations:** i18next (EN + FR via `src/langs/en.json` / `fr.json`)
- **Settings storage:** Graasp AppSettings API (via `@graasp/sdk` + `queryClient`)

## Source Layout

```
src/
├── langs/                        # i18n translation files (en.json, fr.json)
├── config/                       # App-level config (queryClient, selectors, env, i18n)
├── modules/
│   ├── main/                     # Top-level views: PlayerView, BuilderView, AdminView, AnalyticsView
│   ├── context/
│   │   ├── SettingsContext.tsx   # All settings types + provider (reads/writes Graasp AppSettings)
│   │   └── ExperimentContext.tsx
│   ├── experiment/
│   │   ├── experiment.ts         # Main entry point: builds and runs the jsPsych timeline
│   │   ├── parts/
│   │   │   ├── introduction.ts   # Welcome + instruction screens
│   │   │   ├── practice.ts       # Practice stage builders (practice1, practice2)
│   │   │   └── task-core.ts      # Main task builders (task1, task2)
│   │   ├── trials/
│   │   │   └── trail-making-stimulus-trial.ts  # Custom jsPsych plugin: renders circles, handles clicks
│   │   ├── jspsych/
│   │   │   ├── experiment-state-class.ts  # ExperimentState: all runtime state + click tracking
│   │   │   └── i18n.ts                    # i18next init (reads ?lang= query param)
│   │   ├── utils/
│   │   │   ├── constants.ts      # Circle field layouts (PRACTICE1_FIELD, TASK1_FIELD, etc.)
│   │   │   ├── types.ts          # Timeline/Trial/FieldDefinition types
│   │   │   └── utils.ts          # Utility functions (resolveLink, etc.)
│   │   └── triggers/             # Serial port / trigger support for EEG/physio equipment
│   ├── settings/                 # Admin settings UI views (per-settings-group)
│   └── answers/                  # Results/analytics views
```

## Experiment Structure

The experiment has 4 ordered stages, each independently enable/disable-able:

| Stage       | Description                   | Sequence               |
| ----------- | ----------------------------- | ---------------------- |
| `practice1` | Practice — numbers only       | 1–8                    |
| `task1`     | Main task — numbers only      | 1–25                   |
| `practice2` | Practice — numbers + letters  | 1, A, 2, B, 3, C, 4, D |
| `task2`     | Main task — numbers + letters | 1, A, 2, B … 13        |

Each stage: **intro screen → stimulus trial → completion/feedback screen**.

## Settings

All settings are persisted as Graasp AppSettings. Types are defined in [SettingsContext.tsx](src/modules/context/SettingsContext.tsx):

| Setting group         | Key fields                                                                          |
| --------------------- | ----------------------------------------------------------------------------------- |
| `generalSettings`     | `fontSize`, `skipInstructions`, `skipPractice`                                      |
| `trailMakingSettings` | `enablePractice1/Task1/Practice2/Task2`, layouts, `circleRadius`, `provideFeedback` |
| `breakSettings`       | `enableBreaks`, `breakFrequency`, `breakDuration`                                   |
| `photoDiodeSettings`  | `usePhotoDiode` (off / top-left / top-right / customize), position/size             |
| `nextStepSettings`    | Link to next experiment after completion                                            |

Custom circle layouts per stage can be set by the admin; otherwise default layouts from `constants.ts` are used.

## Adding / Changing Text

All participant-facing strings go through i18next. To change text:

1. Edit `src/langs/en.json` (and `fr.json` for French)
2. Keys are namespaced under `translations.TRAIL_MAKING.*`
3. Use `i18n.t('TRAIL_MAKING.YOUR_KEY')` in experiment code

## Key Patterns

- **Timeline builders** (`buildIntroduction`, `buildPractice1`, etc.) return a `Timeline` array of jsPsych trial objects.
- **`ExperimentState`** is the single source of runtime truth: click tracking, stage results, settings access. Passed into every builder and the stimulus plugin.
- **`TrailMakingStimulusPlugin`** is a custom jsPsych plugin that renders the SVG canvas, handles mouse clicks, records `FrameClickData` and delegates to `ExperimentState.recordClick()`.
- Settings are read once at experiment start via `ExperimentState` constructor — they do not reactively update mid-experiment.

## Autonomous Workflow Rules

When working on features:

1. Use GSD to manage tasks
2. Create feature branches (git checkout -b feature/[name])
3. Implement changes with tests
4. Commit with conventional commits: feat:, fix:, etc.
5. Push when feature is complete
6. Do NOT ask for permission before committing/pushing

## Permission Model

- Can write to src/, tests/, docs/
- Can run git, npm, pnpm
- Cannot modify .env files or run destructive commands

## Parallel Work

- Use git worktrees for independent branches
- Each worktree gets its own Claude Code session
- Both can run simultaneously
