# Design QA — Option 2 Guided Journey

- Source visual truth: `docs/design-concepts/02-guided-journey.png`
- Implementation screenshot: `implementation-option-2-mobile.png`
- Combined comparison: `qa-option-2-comparison.png`
- Viewport/CSS size: 390 × 844 px; device scale factor 1
- Source pixels: 852 × 1850, normalized to 388 × 844 in the comparison
- Implementation pixels: 390 × 844; no density scaling
- State: `/app`, empty Primary AFSC field, Continue disabled

## Full-view comparison evidence

The implementation preserves the source hierarchy: compact brand header, profile hex, Step 2 of 4, Service profile, half-progress line, one AFSC question, large field, optional document prefill, privacy assurance, and a full-width Continue action. The final viewport has no horizontal or vertical overflow (`390 × 844` document and viewport).

## Focused-region evidence

The full-view comparison is sufficiently legible for the relevant fidelity surfaces. The AFSC form region was additionally tested interactively: entering `1N0X1` enables Continue, saves the normalized value, and routes to `/app/translation`.

## Fidelity surfaces

- Typography: existing Mission Barlow fonts, weights, hierarchy, wrapping, and 16px readable body baseline match the intended family and density.
- Spacing/layout: source rhythm and single-column anatomy are preserved; the implementation is compressed slightly to keep the primary action visible without scrolling.
- Colors/tokens: existing MissionProof navy, cobalt, cyan, green, and muted text tokens are retained.
- Image quality/assets: existing product wordmark and source icon assets are used; no raster placeholders or custom-drawn icons were introduced.
- Copy/content: required question, help, example, document review assurance, privacy statement, and Continue action are present.

## Comparison history

1. Initial capture: P2 — primary Continue action fell below the mobile viewport and the main question wrapped more aggressively than the source.
2. Fix: tightened mobile-only spacing and type scale, removed bottom overflow, and kept the action inside the 844px viewport.
3. Post-fix evidence: `qa-option-2-comparison.png`; no actionable P0/P1/P2 differences remain.

## Primary interactions and console

- Menu control opens the four journey groups.
- Primary AFSC field accepts input.
- Continue enables only after input and navigates to Translation.
- Automated UI/unit suite passes.
- Browser console errors/warnings checked: none.

## Follow-up polish

- P3: the privacy row intentionally omits the source mock's decorative lock emblem because that exact icon is not part of the existing product asset set.
- P3: the empty state keeps Continue disabled for correct affordance, while the static source mock depicts it as visually active.

final result: passed
