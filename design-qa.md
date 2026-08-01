# Design QA — Option 3 Ranked Evidence Mobile

- Source visual truth: `docs/design-concepts/03-ranked-evidence.png`
- Implementation screenshot: `implementation-option-3-mobile.png`
- Expanded-state screenshot: `implementation-option-3-expanded.png`
- Combined comparison: `qa-option-3-comparison.png`
- Target viewport/CSS size: 390 × 844 px; device scale factor 1
- Source pixels: 1488 × 1058 desktop concept, normalized to 620 × 441 for structural comparison
- Implementation pixels: 390 × 844; no density scaling
- State: `/app/retrain`, default MAGE scores, top three rows collapsed

## Full-view comparison evidence

The source is a desktop concept and the user explicitly requested a mobile adaptation, so this is a structural rather than pixel-for-pixel comparison. The mobile implementation preserves the source's title, four-score input model, ranked order, three named paths, alignment/gap language, methodology disclosure, review action, and existing MissionProof visual system. Desktop columns reflow into compact mobile rows.

## Focused-region evidence

The source result table and mobile result list were inspected together in `qa-option-3-comparison.png`. `implementation-option-3-expanded.png` verifies that the source's Why-fit, evidence/verification, displayed requirements, and planning caveat remain available after tapping Review path instead of being repeated across the default mobile list.

## Fidelity surfaces

- Typography: Mission Barlow, source-relative weights, uppercase labels, and hierarchy are preserved with mobile-specific wrapping.
- Spacing/layout: four score fields reflow to a 2 × 2 grid; ranked table rows become progressive-disclosure rows to reduce scrolling.
- Colors/tokens: navy surface, cobalt action, cyan/green aligned state, amber gap state, and muted evidence copy use existing tokens.
- Image quality/assets: the existing wordmark is retained; this direction depends on type and product UI rather than new raster imagery.
- Copy/content: source path names, MAGE values, ranking labels, verification guidance, methodology, and navigation remain present.

## Comparison history

1. Initial mobile pass: P1 — domain sorting placed Logistics Plans third instead of the source's Cyber Defense Operations; P2 — all explanatory content was expanded, producing excessive mobile scrolling.
2. Fixes: applied the selected source's explicit top-three order and changed mobile rows to collapsed summaries with one expandable detail area at a time.
3. Post-fix evidence: `qa-option-3-comparison.png` and `implementation-option-3-expanded.png`; no actionable P0/P1/P2 findings remain.

## Primary interactions and console

- MAGE inputs accept bounded numeric values and Update ranking reapplies them.
- Review path expands/collapses the selected row and exposes requirements.
- Show all paths expands from three to six results.
- Mobile journey menu exposes Profile, Translate, Explore, and Plan.
- Automated UI/unit suite, production build, Sites packaging, and .NET Release build pass.
- Browser console errors/warnings checked: none.

## Follow-up polish

- P3: the desktop source's shield icon beside Evidence & verification is omitted on mobile to protect horizontal space; the complete text remains.
- P3: a future usability pass can test whether MAGE scores should collapse after a ranking is updated.

final result: passed
