# MissionProof proposal pack

This directory turns the current prototype and heuristic review into an implementation-ready product plan.

| Document | Decision it supports |
| --- | --- |
| [Product and interaction design](product-design.md) | What to simplify, preserve, and measure |
| [Architecture](architecture.md) | How the React client, .NET services, storage, and analysis pipeline fit together |
| [Security plan](security-plan.md) | How sensitive evidence and untrusted uploads are protected |
| [Document ingestion](document-ingestion.md) | How EPB/EPR/OPB/OPR and supporting documents become reviewable prefill suggestions |
| [Testing strategy](testing-strategy.md) | Which automated and manual checks gate release |
| [Six design directions](design-versions.md) | Which calm interface model to prototype next |
| [Repository sharing note](repo-sharing-note.md) | How to introduce the exploratory .NET copy to collaborators |

## Recommended sequence

1. Choose one visual direction and validate it with 5–8 representative users.
2. Implement the navigation shell, type scale, and document-review flow behind feature flags.
3. Build the document pipeline as a bounded pilot using synthetic or explicitly approved documents.
4. Complete the security classification and authorization path before accepting production service records.
5. Promote from `dev` to `release` only after the quality gates in the testing strategy pass.

## Non-negotiable product rule

Analysis proposes; the user decides. No extracted value changes a profile, plan, résumé, or external system until the user reviews the value, sees its source, and explicitly accepts it.
