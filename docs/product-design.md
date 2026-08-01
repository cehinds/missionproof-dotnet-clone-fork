# Product and interaction design

## Product outcome

MissionProof helps current and former service members turn general, non-sensitive service evidence into understandable career options and a practical transition plan. It should reduce uncertainty without implying eligibility, guaranteeing employment, or replacing official counseling.

The primary success moment is not “visited every section.” It is: **the user leaves with one evidence-backed target and one achievable next action.**

## Experience principles

1. **One decision per view.** Each screen gets one primary question, one primary action, and at most two supporting actions.
2. **Show the next best action.** Replace the eleven equally weighted top tabs with four journey groups: Profile, Translate, Explore, Plan. Show the current substep locally.
3. **Progressive disclosure.** Default to the top three results and a short explanation. Put methodology, complete catalogs, and disclaimers behind clearly named disclosures without hiding safety-critical guidance.
4. **Short by default.** Target one viewport for the main task and no more than roughly 1.5 viewports for a normal mobile state. Persistent actions should remove the need to scroll back.
5. **Evidence over decoration.** Use space, typography, alignment, and dividers before adding panels, borders, or shadows.
6. **Confidence without false certainty.** Label a result as “score aligned,” “research lead,” or “gap to verify,” and always expose why.
7. **User agency.** Saving, applying extracted data, deleting documents, and changing goals are explicit and reversible.
8. **Engagement without manipulation.** Use meaningful progress, resumable work, and small wins—not streaks, urgency, confetti, or artificial scarcity.

## Information architecture

| Journey | Contains | Default landing question |
| --- | --- | --- |
| Profile | Starting point, service facts, document review | “What should MissionProof know about me?” |
| Translate | Translation, competency profile | “What does my experience mean outside the service?” |
| Explore | AF paths, civilian/federal roles, jobs/bases, apprenticeships, credentials, skill search | “What is the best path to research next?” |
| Plan | Saved targets, evidence gaps, action timeline | “What should I do next?” |

On desktop, use a compact journey header plus a local page title. On mobile, use the page title, “Step N of M,” and a bottom action bar; move the complete journey list into a sheet.

## Page anatomy

Each operational page should follow the same predictable structure:

1. Context: journey, title, one-sentence purpose.
2. Input or decision: the single thing the user needs to do now.
3. Result: top recommendation(s), source, confidence, and important caveat.
4. Primary action: save, review, or continue.
5. Optional depth: methods, full list, secondary filters, and education content.

## Readability and layout requirements

- Default body size: 16px desktop and mobile; supporting copy no smaller than 14px.
- Comfortable body line height: 1.5–1.65; line length: 45–70 characters.
- Minimum interactive target: 44×44 CSS pixels with visible keyboard focus.
- Keep no more than two font families and preserve the existing confident geometric display voice.
- Use a 4/8px spacing system. Prefer 24–32px section separation to a new card.
- Avoid cards inside cards. Lists use a single grouped surface and row dividers.
- The consent checkbox column should size to its control (about 24–32px), while the message owns the remaining width.
- Never depend on color alone for readiness, gaps, or selection.

## Key flows

### First session

Access → concise consent → choose a goal or skip → add one service fact manually or from a document → review suggestions → see one useful translation → save a target → receive one next action.

### Returning session

Resume card → “Continue reviewing 3 suggestions” or “Complete next action” → updated plan. Avoid returning the user to a general dashboard with equal-weight choices.

### Document-assisted setup

Choose document type → safety reminder → upload → processing status → review suggestions side by side with source snippets → accept/reject individually → summary of applied fields → delete or retain source according to the chosen policy.

## Content rules

- Lead with plain language; define acronyms on first use.
- Put “why this matched” adjacent to the match.
- Separate official facts, user-entered facts, inferred suggestions, and planning guidance visually and semantically.
- Avoid “qualified” unless an authoritative rule engine has complete current inputs. Prefer “score aligned” or “appears to meet the displayed threshold.”
- Replace long page-top explanations with a one-sentence summary and a “How this works” disclosure.
- Keep all warnings actionable: what not to upload, what to redact, and where to verify.

## Engagement measures

Primary: users who save a target and complete one action; time to first useful result; percentage of prefill suggestions accepted or corrected; successful return/resume rate.

Guardrails: abandonment by step and viewport, excessive backtracking, accidental consent, rejected extractions, reported sensitive-content incidents, accessibility defects, and recommendation reversals caused by stale data.

Do not optimize raw session duration. A short session that produces a credible next action is success.

## Acceptance criteria for the redesign

- A new user can state the current task and next action within five seconds.
- The core task is usable at 320px without horizontal scrolling.
- The complete journey remains discoverable but does not occupy the main mobile viewport.
- The top three results and primary action appear before optional educational material.
- Every extraction suggestion shows provenance, confidence, and accept/reject controls.
- Keyboard-only and screen-reader users can complete consent, profile setup, search, save, and plan tasks.
