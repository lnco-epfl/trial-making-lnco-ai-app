# Coding Conventions

**Analysis Date:** 2026-03-25

## Naming Patterns

**Files:**
- React components: `.tsx` extension, PascalCase (e.g., `PlayerView.tsx`, `ExperimentContext.tsx`, `ResultsView.tsx`)
- Utility/non-component files: `.ts` extension, camelCase (e.g., `experiment.ts`, `utils.ts`, `hooks.ts`)
- Config files: descriptive names in camelCase (e.g., `appSettings.ts`, `selectors.ts`, `queryClient.tsx`)
- Test files: `.cy.ts` for Cypress E2E tests (e.g., `main.cy.ts`)

**Functions:**
- All functions use camelCase names
- Export prefix pattern: `export const buildTask1`, `export const buildPractice1`, `buildIntroduction`
- Utility functions: descriptive verbs, e.g., `resolveLink()`, `downloadJson()`, `trialsToCsv()`, `useObjectState()`
- React hooks start with `use`: `useExperimentResults()`, `useObjectState()`, `useLocalContext()`
- Custom hooks are exported directly: `export default useExperimentResults`

**Variables:**
- Local variables: camelCase (e.g., `experimentResultsAppData`, `allExperimentResultsAppData`, `experimentResults`)
- Constants: UPPER_SNAKE_CASE (e.g., `PLAYER_VIEW_CY`, `BUILDER_VIEW_CY`, `ALL_SETTING_NAMES`)
- Private state references: descriptive, e.g., `cachePayload.current`, `hasPosted.current`

**Types:**
- Type names: PascalCase and suffixed with `Type` (e.g., `ExperimentContextType`, `GeneralSettingsType`, `AllSettingsType`, `SettingsContextType`)
- Interface names: PascalCase suffixed with optional `Type` (e.g., `TrailMakingTrial`, `ClickData`, `TrailMakingResult`)
- Union types: descriptive literal unions (e.g., `'practice1' | 'task1' | 'practice2' | 'task2'`)

## Code Style

**Formatting:**
- Tool: Prettier 3.3.3
- Tab width: 2 spaces
- Trailing comma: always (trailingComma: "all")
- Semicolons: enabled (semi: true)
- Single quotes: enabled (singleQuote: true)
- Line length: not explicitly restricted but standard ~80-100 chars observed

**Linting:**
- Tool: ESLint 8.57.0 with TypeScript support
- Config chain: airbnb → airbnb-typescript → prettier
- Parser: @typescript-eslint/parser
- Key rules enforced:
  - `react/function-component-definition`: arrow functions required for named components
  - `react/jsx-filename-extension`: `.tsx` required for JSX files
  - `@typescript-eslint/explicit-function-return-type`: enabled with exceptions for expressions and higher-order functions
  - `no-console`: error, except for `console.error`, `console.warn`, `console.debug`, `console.info`
  - `@typescript-eslint/no-unused-vars`: warn for unused variables with ignore patterns (`^_`)
  - `@typescript-eslint/no-shadow`: error (stricter than base eslint)
  - `react-hooks/exhaustive-deps`: warn
  - `react/prop-types`: off (using TypeScript)

## Import Organization

**Order:**
1. React imports: `import React from 'react'`
2. MUI imports: `import { ... } from '@mui/material'` (or `@?mui`)
3. Graasp imports: `import { ... } from '@graasp/...'`
4. Third-party modules: everything else not in other groups
5. Path aliases: `import { ... } from '@/...'` (maps to `src/`)
6. Relative imports: `import { ... } from './...'` or `import { ... } from '../...'`

**Path Aliases:**
- `@/` → `src/` (configured in `tsconfig.json`)
- Used throughout for cleaner imports (e.g., `@/config/selectors`, `@/modules/context/SettingsContext`)

**Import Statement Style:**
- Named imports preferred
- Order imports alphabetically within braces when multiple
- No wildcard imports (`*`) except in special cases

## Error Handling

**Patterns:**
- Sentry integration for runtime error tracking: `import * as Sentry from '@sentry/react'`
- Error boundary wrapper: `<Sentry.ErrorBoundary>` with custom fallback UI
- Console logging for non-production errors (allowed: `console.error()`, `console.warn()`)
- Context-based error states: status field tracking 'loading' | 'error' | 'success'
- Callback-based error handling in event listeners (e.g., serial port connection errors)

**Example pattern in `ExperimentContext.tsx`:**
```typescript
const { status } = hooks.useAppData<ExperimentResult>({
  type: AppDataType.ExperimentResults,
});
// Later used as: status: 'loading' | 'error' | 'success'
```

## Logging

**Framework:** console (native)

**Patterns:**
- Allowed console methods: `console.error()`, `console.warn()`, `console.debug()`, `console.info()`
- Usage locations: `src/modules/experiment/triggers/serialport.ts` for debug logging
- Conditional console.log in development contexts (wrapped with feature flags when needed)
- Error messages include context: e.g., `console.error('Serial Port Connection Error:', error)`

## Comments

**When to Comment:**
- JSDoc/TSDoc for exported functions and types
- Inline comments for non-obvious logic or workarounds
- Section dividers for major logical blocks

**JSDoc/TSDoc:**
- Used on exported functions and modules
- Example from `experiment.ts`:
```typescript
/**
 * End page with optional link to next experiment
 */
const getEndPage = ({...}: NextStepSettings): Trial => ({...});

/**
 * @function run
 * @description Main function to run the Trail Making Task experiment
 * @param {Object} config - Configuration object for the experiment
 */
export async function run({...}): Promise<JsPsych> {...}
```

## Function Design

**Size:** Functions generally kept concise (10-50 lines typical, longer for complex logic like `experiment.ts`)

**Parameters:**
- Prefer object parameters over many positional arguments
- Destructure in function signature when possible
- Always type parameters explicitly (TypeScript strict mode)

**Return Values:**
- Explicit return type annotations required (enforced by ESLint rule)
- Void functions explicitly typed as `: void`
- Async functions return Promise<Type>
- React components return `JSX.Element` or `ReactElement`

**Example pattern:**
```typescript
export const resolveLink = (link: string, participantName: string): string =>
  link.replace(/\{participantName\}/g, participantName);

const useObjectState = <T extends object>(
  initialValue: T,
): [T, (arg: UpdateArgument<T>) => void] => {...}

const downloadJson: (json: string, filename: string) => void = (
  json: string,
  filename: string,
): void => {...}
```

## Module Design

**Exports:**
- Named exports: `export const`, `export type`, `export interface` preferred
- Default exports: used for React components (e.g., `export default App`, `export default PlayerView`)
- Custom hooks exported as default: `export default useExperimentResults`

**Barrel Files:**
- Not heavily used; direct imports preferred
- Some config aggregation (e.g., `config/queryClient.tsx` exports hooks and mutations)

**Context Pattern:**
- Context definition with `createContext(defaultValue)`
- Provider component with `Provider.Provider` wrapper
- Custom hook for useContext with proper typing
- Follows React best practices: `src/modules/context/ExperimentContext.tsx`, `src/modules/context/SettingsContext.tsx`

## Component Architecture

**Functional Components:** All components are arrow function components
```typescript
const PlayerView = (): JSX.Element => (
  <div>...</div>
);
export default PlayerView;
```

**Provider Pattern:** Context providers wrap children
```typescript
export const ExperimentResultsProvider: FC<{
  children: ReactElement | ReactElement[];
}> = ({ children }) => {
  // ... logic
  return (
    <ExperimentResultsContext.Provider value={contextValue}>
      {children}
    </ExperimentResultsContext.Provider>
  );
};
```

**Props Typing:** Props passed via destructuring with type definitions
```typescript
type Props = {
  children: ReactElement | ReactElement[];
};

const Component: FC<Props> = ({ children }) => {...}
```

---

*Convention analysis: 2026-03-25*
