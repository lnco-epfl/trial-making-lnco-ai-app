# Quick Task 260325-ncg: Practice Retry UX - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Task Boundary

Adjust practice retry flow so it matches participant guidance expectations:

- on first-attempt failure, Retry should route back through instructions (not instant in-trial reset)
- on second attempt, there should be no retry loop; only continue

</domain>

<decisions>
## Implementation Decisions

### Retry routing

- First-attempt failure uses in-trial Retry button only as a transition trigger; clicking it finishes the current trial so the existing retry timeline returns to instruction screen.

### Second-attempt behavior

- Second-attempt failure no longer exposes Retry. It shows error feedback with Continue only and finishes the stage.

### Timeline integration

- Pass explicit `practice_attempt` (1/2) from practice timeline builders into the stimulus plugin.

</decisions>

<specifics>
## Specific Ideas

- Keep existing retry intro/proceed timeline nodes and conditional routing in `practice.ts`.
- Only change plugin failure button semantics and attempt awareness.

</specifics>
