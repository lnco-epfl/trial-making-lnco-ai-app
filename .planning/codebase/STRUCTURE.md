# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
trial-making-lnco-ai-app/
├── src/                       # Application source code
│   ├── @types/               # TypeScript type definitions
│   ├── config/               # Configuration and setup
│   ├── locales/              # i18n language files
│   ├── mocks/                # Mock API data for testing
│   ├── modules/              # Feature modules
│   ├── utils/                # Shared utilities and hooks
│   ├── main.tsx              # Entry point
│   ├── env.d.ts              # Environment variable types
│   └── index.css             # Global styles
├── cypress/                  # E2E tests
├── public/                   # Static assets
├── build/                    # Build output (generated)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── index.html                # HTML template
```

## Directory Purposes

**src/@types/:**
- Purpose: Custom TypeScript type augmentations and declarations
- Contains: i18next module types (`i18next.d.ts`)
- Key files: `i18next.d.ts` extends i18next for custom namespaces

**src/config/:**
- Purpose: Application configuration, initialization, and environment setup
- Contains: Environment variables, API clients, internationalization, error tracking
- Key files:
  - `env.ts` - Environment variable definitions and getters
  - `queryClient.tsx` - Graasp query client and React Query setup
  - `appData.ts` - App data types (ExperimentResults, Settings)
  - `appResults.ts` - Result types (ExperimentResult, TrialData)
  - `sentry.ts` - Error tracking initialization
  - `i18n.ts` - i18next language setup
  - `selectors.ts` - Test selectors (data-cy attributes)

**src/modules/:**
- Purpose: Feature-organized business logic and UI components
- Main subdirectories:

**src/modules/main/:**
- Purpose: Top-level app routing and view orchestration
- Contains: Context routing, view selection based on permissions
- Key files:
  - `App.tsx` - Main router (Builder/Player/Analytics)
  - `Root.tsx` - Provider setup and theme configuration
  - `PlayerView.tsx` - Participant experiment view
  - `BuilderView.tsx` - Experimenter configuration view
  - `AdminView.tsx` - Admin results and settings tabs
  - `ExperimentLoader.tsx` - Loads settings and runs jsPsych

**src/modules/context/:**
- Purpose: Global state management via React Context
- Key files:
  - `SettingsContext.tsx` - All experiment settings (general, trail making, breaks, photodiode, next step)
  - `ExperimentContext.tsx` - Participant results and result listing for admins

**src/modules/experiment/:**
- Purpose: Trail Making Task experiment implementation
- Subdirectories:
  - `jspsych/` - jsPsych integration and state management
  - `parts/` - Experiment flow builders (introduction, practice, tasks)
  - `trials/` - Trial plugins and implementations
  - `triggers/` - Input trigger mechanisms (serial port)
  - `utils/` - Constants, types, and utilities
  - `styles/` - Experiment-specific SCSS
- Key files:
  - `experiment.ts` - Main `run()` function, timeline orchestration
  - `jspsych/experiment-state-class.ts` - Centralized state machine
  - `trials/trail-making-stimulus-trial.ts` - Interactive circle-clicking plugin

**src/modules/settings/:**
- Purpose: UI components for configuring experiment settings
- Contains: Forms and panels for each setting category
- Key files:
  - `SettingsView.tsx` - Main settings container with save button
  - `GeneralSettingsView.tsx` - Font size, skip instructions/practice
  - `TrailMakingSettingsView.tsx` - Enable stages, circle radius, feedback
  - `BreakSettingsView.tsx` - Break frequency and duration
  - `PhotoDiodeSettingsView.tsx` - Photodiode positioning and test mode
  - `NextStepSettings.tsx` - Link to next experiment

**src/modules/answers/:**
- Purpose: Display experiment results for admins
- Key files:
  - `ResultsView.tsx` - Table of all participant results
  - `ResultsRow.tsx` - Single result row component

**src/modules/common/:**
- Purpose: Reusable UI components
- Key files:
  - `Loader.tsx` - Loading spinner
  - `CustomToasts.tsx` - Toast notification components
  - `ErrorBoundary.tsx` - React error boundary

**src/utils/:**
- Purpose: Shared utilities and hooks
- Key files:
  - `hooks.ts` - `useObjectState` custom hook for object state management

**src/mocks/:**
- Purpose: Mock data for testing and standalone mode
- Key files:
  - `db.ts` - Mock database with Graasp structures

## Key File Locations

**Entry Points:**
- `src/main.tsx` - React app entry point, Sentry init, mock API setup
- `src/modules/Root.tsx` - Provider hierarchy and theme setup
- `src/modules/main/App.tsx` - View routing based on permission

**Configuration:**
- `src/config/env.ts` - Environment variables
- `src/config/appData.ts` - App data structure types
- `src/config/queryClient.tsx` - Graasp and React Query setup
- `tsconfig.json` - TypeScript compiler configuration with path aliases
- `vite.config.ts` - Build configuration

**Core Logic:**
- `src/modules/experiment/experiment.ts` - Experiment timeline and run function
- `src/modules/experiment/jspsych/experiment-state-class.ts` - State machine
- `src/modules/context/SettingsContext.tsx` - Settings state and CRUD
- `src/modules/context/ExperimentContext.tsx` - Results state and CRUD

**Testing:**
- `cypress/` - End-to-end tests
- `cypress/fixtures/` - Test data (members, mock items)
- `cypress.config.ts` - Cypress configuration

## Naming Conventions

**Files:**
- Components: PascalCase with .tsx extension (e.g., `PlayerView.tsx`, `SettingsView.tsx`)
- Utilities: camelCase with .ts extension (e.g., `utils.ts`, `hooks.ts`)
- Constants: UPPER_SNAKE_CASE in files (e.g., `constants.ts`)
- Types: Defined inline in files or in separate files (usually .ts)

**Directories:**
- Feature modules: lowercase (e.g., `experiment`, `settings`, `answers`)
- Type folders: `@types` prefix for TypeScript augmentations

**Variables/Constants:**
- Constants: UPPER_SNAKE_CASE (e.g., `PRACTICE1_FIELD`, `TASK2_FIELD`)
- Functions/methods: camelCase (e.g., `buildTask1()`, `isStageEnabled()`)
- React components: PascalCase (e.g., `ExperimentLoader`, `AdminView`)
- Types: PascalCase with Type/Settings suffix (e.g., `GeneralSettingsType`, `TrailMakingResult`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/modules/[feature-name]/` (create new directory)
- Components: `src/modules/[feature-name]/` for page/container components
- Tests: `cypress/e2e/[feature-name]/` for E2E, or co-locate unit tests

**New Component/Module:**
- Implementation: `src/modules/[parent-feature]/[ComponentName].tsx` (PascalCase)
- Re-export from parent if needed for barrel imports

**Utilities:**
- Shared helpers: `src/utils/` for general utilities
- Feature-specific: `src/modules/[feature]/utils/` for feature utilities
- Constants: `src/modules/experiment/utils/constants.ts` for experiment-wide constants

**Settings/Configuration:**
- Add new setting type to `src/modules/context/SettingsContext.tsx` (add to `AllSettingsType`)
- Create corresponding form component in `src/modules/settings/[SettingName]View.tsx`
- Add UI panel to `src/modules/settings/SettingsView.tsx`

**Experiment Trial:**
- New trial type: Create file in `src/modules/experiment/trials/[trial-name].ts`
- Register in timeline: Add to appropriate part builder in `src/modules/experiment/parts/`

## Special Directories

**build/:**
- Purpose: Vite build output directory
- Generated: Yes
- Committed: No (.gitignore excludes)

**.planning/:**
- Purpose: Documentation and planning artifacts
- Generated: No (manually created by mapping tools)
- Committed: Yes

**node_modules/:**
- Purpose: Installed npm dependencies
- Generated: Yes
- Committed: No

**public/:**
- Purpose: Static assets served at root
- Generated: No
- Committed: Yes (contains MSW service worker and static files)
