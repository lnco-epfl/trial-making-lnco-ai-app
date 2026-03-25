# Quick Task 260325-okn: screen calibration: enforce field scaling as min(screen-fit, host scale) in TMT field sizing - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Task Boundary

Implement screen calibration scaling so the Trail Making field uses host scale while still fitting on screen without scroll. Effective scaling must be bounded by both requested host scale and viewport fit (whichever is smaller).

</domain>

<decisions>
## Implementation Decisions

### Scale default behavior
- If host scale is missing/invalid, default to `1.0`.
- Even with default scale, field dimensions must still be constrained by viewport fit so the full field is visible without scrolling.

### Geometry scope
- Apply effective scaling to both field geometry and circle radius.
- Circle positions remain percentage-based within the scaled container, preserving layout proportions.

### Enlargement policy
- Allow enlargement above baseline when host requests `scale > 1` and viewport fit allows it.
- If enlargement would overflow available space, clamp down to screen-fit.

### the agent's Discretion
- Reserve a conservative vertical budget for instruction text + controls to avoid scroll.
- Keep existing stage flow and user-facing behavior unchanged outside scaling math.

</decisions>

<specifics>
## Specific Ideas

- Propagate host scale from local context (`screenCalibration.scale`) into experiment run input and trial config.
- Compute requested field size from baseline target height and host scale.
- Compute fit scale from available viewport width/height and clamp final dimensions.
- Derive `effectiveScale = hostScale * fitScale` and apply this to circle radius.

</specifics>

<canonical_refs>
## Canonical References

- No external specs. Requirements captured in the discussion decisions above.

</canonical_refs>
