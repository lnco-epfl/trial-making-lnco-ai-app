# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript 5.4.5 - Full application codebase; strict mode enabled
- JavaScript (ES2021+) - Configuration files, build scripts

**Secondary:**
- JSX/TSX - React component definitions throughout application

## Runtime

**Environment:**
- Node.js ≥ 20 (defined in package.json type: module for ES modules)

**Package Manager:**
- Yarn 4.2.2 - Primary dependency management
- Lockfile: Present (yarn.lock)

## Frameworks

**Core:**
- React 18.3.1 - UI framework and state management
- React DOM 18.3.1 - DOM rendering
- React Query (@tanstack/react-query) 4.36.1 - Server state management

**Testing:**
- Cypress 13.13.2 - E2E testing framework with code coverage support
- Jest 29.7.0 - Unit testing runner
- Vitest - Not explicitly configured but referenced in tsconfig types

**Build/Dev:**
- Vite 5.1.3 - Frontend build tool and dev server
- @vitejs/plugin-react 4.2.1 - React Fast Refresh plugin
- Vite Plugin Checker 0.7.0 - Type checking and linting during dev
- Vite Plugin Istanbul 6.0.0 - Coverage instrumentation

**Specialized Frameworks:**
- jsPsych 8.0.1 - Behavioral neuroscience experiments; core to this application
- Multiple jsPsych plugins:
  - @jspsych/plugin-html-keyboard-response 2.1.0 - Keyboard-based trial responses
  - @jspsych/plugin-html-button-response 2.0.0 - Button-based trial responses
  - @jspsych/plugin-fullscreen 1.1.2 - Fullscreen mode management
  - @jspsych/plugin-preload 1.1.2 - Asset preloading
  - @jspsych/plugin-survey-likert 1.1.3 - Likert scale surveys
  - @jspsych/plugin-survey-text 2.0.0 - Text input surveys
  - @jspsych/plugin-video-button-response 2.0.0 - Video playback with buttons
  - @jspsych/plugin-video-keyboard-response 2.0.0 - Video playback with keyboard
  - @jspsych/plugin-call-function 1.1.3 - Execute custom functions
  - @jspsych/test-utils 1.2.0 - jsPsych testing utilities

## Key Dependencies

**Critical:**
- @graasp/apps-query-client 3.4.15 - Graasp platform API integration; query hooks and mutations
- @graasp/sdk 4.9.0 - Graasp type definitions and enums
- @graasp/ui 4.17.1 - Graasp shared React component library
- @sentry/react 7.118.0 - Error tracking and performance monitoring
- Axios 1.7.3 - HTTP client for API requests

**UI Components:**
- @mui/material 6.1.2 - Material Design component library
- @mui/icons-material 5.15.21 - Material Design icons
- @mui/lab 6.0.0-beta.10 - Lab components (experimental)
- @emotion/react 11.11.4 - CSS-in-JS styling engine
- @emotion/styled 11.11.5 - Styled component utilities

**Hardware/Serial Communication:**
- serialport 12.0.0 - Serial port communication for device triggers
- Web Serial API - Browser native API for serial port access (navigator.serial)
- Web USB API - Browser native API for USB device access (navigator.usb)

**Data Processing & Utilities:**
- jspsych 8.0.1 - DataCollection class for trial data handling
- file-saver 2.0.5 - Client-side file download capability (used for CSV/JSON export)
- lodash 4.17.21 - Utility functions (_.includes, _.uniq, etc.)
- date-fns 4.1.0 - Date manipulation and formatting
- fast-cartesian 9.0.0 - Cartesian product generation
- crypto-js 4.2.0 - Cryptographic utilities

**i18n & Localization:**
- i18next 23.9.0 - Internationalization framework
- react-i18next 14.1.3 - React i18n bindings

**Notifications:**
- react-toastify 10.0.5 - Toast notification library

**Code Editing:**
- @mdxeditor/editor 3.24.0 - MDX content editor component
- simple-keyboard 3.7.93 - On-screen keyboard component

**Markdown:**
- @ts-stack/markdown 1.5.0 - Markdown parsing and rendering

## Dev Dependencies

**Linting & Formatting:**
- ESLint 8.57.0 - JavaScript/TypeScript linting
- @typescript-eslint/eslint-plugin 7.18.0 - TypeScript ESLint support
- @typescript-eslint/parser 7.18.0 - TypeScript parser for ESLint
- Prettier 3.3.3 - Code formatter
- @trivago/prettier-plugin-sort-imports 4.3.0 - Import sorting
- eslint-config-airbnb 19.0.4 - Airbnb style guide
- eslint-config-airbnb-typescript 18.0.0 - Airbnb TypeScript config
- eslint-plugin-cypress 2.15.2 - Cypress-specific ESLint rules
- eslint-plugin-react 7.33.2 - React ESLint rules
- eslint-plugin-react-hooks 4.6.2 - React hooks ESLint rules
- eslint-plugin-import 2.29.1 - Import/export ESLint rules
- eslint-plugin-jsx-a11y 6.9.0 - Accessibility ESLint rules

**Testing & Coverage:**
- @cypress/code-coverage 3.12.44 - Code coverage instrumentation for Cypress
- nyc 15.1.0 - Coverage reporting tool
- nock 13.5.3 - HTTP mocking for tests
- miragejs 0.1.48 - API mocking library

**Type Checking:**
- @types/react 18.3.3 - React type definitions
- @types/react-dom 18.3.0 - React DOM type definitions
- @types/node 20.12.14 - Node.js type definitions
- @types/lodash 4.17.9 - Lodash type definitions
- @types/uuid 9.0.8 - UUID type definitions
- @types/w3c-web-serial 1.0.6 - Web Serial API type definitions
- @types/w3c-web-usb 1.0.10 - Web USB API type definitions
- @types/i18n 0.13.12 - i18n type definitions

**Build & Dev Tools:**
- TypeScript 5.4.5 - TypeScript compiler
- Husky 9.1.4 - Git hooks management
- @commitlint/cli 19.3.0 - Commit message linting
- @commitlint/config-conventional 19.2.2 - Conventional commits config
- concurrently 8.2.2 - Run multiple commands in parallel
- env-cmd 10.1.0 - Environment variable loading from .env files
- uuid 9.0.1 - UUID generation
- sass 1.77.8 - SCSS compilation
- alias-hq 6.2.3 - Path alias resolution helper

## Configuration

**Environment:**
- Environment-based config loading via Vite's `loadEnv(mode, cwd)`
- `.env.development` - Development environment configuration
- `.env.test` - Test mode configuration
- Mode support: 'development' (default), 'test', 'production'

**Key Environment Variables:**
- `VITE_GRAASP_APP_KEY` - Graasp application identifier (required)
- `VITE_API_HOST` - Backend API host URL (default: http://localhost:3000)
- `VITE_ENABLE_MOCK_API` - Enable mock API mode for testing
- `VITE_SENTRY_DSN` - Sentry error tracking DSN
- `VITE_SENTRY_ENV` - Sentry environment label
- `VITE_GA_MEASUREMENT_ID` - Google Analytics measurement ID
- `VITE_PORT` - Dev server port (default: 4001)
- `VITE_VERSION` - Application version
- `VITE_DEBUG` - Enable debug mode notifications

**Build:**
- `vite.config.ts` - Vite build configuration with React plugin
- `tsconfig.json` - TypeScript compiler configuration with strict mode
- `tsconfig.node.json` - TypeScript config for build files
- `.eslintrc` - ESLint rule configuration
- `.prettierrc` - Prettier formatting rules
- `cypress.config.ts` - Cypress E2E testing configuration
- `cypress/tsconfig.json` - Cypress-specific TypeScript config

## Platform Requirements

**Development:**
- Node.js ≥ 20 (for ES modules)
- Windows / macOS / Linux (Vite is cross-platform)
- Serial port hardware (optional) - for device trigger integration
- USB device support (optional) - for USB trigger integration
- Modern browser with Web Serial API and Web USB API support (Chrome/Edge recommended)

**Production:**
- Browser compatibility: ES2021+ (as per tsconfig target)
- Requires connection to Graasp backend (default: http://localhost:3000)
- Optional: Sentry account for error tracking
- Optional: Google Analytics account for usage tracking

**Browser Features Required:**
- ES2021 or higher JavaScript support
- DOM Level 4 APIs
- Fetch API / XMLHttpRequest
- WebSocket support (for Graasp real-time features)
- IndexedDB or localStorage (if using mocked API)

---

*Stack analysis: 2026-03-25*
