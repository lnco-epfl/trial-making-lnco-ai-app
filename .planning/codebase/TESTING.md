# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework

**Runner:**
- Cypress 13.13.2 for E2E testing
- Config: `cypress.config.ts` (no unit test framework currently in use)

**Assertion Library:**
- Cypress native assertions (built-in)

**Run Commands:**
```bash
yarn cypress:open              # Interactive test mode
yarn test                      # Start dev server and run headless tests
yarn test:ci                   # Run tests in headless mode with coverage
yarn cov:report               # Open coverage HTML report
```

## Test File Organization

**Location:**
- E2E tests: `cypress/e2e/` directory
- Test utilities: `cypress/support/` directory
- Test fixtures: `cypress/fixtures/` directory
- All app source code in `src/` (no co-located test files)

**Naming:**
- E2E test files: `.cy.ts` extension (e.g., `main.cy.ts`)
- View-based organization: `cypress/e2e/player/main.cy.ts`, `cypress/e2e/builder/main.cy.ts`, `cypress/e2e/analytics/main.cy.ts`

**Structure:**
```
cypress/
├── e2e/
│   ├── player/
│   │   └── main.cy.ts
│   ├── builder/
│   │   └── main.cy.ts
│   └── analytics/
│       └── main.cy.ts
├── fixtures/
│   ├── members.ts
│   └── mockItem.ts
├── support/
│   ├── commands.ts
│   ├── component.ts
│   └── e2e.ts
└── tsconfig.json
```

## Test Structure

**Suite Organization:**

E2E tests use Cypress standard structure with `describe()` and `it()`:

```typescript
describe('Player View', () => {
  beforeEach(() => {
    cy.setUpApi(
      {},
      {
        context: Context.Player,
        permission: PermissionLevel.Write,
      },
    );
    cy.visit('/');
  });

  it('App', () => {
    cy.get(buildDataCy(PLAYER_VIEW_CY)).should(
      'contain.text',
      'Player as write',
    );
  });
});
```

**Patterns:**
- Setup phase in `beforeEach()`: API mocking and navigation
- Assertion pattern: `cy.get().should()` chain
- Test data setup through custom `cy.setUpApi()` command
- One test per logical feature (not heavily split)

## Mocking

**Framework:**
- Cypress built-in mocking via custom commands
- No Jest or Vitest (no unit tests)
- Service Worker mocking not visible in test structure (handled at app level in `main.tsx`)

**Patterns:**

Custom Cypress command in `cypress/support/commands.ts`:

```typescript
Cypress.Commands.add('setUpApi', (database, appContext) => {
  Cypress.on('window:before:load', (win: Window) => {
    win.indexedDB.deleteDatabase('graasp-app-cypress');
    win.appContext = {
      memberId: CURRENT_MEMBER.id,
      itemId: MOCK_SERVER_ITEM.id,
      apiHost: Cypress.env('VITE_API_HOST'),
      ...appContext,
    };
    win.database = {
      appData: [],
      appActions: [],
      appSettings: [],
      members: Object.values(MEMBERS),
      items: [MOCK_SERVER_ITEM],
      ...database,
    };
  });
});
```

**Fixtures:** Test data defined in separate files:
- `cypress/fixtures/members.ts`: `CURRENT_MEMBER`, `MEMBERS`
- `cypress/fixtures/mockItem.ts`: `MOCK_SERVER_ITEM`

**What to Mock:**
- API context (permission level, context type, member ID)
- Database state (app data, settings, users, items)
- Environment variables via Cypress env config

**What NOT to Mock:**
- Browser APIs (Cypress intercepts these naturally)
- Page navigation or DOM manipulation

## Fixtures and Factories

**Test Data:**

Members fixture in `cypress/fixtures/members.ts`:
```typescript
export const CURRENT_MEMBER = {...};
export const MEMBERS = {
  member1: {...},
  // ...
};
```

Mock item fixture in `cypress/fixtures/mockItem.ts`:
```typescript
export const MOCK_SERVER_ITEM = {...};
```

**Location:**
- `cypress/fixtures/` for shared test data
- Fixtures imported in `cypress/support/commands.ts`
- Directly injected into window object before tests run

## Coverage

**Requirements:**
- Coverage tracking enabled via `@cypress/code-coverage` (v3.12.44)
- Vite configured with istanbul plugin for instrumentation
- Coverage report generated on test runs

**View Coverage:**
```bash
yarn cov:report                # Opens lcov-report/index.html
```

**Coverage Config in `package.json`:**
```json
"nyc": {
  "all": true,
  "include": ["src/**/*.{js,ts,jsx,tsx}"],
  "exclude": ["src/**/*.d.ts"]
}
```

## Test Types

**E2E Tests (Only type currently):**
- Scope: Full application flow from user perspective
- Approach: Cypress browser automation
- Example: `cypress/e2e/player/main.cy.ts` tests Player context rendering
- Example: `cypress/e2e/builder/main.cy.ts` tests Builder context with Read permission
- Config: `baseUrl` points to dev server (default port 4001)

**Unit Tests:**
- Not currently implemented
- No Jest, Vitest, or unit test framework in use
- Type checking via TypeScript (`yarn type-check`)

**Integration Tests:**
- Not separated from E2E tests
- E2E tests functionally serve as integration tests (App → API → Database)

## Common Patterns

**Async Testing:**

Cypress handles async operations implicitly through command chaining:
```typescript
cy.setUpApi({}, {...});  // Async setup
cy.visit('/');           // Wait for page load
cy.get(selector).should(...);  // Wait for element
```

**Error Testing:**

Not explicitly tested in current suite. Error boundary exists in app but no dedicated error scenario tests.

**Selectors:**

Test selectors use `data-cy` attributes, generated via helper:
```typescript
export const buildDataCy = (selector: string): string =>
  `[data-cy=${selector}]`;

// Usage:
cy.get(buildDataCy(PLAYER_VIEW_CY)).should(...)
```

**Retry Logic:**

Configured in `cypress.config.ts`:
```typescript
retries: { runMode: 1, openMode: 0 }
```

## Environment Configuration

**Test Environment Variables:**
- Defined in `.env.test` file (loaded via `env-cmd`)
- Key vars: `VITE_API_HOST`, `VITE_ENABLE_MOCK_API`, `VITE_GRAASP_APP_KEY`
- Passed to Cypress config via `setupNodeEvents()`

**Commands:**
```bash
yarn test               # Uses VITE_PORT and .env.test
yarn cypress:open      # Uses env-cmd -f ./.env.test cypress open
```

## Testing Best Practices Observed

1. **Clear Test Names**: Descriptive `describe()` blocks and `it()` statements
2. **Setup/Teardown**: `beforeEach()` for common setup (API mocking, navigation)
3. **No Hard Waits**: Cypress implicit waits with assertions
4. **Test Isolation**: Each test sets up its own API context
5. **Fixture-Based Data**: Shared test data in separate fixture files
6. **Coverage Monitoring**: Istanbul integration captures code coverage
7. **Environment Separation**: Test mode has its own env config

## Code Coverage

**Current Status:**
- Coverage instrumentation: Vite with vite-plugin-istanbul
- Report format: lcov (text and HTML)
- Generated: Via `@cypress/code-coverage` task on test runs
- Output: `coverage/` directory (excluded from watch)

**Check Coverage:**
```bash
yarn cov:report        # View HTML coverage report
```

---

*Testing analysis: 2026-03-25*
