# MP-004 — Visual UI, UX writing, creative, and art lead plan

Status: **Proposed visual/content contract for project-lead synthesis**  
Owner: Visual UI and content workstream  
Scope: Design system, information architecture, responsive behavior, UX voice,
copy, art direction, and implementation acceptance criteria  
Runtime changes in this assignment: **None**

## Executive recommendation

Build one responsive **Guided Evidence** experience rather than maintaining
separate desktop and mobile products:

- Use **Option 2 — Guided Journey** for questions, setup, consent, and other
  moments where the user must make one decision.
- Use **Option 3 — Ranked Evidence** for recommendations, matches, and gap
  analysis, with the top three visible and details disclosed on demand.
- Use **Mission Brief / Next Best Action** as the returning-user entry point.
- Use **Progressive Review** for document-derived suggestions. Extraction can
  propose information, but only a user can accept, edit, reject, or apply it.
- Use **Calm Search** as a focused exploration mode, not as another dashboard.

The visual identity remains recognizably MissionProof: deep navy, cobalt/cyan
interaction accents, green confirmation, restrained amber warnings, confident
geometric type, and occasional hexagonal brand moments. The simplification
comes from hierarchy, typography, whitespace, dividers, and progressive
disclosure—not from removing evidence, caveats, or user control.

## Product experience north star

The primary success moment is:

> The user leaves with one evidence-backed target and one achievable next
> action.

Every screen should help the user answer four questions in this order:

1. Where am I?
2. What do I need to decide or do now?
3. Why is this result being shown?
4. What is the single best next action?

### Non-negotiable visual/content invariants

- One primary task and one primary action per screen region.
- Body copy is 16px by default on desktop and mobile; supporting text is never
  smaller than 14px.
- A normal mobile state fits within about 1–1.5 viewports. Optional detail may
  extend the page, but the main action remains easy to reach.
- The full product is grouped into Profile, Translate, Explore, and Plan.
  Eleven equal-weight tabs never occupy the mobile viewport.
- Default result views show three items. Methodology, complete catalogs, and
  secondary education are disclosed only when requested.
- Evidence, provenance, confidence, caveats, and reversibility are never hidden
  merely to make a screen look cleaner.
- Color never carries status by itself; every state also has a text label and,
  where helpful, an icon.
- The interface never claims that a user is qualified, eligible, guaranteed a
  role, or officially verified unless an authoritative current source and
  complete rule set support that claim.
- Uploaded or extracted content never changes a profile until the user makes
  and confirms an explicit decision.

## Unified visual design system

### Color roles

The current palette is strong but should be represented by semantic tokens so
individual screens do not invent near-duplicate blues and greens.

| Token | Starting value | Use | Do not use for |
|---|---:|---|---|
| `canvas` | `#080D1A` | Page background | Dense nested cards |
| `shell` | `#0A1224` | Header, sheet, large work area | Every small row |
| `surface` | `#0E1830` | One primary grouped surface | Cards inside cards |
| `surface-subtle` | `#0C1730` | Selected row or quiet grouping | Primary CTA |
| `border` | `rgba(125,155,210,.18)` | Dividers and quiet outlines | Status by itself |
| `text-strong` | `#EEF2FA` | Headings and primary values | Disabled states |
| `text` | `#C0CCE0` | Body copy | Low-contrast metadata |
| `text-muted` | `#A6B6D2` | Supporting copy at 14px+ | Critical warnings |
| `action` | `#4059F2` | Primary action and current step | Decorative blocks |
| `information` | `#5DB4FF` | Links, evidence, informational state | Confirmation |
| `confirmation` | `#2DD4BF` | Accepted, saved, complete | Eligibility claims |
| `positive` | `#67E8CF` | Score-aligned label with text | “Qualified” |
| `caution` | `#FBBF24` | Gap or item to verify | Generic decoration |
| `danger` | `#F87171` | Destructive action/error | Routine validation |

All text/background and control-state combinations require automated contrast
checks before implementation acceptance. The values above are starting tokens,
not a claim that every possible combination already passes WCAG.

### Typography

- Primary family: **Mission Barlow**, using the existing local font assets.
- Data/identifier family: **Mission Mono**, limited to AFSCs, federal series,
  score labels, dates, and other compact structured identifiers.
- Base body: 16px / 1.55, regular weight, maximum readable line length 65ch.
- Supporting body: 14px / 1.5; never use 10–12px for explanatory content.
- Field labels and eyebrows: 12–14px, 700 weight, moderate tracking. Avoid long
  all-uppercase strings.
- Display heading: `clamp(2rem, 4vw, 3.5rem)` with 1.05–1.12 line height.
- Page heading: `clamp(1.75rem, 3vw, 2.5rem)` with 1.1–1.2 line height.
- Section heading: 22–28px; row title: 18–20px.
- Use no more than three weights in one view. Hierarchy should come from scale,
  spacing, and placement before adding another weight or color.

### Spacing, shape, and elevation

- Base spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px.
- Default page gutter: 16px at 320–479px, 24px at 480–1023px, and 32px+ on
  wider layouts.
- Section separation: 24–32px on mobile, 32–48px on desktop.
- Control height: 48px default; minimum interactive target 44×44px.
- Radius: 8px controls, 12px grouped rows, 16px primary surfaces, full pill only
  for short status labels.
- Use one elevation level for temporary overlays and sheets. Normal page
  hierarchy uses whitespace, a single surface, and row dividers.
- Use hexagons as brand anchors or category marks, not as containers around
  every datum.

### Motion and feedback

- 150ms: hover/focus/pressed response.
- 200ms: expand/collapse or local state change.
- 240ms: sheet/dialog entrance and exit.
- Motion communicates state; it does not delay the task or celebrate routine
  completion.
- Honor `prefers-reduced-motion`. Focus must move intentionally after route,
  dialog, sheet, save, and validation changes.
- Confirmation feedback uses concise inline text or a status region. Avoid
  confetti, streaks, urgency, or game-like pressure.

## Mobile-first information architecture

### Global journey

| Group | Primary user question | Local destinations |
|---|---|---|
| Profile | What should MissionProof know about me? | Goal, service facts, evidence documents, review suggestions |
| Translate | What does my experience mean outside the service? | Translation, competencies, accomplishment drafts |
| Explore | Which path should I research next? | Air Force paths, civilian roles, federal series, credentials, apprenticeships, jobs/bases, skill search |
| Plan | What should I do next? | Saved targets, gaps, milestones, exports |

### Mobile shell

- Top bar: 44px menu control, centered wordmark, and one optional contextual
  action. Do not show eleven route labels or decorative utility icons.
- Page context: journey label, clear page title, and one-sentence purpose.
- Guided flows: `Step N of M` plus a labelled progress indicator. The label must
  describe the actual local flow, not the entire product.
- Journey sheet: four large destinations with one-line descriptions; current
  group is labelled, not only highlighted by color.
- Bottom action bar: one primary action and, only when necessary, one secondary
  back/cancel action. Include safe-area padding and enough body padding that it
  never covers content.
- Never use a horizontally scrolling tab strip for primary navigation. Local
  filters use a select, sheet, segmented control with at most three choices, or
  a disclosure.

### Desktop shell

- Compact four-group navigation in the global header.
- A local breadcrumb or subnavigation identifies the current destination.
- Main content max width: approximately 1120–1200px; reading content: 65–72ch.
- Desktop may place evidence and review details side by side, but the DOM order
  follows the mobile task sequence.

### Route consolidation recommendation

Keep the existing routes for compatibility while presenting them under four
groups. The navigation model should not force a route migration in the first
slice. Route labels become user-centred and consistent:

- `/app`: Service profile
- `/app/retrain`: Air Force paths
- `/app/translation`: Experience translation
- `/app/competencies`: Competency strengths
- `/app/civilian`: Civilian roles
- `/app/federal`: Federal series
- `/app/jobs-bases`: Jobs and locations
- `/app/apprenticeships`: Apprenticeships
- `/app/credentials`: Credentials
- `/app/competency-search`: Explore by skill
- `/app/itp`: Transition plan

## Screen hierarchy and density rules

### Standard screen anatomy

1. Journey context: group, title, and one-sentence purpose.
2. Current task: one input, decision, or next-best-action.
3. Immediate result: top result(s), confidence/source, and the most important
   caveat.
4. Primary action: continue, save, accept, review, or start.
5. Optional depth: methodology, full results, education, and secondary filters.

### Density budget

- One H1, one summary sentence, and one primary CTA in the initial viewport.
- At most one dominant surface above the fold. Within it, use rows and dividers
  instead of nested cards.
- Default result count: three. `Show all` must announce the resulting count.
- Default filter count: one dominant filter or query. Secondary filters open in
  a sheet/disclosure and summarize their applied state.
- Default open disclosure count: one. Opening a mobile result may close the
  previously open result.
- Avoid more than two adjacent action choices. Destructive actions live apart
  from positive decisions and require explicit confirmation.
- Repeated disclaimers become a short contextual caveat plus a named `How this
  works` or `What to verify` disclosure; safety-critical warnings remain in the
  task.
- Do not place explanatory text beneath every field when a single group-level
  explanation is clearer.

### Long-page controls

- Keep the primary action visible in a bottom action bar on guided mobile views.
- Give users a meaningful progress marker, not a large completion percentage
  disconnected from the current task.
- Collapse completed steps into a short history and show current plus next
  milestone by default.
- On returning sessions, open on `Continue reviewing 3 suggestions` or `Start
  your next action`, not on an equal-weight dashboard.

## Accessibility and responsive behavior

### Layout and interaction

- Support 320px width without horizontal page scrolling.
- Reflow at 400% zoom and support 200% text zoom without hiding controls or
  truncating essential content.
- Minimum pointer target: 44×44 CSS pixels with at least 8px separation where
  accidental activation is plausible.
- Every interactive element has a visible 2px+ focus indicator and usable
  hover, focus, pressed, selected, disabled, loading, success, and error states.
- Do not disable browser zoom or rely on hover-only information.
- Use native buttons, links, labels, inputs, details, lists, tables, headings,
  and landmarks before adding ARIA.

### Navigation, dialogs, and status

- The skip link remains the first focusable control.
- On client-side navigation, focus the page heading and announce the new view.
- The journey sheet and dialogs trap focus, close with Escape where safe,
  restore focus to the invoker, and expose name/description relationships.
- Consent, goal choice, destructive confirmation, and candidate review are
  keyboard- and screen-reader-completable.
- Search/result counts, save state, extraction status, and validation errors use
  appropriate polite or assertive live regions without repeated announcements.

### Forms and checkboxes

- Every field has a persistent visible label; placeholders are examples, not
  labels.
- Error messages state what happened and how to correct it, and are associated
  with the field.
- The consent row uses `grid-template-columns: 28px minmax(0, 1fr)` (or an
  equivalent intrinsic-control flex layout). The checkbox never receives half
  the row width.
- The checkbox and its plain-language agreement are one click target. Policy
  links remain separately focusable and do not toggle the checkbox when opened.
- The legal/safety detail is structured below the short agreement rather than
  compressed into one long sentence.

### Status and result semantics

- Pair color with visible labels such as `Score aligned`, `Gap to verify`,
  `Suggested`, `Confirmed`, `Rejected`, and `Needs review`.
- Ranked results are an ordered list on mobile. Desktop may use a table-like
  grid only when headers remain semantically connected to each row.
- Confidence is expressed with a label and explanation. Do not rely on an
  unexplained percentage or green badge.
- Icons that repeat visible text are decorative. Meaningful icons receive an
  accessible name or supporting text.

## UX voice and terminology

### Voice attributes

- **Calm:** short sentences, no pressure, no exaggerated promises.
- **Capable:** assume the user understands their service; explain product terms
  and civilian/federal terminology without talking down to them.
- **Evidence-led:** say what was used, what is inferred, and what must be
  verified.
- **Agency-preserving:** make change, skip, reject, delete, and choose another
  path visible.
- **Practical:** end each result with a useful next action.

### Preferred terminology

| Prefer | Avoid | Reason |
|---|---|---|
| Research lead | Best match | A ranking is not certainty |
| Score aligned | Qualified / eligible | Scores are only part of qualification |
| Gap to verify | Failed / disqualified | Data may be incomplete or change |
| Suggested from your document | We found the truth | Extraction is a proposal |
| Confirmed service fact | Verified identity | Confirmation is user action, not official validation |
| Draft interpretation | Official translation | Translation may require editing |
| Save to plan | Lock in | Saving remains reversible |
| Apply accepted suggestions | Auto-fill my profile | The review decision is explicit |
| Plan progress | Mission readiness / ready to brief | Avoids implying operational readiness |
| Review service facts | Input MissionProof | Clear action in plain language |
| Air Force Specialty Code (AFSC) | AFSC on first mention | Defines acronyms |

### Content patterns

- Heading: state the decision or outcome, not the feature name.
- Summary: one sentence explaining why the task matters.
- Evidence: `Based on [source/fact].`
- Confidence/caveat: `[Label]. [What still needs verification].`
- Action: verb + object, such as `Review this path` or `Save to plan`.
- Warning: state the risk, the safe action, and where to verify.
- Empty state: explain why it is empty and offer one clear way forward.

### Privacy language rule

Do not use absolute claims such as `We never share it` or `Your information
stays private` until policy, storage, telemetry, and vendor behavior make the
claim demonstrably true. For the current local prototype, describe the actual
boundary: values remain in the current prototype session/device unless the
implemented behavior says otherwise, and users should enter only general,
non-sensitive information.

## Revised sample copy for key journey states

### Access and consent

**Title:** Before you add service information  
**Summary:** MissionProof is a career-planning prototype. It provides research
leads and draft translations—not official eligibility decisions.  
**Checkbox:** I agree to the Terms and Privacy Notice and will enter only
general, non-sensitive service information.  
**Safety detail:** Do not upload classified, medical, controlled, operational,
or identity documents. Review what is stored and delete it when you no longer
need it.  
**Primary action:** Agree and continue  
**Secondary action:** Leave MissionProof

### Goal choice

**Title:** What would make this visit useful?  
**Summary:** Choose a starting point. You can change it later.  
**Options:** Translate my experience; Explore career paths; Find credentials;
Build my transition plan; I am not sure yet.  
**Primary action after selection:** Continue

### Guided service fact

**Progress:** Service profile · Step 2 of 4  
**Title:** What is your primary Air Force Specialty Code (AFSC)?  
**Summary:** We use this to tailor translations and research leads.  
**Label:** Primary AFSC  
**Example:** For example, 1B4X1  
**Optional action:** Review suggestions from a document  
**Assurance:** Nothing changes until you review and confirm it.  
**Primary action:** Continue

### Missing profile state

**Title:** Add three service facts to personalize this view  
**Body:** Add your AFSC, rank, and skill level to see tailored translations.
You can also explore without a profile.  
**Primary action:** Add service facts  
**Secondary action:** Explore general examples

### Document safety and upload

**Title:** Choose a general, non-sensitive document  
**Body:** Use a redacted EPB, EPR, OPB, OPR, training summary, or credential
record only if your organization permits it. Remove IDs, signatures, contact
details, unit/location details, and anything not needed for career planning.  
**Primary action:** Choose a document  
**Secondary action:** Enter facts manually

### Local analysis progress

- Checking file type
- Preparing a safe copy
- Reading the document layout
- Preparing suggestions for your review

**Failure:** We could not prepare suggestions from this file. Your profile was
not changed. Try a clearer redacted copy or enter the facts manually.

### Candidate review

**Title:** Review what MissionProof suggested  
**Progress:** Service facts · 2 of 5  
**Assurance:** Nothing changes until you confirm it.  
**Field label:** Primary AFSC  
**Proposed value:** 1N0X1  
**Confidence:** High confidence in the extracted text  
**Source:** EPB · page 1 · highlighted region  
**Actions:** Accept; Edit; Reject  
**Primary completion action:** Review accepted suggestions  
**Final action:** Apply 3 accepted suggestions

### Ranked evidence results

**Eyebrow:** Air Force paths  
**Title:** Research leads based on your MAGE scores  
**Summary:** Each path shows score alignment, the most important gap, and what
to verify with an authorized advisor.  
**Count:** Top 3 of 6 paths  
**Aligned label:** Score aligned  
**Gap label:** 2-point Electrical gap to verify  
**Row action:** Review this path  
**Disclosure:** How ranking works  
**Expansion action:** Show all 6 paths

### Result evidence detail

**Why this appeared:** Your entered General and Administrative scores meet the
displayed example threshold.  
**Evidence used:** MAGE scores entered in this session and versioned example
threshold data.  
**What to verify:** Current rules may also include medical, clearance,
citizenship, strength, rank, and retraining-window requirements.  
**Primary action:** Save to plan  
**Secondary action:** Choose another path

### Search

**Title:** What kind of work do you want to keep doing?  
**Label:** Skill, capability, or work you enjoy  
**Examples:** Leading teams; Data analysis; Logistics; Cybersecurity; Training
others; Budget management.  
**Empty query prompt:** Enter a skill or use your confirmed profile.  
**No results:** No close research leads appeared for this search. Try a broader
term such as `planning`, or explore by career family.  
**Primary action:** Search paths

### Save confirmation

**Status:** Saved to your plan  
**Body:** This is a research target, not an application or eligibility result.  
**Actions:** View plan; Undo

### Returning-user next action

**Eyebrow:** Your transition plan  
**Title:** Collect one mission-impact story  
**Body:** Describe a moment when your work made a measurable difference. This
will strengthen future translations and comparisons.  
**Primary action:** Start this action  
**Secondary action:** Choose a different task  
**Progress:** Milestone 2 of 6

### Delete source confirmation

**Title:** Delete this source document?  
**Body:** MissionProof will remove the document from active storage. Confirmed
profile facts and their audit references are handled according to the stated
retention policy. This action cannot be undone.  
**Destructive action:** Delete document  
**Safe action:** Keep document

## Art, icon, and illustration direction

### Identity to preserve

- The wordmark remains the primary brand asset.
- Hexagonal shapes communicate identity, category, and progress—not decoration
  around every control.
- Cobalt-to-cyan light can mark direction and active state. Green marks a
  completed user decision. Amber marks uncertainty or a gap to verify.
- The atmosphere is precise, optimistic, and calm: career transition and
  evidence, not combat, recruiting, or institutional authority.

### Icon system

- Reuse the existing product SVGs where their meaning is clear.
- Normalize icons to a consistent 24px line style, 2px-equivalent stroke, and
  optical alignment. Use 20px in rows and 28–32px for feature actions.
- Use one approved icon library for missing utility concepts. Do not mix filled,
  outline, hand-drawn, and platform glyph styles.
- Do not use emoji, ASCII symbols, CSS-drawn icons, or improvised inline SVGs as
  product art.
- A repeated labelled icon is decorative (`alt=""`). An icon-only button must
  have a visible tooltip on hover/focus and a programmatic name.

### Illustration direction

- First choice: product UI, typography, and existing brand shapes. The app does
  not need a hero illustration on every route.
- When illustration materially helps, use abstract evidence-to-path imagery:
  connected nodes, highlighted source fragments, path markers, and calm
  geometric depth in the navy/cobalt/cyan palette.
- Avoid official seals, exact insignia, weaponry, aircraft glamour imagery,
  uniforms, flags as decoration, or art that implies Department of the Air
  Force endorsement.
- Human imagery, if approved later, should represent diverse service members,
  veterans, families, and civilian-transition contexts without relying on
  rank, branch, age, gender, race, or disability stereotypes.
- Every generated or licensed asset needs a source/provenance record, intended
  use, crop variants, license/usage status, and accessibility treatment.

### Map and data imagery

- Treat the existing heat map as a data view, not a decorative background.
- Always provide a list/table equivalent, data timestamp, source, and filters.
- Never encode availability or rank by color alone.

## How Option 2 and Option 3 coexist

Option 2 and Option 3 are complementary interaction patterns, not competing
themes:

| Moment | Pattern | Reason |
|---|---|---|
| Consent and goal | Guided Journey | One decision, clear consequence |
| Add service facts | Guided Journey | Low cognitive load and resumable progress |
| Document-derived facts | Progressive Review | One reversible evidence decision at a time |
| Air Force/civilian/federal/credential matches | Ranked Evidence | Comparison needs reason, gap, and source |
| Skill-led exploration | Calm Search + Ranked Evidence | Query first, then a short comparable list |
| Returning session | Mission Brief / Next Best Action | Resume useful work without a dashboard scan |
| Plan | Next Best Action + collapsed history | Current action stays prominent |

### Shared shell contract

Both options use the same:

- Four journey groups and journey sheet.
- Typography, spacing, semantic color, icon, focus, and motion tokens.
- Page header and bottom action bar.
- Evidence labels, confidence language, caveats, save state, and status feedback.
- Mobile breakpoints and 320px minimum.
- Desktop max-width and reading-length rules.

### Responsive transformation

- Option 2 remains a single-column guided view at all widths. Desktop adds
  breathing room; it does not turn the step into a dense form.
- Option 3 is an ordered list on mobile. The default row shows rank, identity,
  status, and one action. `Review this path` reveals reason, evidence, gap, and
  displayed requirements. On desktop, the same information can occupy aligned
  columns.
- Mobile Option 3 is the responsive state of the same results view, not a
  separate route, content model, or editorial voice.
- Entered facts and saved targets persist between the two patterns. The user is
  never asked to re-enter data when moving from guided setup to ranked results.

## Implementation-ready acceptance criteria

### Global shell and information architecture

- [ ] Navigation exposes Profile, Translate, Explore, and Plan at every app
      route and identifies the current group in text and semantics.
- [ ] All eleven existing routes remain reachable without appearing as eleven
      equal-weight mobile tabs.
- [ ] Mobile navigation opens as a keyboard-operable labelled sheet and does
      not create horizontal scrolling at 320, 360, 390, or 430px.
- [ ] Client-side route changes move focus to the new page heading and announce
      the view.
- [ ] The main action is reachable without scrolling back to the top.

### Visual system and density

- [ ] Semantic tokens replace one-off color, type, radius, spacing, and shadow
      values in the new slice.
- [ ] Default body copy is 16px/1.5+ and supporting copy is 14px/1.5+.
- [ ] No explanatory content is rendered at 10–12px.
- [ ] No normal task screen shows more than one dominant surface or three
      default result items before progressive disclosure.
- [ ] Cards are not nested inside other card-like surfaces; grouped rows use
      dividers.
- [ ] The app works at 320px and 400% zoom without hidden tasks, clipped text,
      or horizontal page scrolling.

### Guided Journey

- [ ] A guided step shows the local flow name, `Step N of M`, the single
      question, persistent label, concise help, and one primary action.
- [ ] Continue is disabled only when the missing requirement is clear and the
      disabled styling is not the sole explanation.
- [ ] Entering a valid AFSC normalizes its display, preserves the value, and
      moves to the expected next step.
- [ ] Optional document assistance explains that suggestions require review
      before profile changes.
- [ ] A user can save and exit or choose a manual path without losing confirmed
      work.

### Ranked Evidence

- [ ] The top three results are ordered and labelled as research leads.
- [ ] Each default row shows identity, score-alignment/gap text, and one review
      action.
- [ ] Expanded detail shows why the result appeared, evidence/source version,
      displayed requirements, the most important gap, and what to verify.
- [ ] `Show all` announces the complete result count and can return to the top
      three.
- [ ] Ranking copy never says `qualified`, `eligible`, or `best` unless the
      backend contract can support that exact claim.
- [ ] Save is reversible and carries the target into Plan without an external
      key or provider.

### Consent and evidence review

- [ ] The consent control column is intrinsic (approximately 28px) and the
      message owns the remaining width at every breakpoint.
- [ ] Policy links, safety guidance, and agreement text remain separately
      understandable and keyboard accessible.
- [ ] Every document suggestion shows field, proposed value, source document,
      page/region reference, extractor/version, confidence label, and warnings.
- [ ] Accept, Edit, and Reject are explicit per suggestion; applying accepted
      suggestions is a separate confirmation.
- [ ] Failure, cancellation, rejection, and deletion states never partially
      update the profile.

### Copy and art

- [ ] Acronyms are defined on first use in each new-user journey.
- [ ] Empty, loading, success, error, destructive, and offline/local-only states
      use the approved content pattern and offer a next action.
- [ ] Privacy language reflects implemented storage, retention, analytics, and
      provider behavior; it does not use unsupported absolutes.
- [ ] Existing icons are reused or missing icons come from one approved library;
      no emoji, CSS art, placeholder boxes, or improvised inline SVGs ship.
- [ ] Meaningful imagery has useful alt text; decorative imagery is hidden from
      assistive technology.
- [ ] Any new art has documented source/provenance and usage status.

### No-key baseline

- [ ] Consent, manual profile entry, deterministic matching, search, save, plan,
      and local/synthetic review demo work without an API key.
- [ ] An unavailable optional provider is described as unavailable; the core
      journey does not dead-end or imply that an AI key is required.

## Content and art asset inventory

### Available now

| Asset | Location | Intended use | Action |
|---|---|---|---|
| Mission Barlow fonts | `public/assets/fonts/` | Display, body, and UI text | Retain; map weights to tokens |
| Mission Mono font | `public/assets/fonts/db928d6b0a131e24.ttf` | AFSCs, series, scores | Retain; limit to structured identifiers |
| Existing product icons | `public/assets/icons/*.svg` | Brand/category/utility marks | Audit meaning, normalize sizes, document mapping |
| Jobs heat map | `public/assets/heatmap-us.png` | Jobs and locations data view | Retain with source/date/list equivalent |
| Six design concepts | `docs/design-concepts/*.png` | Visual hierarchy references | Retain as design evidence, not runtime art |
| Option 2 QA evidence | `codex/option-2-guided-journey` | Mobile guided-step reference | Reuse interaction and density findings |
| Option 3 QA evidence | `codex/option-3-ranked-evidence-mobile` | Responsive ranked-list reference | Reuse disclosure and ordering findings |

### Needed for implementation

| Item | Type | Minimum states/variants | Owner/decision |
|---|---|---|---|
| Semantic design tokens | Code/design contract | Light/dark is not required; semantic roles are | Visual lead + frontend |
| Global journey shell | Component | Desktop, mobile sheet, current route, focus return | Frontend with visual review |
| Page context header | Component | Guided, results, returning-user | Frontend |
| Bottom action bar | Component | One action, two actions, loading, safe-area | Frontend |
| Guided field step | Component | Empty, valid, invalid, saved, resumed | Frontend/content |
| Ranked result row | Component | Aligned, gap, expanded, saved | Frontend/content |
| Evidence/source block | Component | Available, unavailable, redacted, stale | Frontend/backend contract |
| Candidate decision row | Component | Pending, accepted, edited, rejected, conflict | Cross-workstream |
| Status and confidence glossary | Content | User-facing definitions and caveats | Content + product/security |
| Empty/error/offline library | Content | Every MVP route and provider boundary | Content + frontend/backend |
| Icon map | Design asset record | Name, source, purpose, decorative/meaningful | Visual lead |
| Art provenance record | Documentation | Source, license, prompt/version, crop, alt | Visual lead + project lead |

### Deferred art

- New raster illustrations are not required for the walking skeleton.
- If later research shows that an illustration improves comprehension, create
  it only for a measured slot with a defined size, crop, content purpose,
  accessibility treatment, and approval. Do not generate generic military
  decoration to fill space.

## Risks, assumptions, and open decisions

### Risks

- **Design drift:** Option 2 and Option 3 each currently duplicate mobile shell
  CSS. Integrating both without a shared shell/token layer will create route
  inconsistencies.
- **Small-text regression:** The current runtime sets a 15px root experience and
  uses many 10–13px labels and explanations. New components can inherit this
  density unless typography tokens are applied at the shell.
- **Navigation overload:** The current eleven-step horizontal control remains
  discoverable in code but does not scale as primary mobile navigation.
- **Container creep:** Several current screens use panel → grid → card → pill
  structures. Feature additions may recreate the overwhelmed feeling unless
  the density budget is an acceptance gate.
- **Trust language:** Statements such as `Your information stays private` or
  `We never share it` may overstate an unimplemented or evolving data policy.
- **Ranking certainty:** Fixed ordering or percentages can look authoritative
  even when inputs and source versions are incomplete.
- **Military endorsement:** Official-looking art, insignia, or seals could imply
  endorsement or source accuracy that this design fork does not have.
- **Long review queues:** One-candidate-at-a-time review protects agency but can
  feel slow. Group only high-confidence structured facts; keep each decision
  individually reversible.

### Assumptions

- The project remains an independent design fork and visibly avoids claims of
  official MissionProof or Department of the Air Force ownership/endorsement.
- The current React frontend and ASP.NET Core host remain the implementation
  stack.
- Core journeys must work with local deterministic data and no AI/provider key.
- Existing paths and source values are prototype examples until an approved,
  versioned source contract is implemented.
- The existing navy/cobalt/cyan/green identity is approved as the starting
  visual direction.
- English is the initial interface language, but components should allow longer
  translated strings and not encode meaning through word length or casing.

### Decisions required from project lead/product owner

1. Is the first walking slice aimed at a first-time user, returning user, or
   both? Recommendation: first-time vertical slice first, then returning resume.
2. Should the fork notice appear only in repository documentation or also in an
   in-app About/footer disclosure? Recommendation: include a quiet in-app notice
   on access/About surfaces.
3. Which three result families are in the MVP: Air Force, civilian, federal,
   credentials, or a combined search? Recommendation: Air Force ranked paths
   first because Option 3 already has interaction evidence.
4. Is document review demonstrated with synthetic/local fixtures in the first
   milestone? Recommendation: yes, with no production upload or external model.
5. What implemented storage and retention behavior can privacy copy promise?
   Until decided, use narrow prototype-language rather than absolutes.
6. Is a light reading surface permitted for dense evidence review, or must the
   product remain fully dark? Recommendation: keep the first slice dark and test
   a near-white review surface later with users who read long evidence.
7. Which icon library is approved when the captured asset set has no match?

## Recommended first design/content slice

Build and validate one no-key path at 390×844, 320×568, 768×1024, and
1440×900:

1. **Concise consent** with an intrinsic-width checkbox column and explicit
   safety detail.
2. **Goal choice** with five plain-language options and `Not sure yet`.
3. **Guided AFSC step** using Option 2 anatomy, readable type, journey sheet,
   and a persistent Continue action.
4. **Ranked Air Force paths** using Option 3 anatomy: top three, aligned/gap
   labels, one expanded row, methodology disclosure, and `Save to plan`.
5. **Save confirmation and next action** that carries the chosen research lead
   into Plan and offers one meaningful milestone.

The slice proves the shared shell, responsive transformation, copy system,
deterministic state flow, evidence language, and handoff between Guided Journey
and Ranked Evidence. It deliberately defers new raster art, production document
upload, provider integration, and the full route catalog.

### Slice design/content deliverables

- Token map and component anatomy for the shared shell, guided step, ranked row,
  evidence block, status feedback, and bottom action bar.
- Final copy for empty, valid, invalid, loading, saved, expanded, and error
  states in the slice.
- Desktop/mobile paired screenshots after implementation, captured at the same
  state and validated for both pixels and behavior.
- Keyboard order, screen-reader names, zoom/reflow, reduced-motion, target-size,
  and contrast evidence.
- A short five-user comprehension check: `What is this page asking?`, `Why is
  this result shown?`, and `What happens next?`

## Evidence inspected

The plan is grounded in the following evidence inspected during this assignment:

- Repository constraints: `AGENTS.md`.
- Product goals, heuristic findings, information architecture, readability,
  consent-layout requirement, and redesign criteria: `docs/product-design.md`.
- Six structural directions and their guardrails:
  `docs/design-versions.md`.
- Visual concept images inspected at original detail:
  `docs/design-concepts/01-mission-brief.png` through
  `docs/design-concepts/06-progressive-review.png`.
- Current application structure and user-facing copy: `src/App.jsx` at
  `beb437c` on the rebuild branch baseline.
- Current palette, type assets, eleven-step header, responsive rules, consent
  layout, cards, results, forms, and transition-plan styling:
  `src/styles.css` at `beb437c`.
- Current search, matching, save, and plan behavior contracts:
  `src/domain/missionproof.js`, `tests/ui/app.test.jsx`, and
  `tests/unit/missionproof.test.mjs`.
- Option 2 implementation/QA history and responsive interaction contract:
  commits `027e51a` and `0649221` on
  `codex/option-2-guided-journey`, including `design-qa.md` and the code/test
  diff from `dev`.
- Option 3 implementation/QA history and responsive disclosure contract:
  commit `f84bd85` on `codex/option-3-ranked-evidence-mobile`, including
  `design-qa.md` and the code/test diff from `dev`.
- Shared no-key, security, ingestion, and architecture boundaries:
  `docs/project/PROJECT-CHARTER.md`, `docs/project/WORKBOARD.md`,
  `docs/architecture.md`, `docs/document-ingestion.md`, and
  `docs/security-plan.md`.
- Design-fork intent and original-designer framing: `README.md` and
  `docs/README.md`.

### Evidence limits

- The original MissionProof source repository and live authenticated product
  were not available for this assignment.
- The plan does not claim source fidelity beyond the captured concepts, prior
  branch QA notes, current local code, and documented observations.
- Prior screenshots demonstrate pixels and the QA reports record prior witnessed
  interactions; they do not replace fresh behavior, accessibility, or device
  testing after integration.
- No new production screens, browser flow, user research, raster art, or runtime
  behavior were created or claimed in MP-004.
