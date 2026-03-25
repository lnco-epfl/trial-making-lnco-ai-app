# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Layered React + jsPsych application with context-based state management

**Key Characteristics:**
- React 18.3 frontend with TypeScript
- Context API for state management (SettingsContext, ExperimentContext)
- jsPsych 8.0 as experiment runner engine
- Three-view pattern: Player (participant), Builder (experimenter admin), Analytics (read-only)
- Graasp integration for Graasp platform compatibility
- Permission-based UI routing (PermissionLevel: Admin/Read)

## Layers

**Presentation Layer (React Components):**
- Purpose: User interface and view management
- Location: `src/modules/main/`, `src/modules/settings/`, `src/modules/answers/`
- Contains: Page-level components (App, PlayerView, BuilderView, AdminView), settings panels, results display
- Depends on: Context providers, configuration, hooks
- Used by: Root component, browser DOM

**Context Management Layer:**
- Purpose: Global state for settings and experiment results
- Location: `src/modules/context/`
- Contains: `SettingsContext.tsx` (all experiment settings), `ExperimentContext.tsx` (participant results)
- Depends on: Graasp query client, app data types
- Used by: All presentation components

**Experiment Engine Layer:**
- Purpose: Core Trail Making Task logic powered by jsPsych
- Location: `src/modules/experiment/`
- Contains: Main experiment runner (`experiment.ts`), state management (`experiment-state-class.ts`), trial builders (practice, tasks), plugins
- Depends on: jsPsych library, settings from context, constants/utils
- Used by: ExperimentLoader component

**Configuration & Integration Layer:**
- Purpose: External service configuration and API communication
- Location: `src/config/`
- Contains: Environment variables (`env.ts`), query client setup, Sentry configuration, i18n setup, app data/results types
- Depends on: Graasp SDK, environment at runtime
- Used by: Root provider, context providers, experiment engine

**Utilities & Helpers:**
- Purpose: Reusable functions and constants
- Location: `src/utils/`, `src/modules/experiment/utils/`
- Contains: Custom hooks, type definitions, constants (field layouts), utility functions
- Depends on: React, TypeScript types
- Used by: All layers

## Data Flow

**Experiment Execution Flow:**

1. User logs in → `Root` initializes Graasp context
2. `App` routes based on permission level (Builder/Player/Analytics)
3. In Player mode:
   - `PlayerView` renders `ExperimentLoader`
   - `ExperimentLoader` loads `SettingsContext` (configurations from Graasp app data)
   - Calls `run()` from `experiment.ts` with settings
4. `run()` initializes `ExperimentState`, builds timeline (introduction → practice1 → task1 → practice2 → task2)
5. jsPsych executes timeline on `#jspsych-display-element`
6. Each trial (TrailMakingStimulusPlugin) captures click data
7. On trial completion, `updateData()` callback updates results via `ExperimentContext`
8. Results persisted to Graasp AppData

**Settings Management Flow:**

1. `BuilderView` with Admin permission shows `AdminView`
2. `AdminView` tabs: Results (ResultsView) and Settings (SettingsView)
3. `SettingsView` renders panels: GeneralSettings, TrailMakingSettings, BreakSettings, PhotoDiodeSettings, NextStepSettings
4. Each panel reads/updates local state, calls `saveSettings()` on save
5. `saveSettings()` from `SettingsContext` persists to Graasp AppData
6. Settings retrieved fresh on next player session

**State Management:**

- **Global state:** SettingsContext (all experiment configurations), ExperimentContext (participant results, all results if admin)
- **Local state:** Form states in settings panels, UI state in AdminView (active tab)
- **Server state:** Graasp AppData queries via `@graasp/apps-query-client` and React Query

## Key Abstractions

**ExperimentState:**
- Purpose: Centralized state machine for experiment progression and data collection
- Examples: `src/modules/experiment/jspsych/experiment-state-class.ts`
- Pattern: Class-based state management with getter methods for accessing nested settings

**TrailMakingStimulusPlugin:**
- Purpose: jsPsych plugin implementing interactive trail drawing UI
- Examples: `src/modules/experiment/trials/trail-making-stimulus-trial.ts`
- Pattern: jsPsych plugin architecture with trial parameters, data collection, and completion callback

**TrailMakingLayout:**
- Purpose: Defines circle positions and correct sequence for a stage
- Examples: Used in SettingsContext type definitions, populated from TASK1_FIELD, TASK2_FIELD constants
- Pattern: Object with `circles: CirclePosition[]` (x, y, label) and `sequence: string[]` (correct order)

## Entry Points

**Browser Entry Point:**
- Location: `src/main.tsx`
- Triggers: Page load
- Responsibilities: Initialize Sentry, set up mock API (if MOCK_API=true), render Root component into DOM

**Component Root:**
- Location: `src/modules/Root.tsx`
- Triggers: Called from main.tsx
- Responsibilities: Wrap app in providers (MUI theme, i18n, query client, Graasp context), initialize error boundary

**Application Router:**
- Location: `src/modules/main/App.tsx`
- Triggers: After Graasp context loaded
- Responsibilities: Route to BuilderView/PlayerView/AnalyticsView based on context.context (permission level), provide SettingsProvider and ExperimentResultsProvider

**Experiment Execution:**
- Location: `src/modules/main/ExperimentLoader.tsx`
- Triggers: PlayerView renders
- Responsibilities: Load experiment settings, initialize jsPsych, call `run()`, manage experiment completion state

## Error Handling

**Strategy:** Error boundary + toast notifications + console logging

**Patterns:**
- Error boundary (`src/modules/ErrorBoundary.tsx`) catches React rendering errors
- Network errors caught by Graasp query client and displayed as toast (NetworkErrorToast)
- Console.error for context loading failures in Root
- jsPsych errors logged but not explicitly handled (assumed valid timeline)

## Cross-Cutting Concerns

**Logging:** No explicit logging library; uses console.error for critical failures

**Validation:** Type-safe via TypeScript; settings validated through context initialization with defaults

**Authentication:** Handled by Graasp SDK (WithTokenContext); app receives memberId and permission level
