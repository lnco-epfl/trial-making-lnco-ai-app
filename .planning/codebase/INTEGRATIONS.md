# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Graasp Platform:**
- Graasp Backend REST API - Core platform integration for experiment management
  - SDK/Client: `@graasp/apps-query-client` v3.4.15 (query hooks and mutations)
  - Auth: `VITE_GRAASP_APP_KEY` environment variable (app identifier)
  - Connection: `VITE_API_HOST` (default: http://localhost:3000)
  - Protocol: REST/WebSocket via Axios and configured query client
  - Endpoints: `/app-items`, `/app-data`, `/app-settings`, `/app-actions` (proxied via Vite)

**Error Tracking & Monitoring:**
- Sentry - Error tracking, performance monitoring, and session replay
  - SDK: `@sentry/react` v7.118.0
  - DSN: `VITE_SENTRY_DSN` environment variable
  - Environment: `VITE_SENTRY_ENV` environment variable
  - Configuration: `src/config/sentry.ts` - sampling rates, replay settings
  - Tracing: 100% sample rate in development, 10% in production
  - Replay: 10% session sample rate, 100% on errors

**Analytics:**
- Google Analytics - Usage tracking (optional)
  - Measurement ID: `VITE_GA_MEASUREMENT_ID` environment variable
  - Status: Configured but integration not visible in codebase (likely planned)

## Data Storage

**Backend Database:**
- PostgreSQL (remote) - Primary data store via Graasp backend
  - Connection: Via Graasp API (no direct access from frontend)
  - Data types: Experiment results stored as AppData, app settings as AppSettings
  - AppData schema: `src/config/appData.ts` defines `ExperimentResultsAppData` type

**In-Memory State:**
- React Query (@tanstack/react-query) - Client-side server state caching
  - Stale time: 1000ms (defined in `src/config/queryClient.tsx`)
  - Cache invalidation: Automatic on mutations
  - Refetch behavior: On window focus (disabled in dev mode)

**Browser Storage:**
- No explicit localStorage/sessionStorage usage detected
- Mock API mode: Uses MirageJS or ServiceWorker for offline testing
  - MirageJS mode: For Cypress testing (uses `graasp-app-cypress` database)
  - ServiceWorker mode: For standalone development

**Client-Side Experiment Data:**
- jsPsych DataCollection - Trial-by-trial experiment data
  - Format: JavaScript object collection from `jspsych` library
  - Accessed via `src/modules/answers/ResultsView.tsx` for export

## File Export & Download

**Client-Side Data Export:**
- JSON export: `downloadJson()` function in `src/modules/answers/ResultsView.tsx`
  - Creates Blob from serialized trial data
  - Triggers browser download via anchor element
  - No server upload required

- CSV export: `downloadCsv()` function in `src/modules/answers/ResultsView.tsx`
  - Dynamic column extraction from trial objects
  - Proper CSV escaping for special characters
  - Comma, quote, and newline handling

## Authentication & Identity

**Auth Provider:**
- Custom (Graasp-provided)
  - Implementation: Token-based via `WithTokenContext` from `@graasp/apps-query-client`
  - Token retrieval: `hooks.useAuthToken()` - automatically handled by Graasp
  - Location: `src/modules/Root.tsx` - wraps entire application
  - Context: `WithLocalContext` also provides user/member information

**User Context:**
- Graasp SDK provides: `Context.Builder`, `Context.Player`, `Context.Analytics` modes
- Member info: Retrieved from local context via `useLocalContext()` hook
- Permission levels: Admin, Editor, Viewer (defined in @graasp/sdk)

## Hardware & Device Integration

**Serial Port Communication:**
- Web Serial API (browser native) - Low-level serial port access
  - Implementation: `src/modules/experiment/triggers/serialport.ts`
  - Functions: `connectToSerial()`, `sendTrigger(device, trigger)`
  - Baud rate: 9600 (configurable)
  - Use case: Send trigger signals to external hardware devices
  - Browser support: Chrome/Edge (not Safari/Firefox)

**USB Device Communication:**
- Web USB API (browser native) - USB device access
  - Type definitions included: `@types/w3c-web-usb` v1.0.10
  - Implementation skeleton in `src/modules/experiment/triggers/serialport.ts`
  - Status: Type definitions present, implementation partially stubbed

**Serial Port Package:**
- serialport v12.0.0 - Node.js serial port library
  - Status: Installed but primarily for web-based API, not Node backend
  - Use: Fallback for environments where Web Serial API unavailable

## Real-Time Communication

**WebSocket:**
- Provided by Graasp backend (via `@graasp/apps-query-client`)
- Auto-managed connection for real-time features
- Configured in `src/config/queryClient.tsx`

## Webhooks & Callbacks

**Incoming:**
- No webhook receivers detected in frontend application

**Outgoing:**
- App Actions: Sent via `mutations.usePostAppAction()` for event logging
  - Location: `src/modules/experiment/experiment.ts` - logs experiment events
  - Used by Graasp for analytics and audit trails

## Testing & Development APIs

**Mocked API Services:**
- MirageJS - API mocking for Cypress tests
  - Config: `msw.workerDirectory: "public"` in package.json
  - Initialization: `src/main.tsx` - `MOCK_API` flag enables mock mode

- Service Worker (MSW - Mock Service Worker) - API mocking for development
  - Worker directory: `public/` (via `msw.workerDirectory` setting)
  - Status: Service Worker APIs installed, intercepting requests in mock mode

- nock v13.5.3 - HTTP request mocking library installed
  - Status: Available but not actively configured in visible files

## Configuration & Secrets

**Environment Configuration:**
- File-based: `.env.development`, `.env.test` (never committed)
- Loaded via `env-cmd` package in test script
- Variables prefix: `VITE_` (Vite convention for frontend exposure)

**Secrets Location:**
- Environment variables only (no hardcoded secrets in codebase)
- Sentry DSN (semi-public, service-specific)
- Graasp App Key (unique per deployment)

**Connection Proxy:**
- Vite dev server proxy: `/app-items` → `http://localhost:3000`
  - Defined in `vite.config.ts` - avoids CORS issues in development
  - Rewrite preserves path structure

## Monitoring & Observability

**Performance:**
- Sentry Performance Monitoring - Transaction tracing
  - Configuration: `src/config/sentry.ts`
  - BrowserTracing integration enabled
  - Traces sample rate: 100% dev, 10% production

**Session Replay:**
- Sentry Session Replay - User interaction recording
  - Session sample rate: 10% (development & production)
  - Error sample rate: 100% (always record on error)
  - Replay duration captured for session and error events

**Error Reporting:**
- Sentry Error Reporting - Uncaught exception tracking
  - Auto-captured by Sentry.init() in `src/main.tsx`
  - ErrorBoundary component in `src/modules/ErrorBoundary.tsx` - React error capture

**Logging:**
- Console-based - Development logging via `console.error()`, `console.log()`
- ESLint rule: Only allow `console.error`, `console.warn`, `console.debug`, `console.info` in production

## Internationalization

**i18n Service:**
- i18next - Localization framework
  - Config: `src/config/i18n.ts`
  - Integration: `react-i18next` v14.1.3
  - Supported languages: English (en), French (fr) based on directory structure
  - Location: `src/locales/` (locale files)

---

*Integration audit: 2026-03-25*
