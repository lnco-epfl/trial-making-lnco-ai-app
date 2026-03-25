# Codebase Concerns

**Analysis Date:** 2026-03-25

## Tech Debt

**Large File Complexity:**
- Issue: Main trial file exceeds 700 lines with mixed concerns (UI rendering, state management, event handling)
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts` (715 lines)
- Impact: Difficult to test, maintain, and extend; hard to isolate bugs
- Fix approach: Extract UI rendering logic into separate functions; separate event handlers into utility modules; consider decomposing into smaller, single-responsibility classes

**Type Safety Evasion:**
- Issue: Multiple `@ts-ignore`, `any`, and `unknown` type assertions bypass TypeScript's type checking
- Files:
  - `src/modules/experiment/triggers/serialport.ts` (lines 16-19, 29) - SerialPort and USBDevice typed as `any`
  - `src/modules/experiment/utils/types.ts` (lines 1-6) - Timeline typed as `any[]`, Trial has `unknown` fields
  - `src/modules/experiment/trials/break-trial.ts` (lines 39, 44) - Window cast as `unknown`
  - `src/config/appResults.ts` (lines 10-11) - Dynamic key indexing with `any`
  - `src/modules/settings/TrailMakingSettingsView.tsx` (line 27) - Handler parameter typed as `unknown`
- Impact: Loss of compile-time safety; harder to catch API changes; hidden bugs in device communication
- Fix approach: Create proper TypeScript interfaces for SerialPort API; use discriminated unions instead of `unknown` in Trial type; create strict types for external APIs with type guards

**Hardcoded HTML String Manipulation:**
- Issue: Direct use of `innerHTML` with hardcoded HTML creates maintenance burden and potential injection vectors
- Files:
  - `src/modules/experiment/experiment.ts` (lines 140-147) - Font size dropdown HTML
  - `src/modules/experiment/trials/trail-making-stimulus-trial.ts` (lines 412, 656) - Feedback panel and instruction HTML
  - `src/modules/experiment/triggers/serialport.ts` (lines 116, 120) - DOM updates with innerHTML
- Impact: Changes to UI require code modifications; potential XSS if user data enters strings; not easily testable
- Fix approach: Use template literals with escaping; consider migrating to DOM manipulation or moving HTML to separate template files

**Unstructured Color and Style Constants:**
- Issue: Color values and styles hardcoded throughout trial rendering
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts` (various - #228B22, #FFD700, #DC143C, etc.)
- Impact: Inconsistent styling; difficult to maintain theme; no single source of truth for appearance
- Fix approach: Extract all colors and styles to `src/modules/experiment/utils/styles.ts` or theme configuration

## Known Bugs

**Serial Port Connection Error Handling:**
- Symptoms: Connections may fail silently; user sees "Connection Failed" but doesn't know why
- Files: `src/modules/experiment/triggers/serialport.ts` (lines 37-40, 66-68)
- Trigger: When navigator.serial is unavailable, device is disconnected mid-experiment, or port is already open
- Workaround: Allow user to retry connection; connection is optional, not required
- Root cause: Generic catch blocks that log to console without providing user feedback

**Missing Cleanup on Trial End:**
- Symptoms: Event listeners remain attached if trial ends prematurely; potential memory leak
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts` (line 595 - container.addEventListener)
- Trigger: User navigates away or closes browser during active trial
- Workaround: None - application continues to hold references
- Root cause: Event listeners added but never removed in `on_finish` or error paths

**Incomplete Undo Logic:**
- Symptoms: Undo may leave state inconsistent with visual representation
- Files: `src/modules/experiment/jspsych/experiment-state-class.ts` (lines 271-286)
- Trigger: Multiple rapid undo clicks; undoing when only one click exists
- Workaround: UI prevents certain undo scenarios but doesn't validate state
- Root cause: No transaction semantics - visual undo (line removal) is separate from state undo

## Security Considerations

**Serial Device Communication Not Validated:**
- Risk: No validation of received data from serial device; malformed messages could cause unexpected behavior
- Files: `src/modules/experiment/triggers/serialport.ts`
- Current mitigation: Hardcoded byte values (0-255) sent only by application
- Recommendations: Add input validation if future versions accept device responses; sanitize any device-sourced data

**Unvalidated HTML Injection Points:**
- Risk: Instruction text and feedback strings built without sanitization
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts` (lines 184-196, 412)
- Current mitigation: Text comes from hardcoded strings and i18n, not user input
- Recommendations: Use text content setters instead of innerHTML for all user-facing strings; escape any dynamic content

**Settings Not Persisted Securely:**
- Risk: App settings stored in app data without encryption; custom layouts could be tampered with
- Files: `src/modules/context/SettingsContext.tsx` (lines 155-168)
- Current mitigation: Relies on Graasp platform authentication and authorization
- Recommendations: Validate layout data structure on load; implement integrity checks on settings

**No CSRF Protection on Settings Mutations:**
- Risk: If app URL leaked, malicious site could trigger settings changes
- Files: `src/config/queryClient.tsx` (lines 143-168)
- Current mitigation: Graasp platform handles authentication; mutations require valid session
- Recommendations: Ensure all mutations require explicit user action; add nonce validation if expanding API

## Performance Bottlenecks

**Inefficient Layout Recalculation:**
- Problem: Circle colors recomputed for all circles on every click (O(n) per click)
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts` (lines 251-257)
- Cause: Full `circleElements.forEach()` instead of updating only changed elements
- Improvement path: Maintain last color state; only update circles that actually changed color

**Unbounded Frame Click Recording:**
- Problem: `frameClicks` array grows for entire trial without limit
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts` (lines 168, 566-578)
- Cause: Every mouse click recorded regardless of trial state
- Improvement path: Only record clicks during active task; implement max size with oldest-first eviction

**No Memoization of Layout Lookups:**
- Problem: Layout circle lookup uses `.find()` on every line draw (O(n) per click sequence)
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts` (line 265)
- Cause: Layout circles stored as array, not indexed map
- Improvement path: Convert layout.circles to Map<label, CirclePosition> for O(1) lookups

**Repeated DOM Queries:**
- Problem: `document.getElementById()` and `document.getElementsByClassName()` called repeatedly in loops
- Files: `src/modules/experiment/triggers/serialport.ts` (lines 116, 118-119, 189-192)
- Cause: Event handler references elements multiple times instead of caching
- Improvement path: Cache DOM references at handler initialization time

**Unused Moment.js-Like Dependencies:**
- Problem: `@ts-stack/markdown` imported but only `Marked.parse()` used; could be lighter library
- Files: `src/modules/experiment/experiment.ts` (line 11)
- Cause: Not evaluated for alternatives; adds to bundle size
- Improvement path: Consider `micromark` or native alternatives for minimal markdown parsing

## Fragile Areas

**ExperimentState Class:**
- Files: `src/modules/experiment/jspsych/experiment-state-class.ts`
- Why fragile: Mutable state object passed across many functions; no immutability guarantees; side effects in methods (`completeStage()` modifies state then returns)
- Safe modification: Always create new state objects when making changes; separate query methods from mutation methods; add invariant checks before modifications
- Test coverage: No unit tests found; only integration tested through jsPsych trials
- Risks: State transitions could be bypassed; parallel modifications could corrupt data

**Trail Making Stimulus Plugin:**
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts`
- Why fragile: Many nested closures capture mutable state; complex event handling with multiple flags (`interactionLocked`, `trialEnded`, `pendingUndoLabel`); rendering state scattered across variables
- Safe modification: Extract UI state into single state object; use state machines for trial lifecycle; add guards for state transitions
- Test coverage: Appears to have no unit tests; only E2E tested through UI
- Risks: Race conditions between click handler and feedback panel; state inconsistency if trial ends during click handling

**Settings Context:**
- Files: `src/modules/context/SettingsContext.tsx`
- Why fragile: Type cast in line 183 (`as unknown as AllSettingsType[typeof key]`) bypasses type safety; layout can be null at multiple points; mutation function creates new mutations but doesn't wait for completion
- Safe modification: Use proper type guards; handle null layouts explicitly; await mutation completion before returning
- Test coverage: No unit tests
- Risks: Settings loaded but null layouts crash layout-dependent code; race conditions if settings changed during trial

**Break Trial Countdown:**
- Files: `src/modules/experiment/trials/break-trial.ts`
- Why fragile: Sets interval without storing reference for cleanup; window object cast to `unknown`; countdown UI not validated before DOM manipulation
- Safe modification: Store interval ID for cleanup; create proper window interface; validate DOM elements exist before updating
- Test coverage: Not tested
- Risks: Memory leak from interval never cleared; missing DOM element crashes countdown

## Scaling Limits

**Layout Definitions Hardcoded:**
- Current capacity: 4 fixed stages (practice1, task1, practice2, task2) with hardcoded coordinates
- Limit: Adding new stages requires code changes; 25-circle limit for task1 is hardcoded in sequence generation
- Scaling path: Move layout definitions to configuration files or CMS; dynamically generate sequences; support arbitrary circle counts

**No Pagination for Results Export:**
- Current capacity: All experiment results loaded into memory for CSV/JSON export
- Limit: Large datasets (1000+ participants) could exceed browser memory; export becomes slow
- Scaling path: Implement streaming export; add pagination to results view; defer heavy CSV processing to backend

**Single Page Application Memory:**
- Current capacity: All historical experiment data cached in React Query
- Limit: Continuous use (many experiments) leads to unbounded memory growth
- Scaling path: Implement result pagination with lazy loading; add cache size limits; periodically clear old data

## Dependencies at Risk

**Outdated jsPsych Plugins:**
- Risk: Some plugins on v1.x while others on v2.x; inconsistent API across plugin ecosystem
- Files: `package.json` (lines 18-26) - mix of `^1.1.x` and `^2.0.x` versions
- Impact: Plugin behavior varies; documentation scattered; updates risky due to API incompatibility
- Migration plan: Audit all plugins; upgrade to consistent major version; test trial logic thoroughly

**@graasp/apps-query-client Version Lag:**
- Risk: Using v3.4.15; newer versions may have breaking API changes or security fixes
- Files: `package.json` (line 15)
- Impact: Potential compatibility issues; may be missing bug fixes
- Migration plan: Check CHANGELOG for breaking changes; plan incremental upgrades; test integration endpoints

**React 18.3.1 with MUI 6 Beta:**
- Risk: MUI Lab at 6.0.0-beta.10; beta status means breaking changes possible
- Files: `package.json` (lines 31, 30)
- Impact: Future MUI 6 release could require code changes; limited production usage history
- Migration plan: Monitor MUI 6 release schedule; test with release candidates; have fallback UI library

## Missing Critical Features

**No Experiment State Persistence:**
- Problem: If browser crashes mid-experiment, all progress lost; no way to resume
- Blocks: Long experiments; experiments on unstable connections
- Impact: Poor user experience; data loss; invalid results if people restart
- Fix approach: Save state to localStorage periodically; implement resume flow on page reload

**No Validation of Circle Positions:**
- Problem: Circle positions stored as percentages but no check for overlaps or off-screen placement
- Blocks: Ability to load invalid custom layouts; circle collision detection
- Impact: Unclickable circles; confusing UI; no feedback to admin about bad configurations
- Fix approach: Add layout validator; check bounds on load; render validation warnings

**Missing Accessibility Features:**
- Problem: No ARIA labels; keyboard navigation limited; color contrast not validated
- Blocks: Usage by people with visual or motor disabilities
- Impact: Exclusion from research; potential legal compliance issues
- Fix approach: Add ARIA labels to circles; support arrow key navigation; add high contrast mode

## Test Coverage Gaps

**No Unit Tests for ExperimentState:**
- What's not tested: recordClick() state transitions; error calculation logic; undo mechanics
- Files: `src/modules/experiment/jspsych/experiment-state-class.ts`
- Risk: State corruption could occur undetected; bugs in error counting; undo could leave state inconsistent
- Priority: High - core state management should be thoroughly tested

**No Tests for Trail Making Plugin Event Handlers:**
- What's not tested: Circle click routing; line drawing; undo/redo sequences; feedback panel transitions
- Files: `src/modules/experiment/trials/trail-making-stimulus-trial.ts`
- Risk: Interactive features could break without notice; regression on UI changes
- Priority: High - majority of user interaction logic

**No Tests for Settings Persistence:**
- What's not tested: Loading settings from app data; saving changes; null layout handling; type conversions
- Files: `src/modules/context/SettingsContext.tsx`
- Risk: Settings could fail to load silently; null pointers could crash trials
- Priority: Medium - affects app initialization and configuration

**No Tests for Serial Device Communication:**
- What's not tested: Connection flow; trigger sending; error handling; device disconnection
- Files: `src/modules/experiment/triggers/serialport.ts`
- Risk: Device integration could silently fail; triggers might not send; connection retries could hang
- Priority: Medium - optional feature but critical when used

**No Tests for Break Trial Timer:**
- What's not tested: Countdown logic; display updates; timer cleanup; interrupt handling
- Files: `src/modules/experiment/trials/break-trial.ts`
- Risk: Intervals leak; countdown could run forever; skip button might not work
- Priority: Low - feature less critical but still needs coverage

**No E2E Tests Beyond Smoke Tests:**
- What's not tested: Complete experiment flow; error recovery; long experiment duration; network failures
- Files: `cypress/e2e/` exists but minimal coverage noted
- Risk: Integration issues only discovered in production
- Priority: High - critical user flows need validation

---

*Concerns audit: 2026-03-25*
