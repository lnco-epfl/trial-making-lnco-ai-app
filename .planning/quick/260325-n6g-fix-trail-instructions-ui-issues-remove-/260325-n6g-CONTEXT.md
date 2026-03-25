# Quick Task 260325-n6g: Instruction UI polish - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Task Boundary

Fix instruction presentation quality for Trail Making trials:

- remove residual hard-coded English
- prevent duplicate review buttons between practice stages
- improve text readability with proper margins/width

</domain>

<decisions>
## Implementation Decisions

### In-trial instruction line

- Remove the in-trial helper line entirely from the stimulus plugin. Intro/ready screens already contain the full translated instructions.

### Review button lifecycle

- Before creating a practice review button, remove any existing review buttons from prior trials/stages.

### Readability

- Add scoped Trail Making layout styles to constrain line length and add padding/margins for intro/ready/feedback/complete instruction blocks.

</decisions>

<specifics>
## Specific Ideas

- Keep copy text untouched; fix presentation and behavior only.
- Keep changes localized to practice builder, stimulus plugin, and experiment stylesheet.

</specifics>
