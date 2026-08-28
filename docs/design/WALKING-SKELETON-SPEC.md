# MissionProof walking-skeleton visual and content specification

Status: accepted-contract implementation reference for MP-006  
Milestone: first-time-user, no-key walking skeleton  
Visual/content authority:
`src/content/journeyContent.js` and `src/styles/tokens.css`

## Outcome

The milestone delivers one coherent path:

`consent → goal → guided AFSC → top-three research leads → save one target → one next action`

It recomposes Option 2 Guided Journey and Option 3 Ranked Evidence inside a
single responsive MissionProof shell. It does not reproduce the entire product,
depend on an external AI key, accept production documents, or claim official
eligibility.

The user should be able to answer these questions within five seconds on every
screen:

1. Where am I?
2. What do I need to do now?
3. Why am I seeing this information?
4. What happens next?

## Experience contract

### Global shell

- Four global journeys: Profile, Translate, Explore, and Plan.
- Mobile uses a menu button and labelled journey sheet, never the legacy
  eleven-tab strip.
- Desktop uses the same four groups in a compact header.
- Route changes focus and announce the page heading.
- The quiet independent-design-fork disclosure remains visible without
  competing with the current task.
- The shell uses the dark visual direction and existing brand assets only.

### Content hierarchy

Every milestone view follows this order:

1. Journey or prototype context.
2. One clear heading and one-sentence purpose.
3. One input, decision, result group, or next action.
4. One primary action.
5. Optional detail through a named disclosure.

The initial viewport contains no more than one dominant surface and one primary
action. Result screens show no more than three rows by default.

## Screen anatomy and accepted copy

Runtime copy comes from the named objects in
`src/content/journeyContent.js`. Components must import this copy rather than
duplicating it.

### 1. Consent

Authority: `consentContent`, `forkDisclosure`

Anatomy:

- Quiet `Independent design fork` eyebrow.
- Heading: `Before you add service information`.
- Plain-language prototype limitation.
- Checkbox in an intrinsic 28px control column with flexible message text.
- Separate, focusable in-page Terms and Privacy Notice anchors that reveal the
  content-authority summaries without navigating away or toggling consent.
- Terms explain that the independent design fork provides planning guidance,
  not official eligibility, qualification, employment, or transition outcomes,
  and that the user controls their decisions.
- Privacy explains process-local development state, no external AI provider,
  synthetic/illustrative data only, and the prohibition on sensitive or
  official records. It makes no production storage, retention, or deletion
  promise.
- Safety detail explaining prohibited information and synthetic-only evidence.
- One primary `Agree and continue` action.
- One secondary `Leave MissionProof` action.

States:

- Unchecked: primary action disabled and a clear requirement is available.
- Checked: primary action enabled.
- Submission pending: action communicates saving and prevents duplicate write.
- Failure: agreement remains visible; confirmed state is not invented.

Privacy rule: describe only implemented process-local/no-provider behavior. Do
not say `we never share`, `fully private`, promise permanent deletion/storage
behavior, or make another production-level or absolute claim.

### 2. Goal

Authority: `goalContent`

Anatomy:

- Heading: `What would make this visit useful?`
- Five radio-like single-select options with short descriptions.
- `I am not sure yet` remains a first-class option.
- One primary Continue action.

States:

- No selection: Continue disabled and the requirement is available.
- Selected: visible selected state uses shape/text as well as color.
- Save failure: selection remains recoverable; no silent route transition.

### 3. Guided AFSC

Authority: `profileContent`

Pattern source: Option 2 Guided Journey.

Anatomy:

- `Profile` journey context.
- `Service profile · Step 2 of 4` progress with a labelled indicator.
- Heading that defines Air Force Specialty Code before using AFSC alone.
- Persistent `Primary AFSC` label, example placeholder, and concise help.
- Optional synthetic-evidence-review entry point.
- Assurance that nothing changes without confirmation.
- Persistent Continue action on mobile, with body padding for safe-area overlap.

States:

- Empty: Continue disabled with a clear missing-requirement message.
- Invalid: field and associated message explain the expected format.
- Valid: normalized display and enabled Continue.
- Saving: prevent duplicate writes.
- Confirmed: API response is treated as a confirmed fact and carries forward.
- Failure: retain the entered value and explain that confirmed information was
  not changed.

Only the goal and primary AFSC are confirmed profile data in this milestone.

### 4. Ranked research leads

Authority: `resultsContent`, `forkDisclosure`

Pattern source: Option 3 Ranked Evidence.

Anatomy:

- `Explore` journey context.
- Heading: `Research leads based on your confirmed AFSC and goal`.
- Explicit illustrative/synthetic source caveat.
- Top three ordered results.
- Each collapsed mobile row shows rank, AFSC/title, `Connected to profile` or
  `Gap to verify`, and one `Review this path` action.
- One row expands at a time on mobile.
- Expanded content shows why the result appeared, evidence/source version,
  warnings, the gap, what to verify, and Save to plan.
- `How ranking works` and `Show all paths` are secondary disclosures.

Terminology:

- Say `research lead`, `connected to profile`, `gap to verify`, and `official
  verification required`.
- Do not say `best`, `qualified`, `eligible`, or `AI recommendation`.
- A profile-connected state still displays official-verification guidance.

Data contract display:

- Show the ruleset/source version where detail is expanded.
- Display at least one human-readable reason for every result.
- Display warnings and the most important gap before secondary methodology.
- Never infer missing requirements or convert an illustrative rank into an
  official conclusion.

### 5. Save confirmation

Authority: `planContent`, `statusContent`

Anatomy:

- Inline or announced status: `Saved to your plan`.
- Clarification that the item is a reversible research target.
- Actions: View plan and Undo.

Behavior:

- Saving is idempotent.
- Undo is available after success.
- The confirmation produces one explicit next action.
- Failure does not present a saved visual state.

### 6. Next action

Authority: `planContent`

Pattern source: Next Best Action.

Anatomy:

- `Plan` journey context.
- Named milestone, not a readiness percentage.
- One current action: collect a mission-impact story.
- One preview of the next milestone: verify the saved research lead.
- One primary Start action and one secondary Choose a different task action.
- Completed history stays collapsed.

## Synthetic evidence-review support

Authority: `statusContent`

The backend milestone exposes a synthetic plain-text analysis and review API.
If the frontend surfaces it in this slice, the UI must show:

- Synthetic/demo label before analysis begins.
- Bounded progress language from `analysisStages`.
- Candidate fact, proposed value, confidence label, analyzer/rule version,
  source line/hash provenance, warnings, and review state.
- Individual Accept, Edit, or Reject decisions.
- Separate `Apply accepted suggestions` confirmation.
- Clear statement that analysis alone never changes the profile.

No production upload picker, PDF preview, OCR promise, or external-provider
language belongs in this milestone.

## Semantic token application

`src/styles/tokens.css` is the only new semantic token authority for the slice.

### Color

- Canvas and shell: `--mp-color-canvas`, `--mp-color-shell`.
- One dominant grouped surface: `--mp-color-surface`.
- Quiet rows/selections: `--mp-color-surface-subtle`.
- Text: `--mp-color-text-strong`, `--mp-color-text`,
  `--mp-color-text-muted`.
- Primary action/current step: `--mp-color-action` and its states.
- Information/evidence: `--mp-color-information`.
- Accepted/saved/confirmed: `--mp-color-confirmation`.
- Profile connection: `--mp-color-positive` with a visible label.
- Gap to verify: `--mp-color-caution` with a visible label.
- Destructive/error: `--mp-color-danger` with explicit text.

No state depends on color alone. Contrast must be checked on the actual
foreground/background combinations used by components.

### Typography

- Body and UI: `--mp-font-body`.
- Display and headings: `--mp-font-display`.
- AFSCs, series, and versions only: `--mp-font-mono`.
- Body copy: `--mp-font-size-body` with
  `--mp-line-height-body` or greater.
- Supporting copy: `--mp-font-size-caption` (14px) with at least 1.5 line height.
- Long explanations remain within `--mp-content-readable`.
- New explanatory copy must not use 10–12px type.

### Spacing, shape, and elevation

- Use the `--mp-space-*` four-pixel scale.
- Page gutter: `--mp-page-gutter`.
- Major separation: `--mp-section-gap`.
- Control minimum: `--mp-control-min-size` (44px).
- Controls, rows, and primary surfaces use their corresponding radius tokens.
- Normal hierarchy uses space and dividers. `--mp-shadow-raised` and
  `--mp-shadow-overlay` are reserved for temporary elevation.

### Focus and motion

- Every control uses the visible `--mp-focus-ring` treatment or an equivalent
  that consumes the focus tokens.
- Hover/focus response: `--mp-motion-fast`.
- Expand/collapse: `--mp-motion-standard`.
- Sheet/dialog: `--mp-motion-slow`.
- Reduced-motion preference collapses these durations to zero.

## Responsive composition

### 320–479px

- 16px page gutter.
- Compact top shell, full-width journey sheet, and 44px+ controls.
- Single-column guided step.
- MAGE inputs are not part of this milestone. Results use the confirmed AFSC
  and selected goal with an illustrative local mapping.
- Ranked results are an ordered list with one expandable row.
- Bottom action bar includes safe-area padding and never covers body content.
- No page-level horizontal overflow.

### 480–1023px

- 24px-equivalent responsive gutter.
- Single reading column for guided tasks.
- Ranked rows may use identity plus action columns; explanation remains below
  until enough space exists.

### 1024px+

- Maximum application content width: `--mp-content-wide`.
- Four-group navigation is visible.
- Guided task remains centered and narrow rather than becoming a dense form.
- Ranked rows can align identity, reason, evidence, and action in columns while
  preserving the same DOM and keyboard order as mobile.

Required inspection viewports: 390×844 and 1440×900. Required reflow check:
320px width and 400% zoom.

## Accessibility acceptance checks

- [ ] Skip link is first and clearly visible on focus.
- [ ] Every view has one H1 and meaningful landmark structure.
- [ ] Route transition focuses/announces the page heading.
- [ ] Journey sheet exposes its expanded state, traps/returns focus correctly,
      closes with Escape, and identifies the current journey in text.
- [ ] Consent checkbox uses an intrinsic control column and flexible text.
- [ ] Policy links remain separately focusable without toggling consent.
- [ ] Terms and Privacy Notice anchors reveal `termsSummary` and
      `privacySummary` in the consent view without leaving the local flow.
- [ ] Every field has a persistent label and associated error/help text.
- [ ] All interactive targets are at least 44×44 CSS pixels.
- [ ] Focus is visible against canvas, surfaces, action colors, and status states.
- [ ] Status changes and result counts are announced without repeated noise.
- [ ] Ranked results use ordered-list semantics on mobile.
- [ ] Expanded controls expose `aria-expanded` and an associated region.
- [ ] Color status is paired with visible text.
- [ ] Keyboard-only users can complete the full milestone without a trap.
- [ ] Reduced-motion preference prevents nonessential movement.
- [ ] 320px, 200% text zoom, and 400% page zoom preserve all tasks.
- [ ] Contrast checks cover default, hover, focus, disabled, positive, caution,
      danger, and link combinations.

## Content acceptance checks

- [ ] Every runtime phrase in the milestone imports from one of the seven named
      content exports where the phrase is covered by the content authority.
- [ ] The independent design-fork disclosure is visible.
- [ ] Synthetic/illustrative data is labelled before a user relies on a result.
- [ ] Privacy language describes the implemented local/no-provider boundary.
- [ ] Privacy language does not promise production storage, retention, or
      permanent deletion behavior.
- [ ] AFSC is defined on first use.
- [ ] Rankings use non-authoritative terminology.
- [ ] Every warning states the risk and a safe next action or verification path.
- [ ] Empty, invalid, loading, saving, saved, undo, offline, and error states
      have explicit copy.
- [ ] Save confirmation states that a saved item is reversible and not an
      eligibility result.
- [ ] The plan ends with one achievable action.

## Behavioral and visual verification matrix

| Surface | Behavior evidence | Visual evidence |
|---|---|---|
| Consent | Checkbox gates continue; links and keyboard order work | Intrinsic checkbox column; readable text; focus visible |
| Goal | Single selection persists; continue routes correctly | Selected state uses text/shape/color; no dense card grid |
| AFSC | Validation, normalization, confirm, retry | One question, 16px body, persistent mobile action |
| Results | Top three, one-row disclosure, show all/top, source warnings | Ordered hierarchy, connection/gap labels, no nested cards |
| Save | Idempotent save, undo, plan carry-over | Clear success status without celebratory clutter |
| Plan | Current action starts; alternate task remains available | Current plus next milestone, history collapsed |
| Synthetic review | Analysis cannot mutate; decisions and apply are separate | Provenance/confidence visible; actions unambiguous |
| Shell | Routes focus heading; journey sheet works | No eleven-tab mobile strip; no horizontal overflow |

Screenshots support pixel/layout claims only. Interaction tests, DOM inspection,
and API tests support behavior and state claims.

## Milestone definition of done

- Core consent/profile/match/save/plan flow completes without a key.
- Copy is imported from the content authority and new component styling consumes
  semantic tokens.
- The same data and route state work in mobile and desktop compositions.
- Design-fork and illustrative-data caveats are visible.
- Automated frontend, Sites, and .NET gates pass.
- Browser inspection passes at 390×844 and 1440×900 with keyboard navigation,
  visible focus, no horizontal overflow, and no console errors.
- A fresh screenshot pair and behavior evidence are recorded after integration.

## Explicitly out of scope

- Production documents, official records, PDF/DOCX upload, OCR, or malware/CDR.
- External AI or document-provider setup.
- Official eligibility, qualification, employment, or counseling decisions.
- New raster illustrations, new icon dependencies, or brand replacement.
- Full legacy-route redesign.
- Persistence beyond the accepted process-local development boundary.
- Push, merge, publication, or release.
