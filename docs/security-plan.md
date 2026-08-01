# Security and privacy plan

## Position

Service evaluations and supporting records may contain personally identifiable information, operational details, medical information, identifiers, or controlled information. MissionProof must not assume every EPB/EPR is CUI, but it must obtain an authoritative data-classification determination before production ingestion. If the system processes CUI under a covered agreement, design and assess the boundary against [NIST SP 800-171 Rev. 3](https://csrc.nist.gov/pubs/sp/800/171/r3/final) and the applicable contract/authorization requirements. Use [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) as the broader control catalog.

This document is an engineering plan, not an authorization to process official records.

## Security invariants

1. No classified, medical, or operationally sensitive content is requested.
2. Uploads are untrusted until scanned and sanitized.
3. Untrusted text cannot call tools, select policies, or write profile data.
4. Every applied field is tied to an authenticated human decision and source provenance.
5. Raw content never appears in logs, analytics, traces, support tickets, or model telemetry.
6. Access is deny-by-default, owner-scoped, auditable, and time-bounded.
7. Users can see and exercise retention/deletion controls; backups have a documented expiry.

## Data classification

| Class | Examples | Default handling |
| --- | --- | --- |
| Public | Public occupation descriptions, published credential data | Normal integrity/version controls |
| Internal | Product configuration, non-user operational metrics | Authenticated workforce access |
| Sensitive PII | Name, rank, service dates, education, contact data | Encrypt, minimize, owner/admin scope, redact logs |
| High sensitivity / possible CUI | Evaluation narratives, IDs, operational context, controlled attachments | Quarantine, isolated processing, strict role/need-to-know, approved region/vendor, short retention |
| Prohibited | Classified data, health records not explicitly authorized, credentials/secrets | Block, warn, delete safely, incident workflow where required |

## Threat model and controls

| Threat | Primary controls | Verification |
| --- | --- | --- |
| Account takeover | OIDC/SAML, phishing-resistant MFA for privileged roles, short sessions, revocation, rate limits | Auth tests, session-revocation drill |
| Broken object authorization | Owner/tenant checks in domain service, opaque IDs, policy-based authorization | Cross-user integration tests |
| Malicious upload | Extension allowlist, MIME and file-signature checks, size/page limits, randomized names, storage outside webroot, quarantine, malware scan, optional CDR | EICAR and malformed corpus in isolated test environment |
| Prompt injection in a document | Treat document text as data, no tools/network in extraction context, structured-schema output, content/instruction detection, allowlisted model calls, human review | Adversarial document suite |
| Data leakage to logs/analytics | Central redaction, payload logging off, safe error codes, PII canaries | Log scans and DLP checks |
| Model/vendor misuse | Enterprise agreement, approved region, no-training commitment, retention review, managed identity/private endpoint where available | Vendor assessment and configuration evidence |
| Tampering/stale sources | SHA-256 document hashes, signed/versioned source records, extraction/model version, effective dates | Provenance contract tests |
| Excess retention | Purpose-bound TTL, deletion queue, legal-hold exception, backup expiry | Monthly deletion reconciliation |
| Insider access | least privilege, just-in-time elevation, dual control for bulk access/export, immutable audit | Quarterly access review |
| Availability abuse | quotas, bounded parsers, queue backpressure, timeouts, decompression limits | Load and zip-bomb tests |

The upload controls follow the [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) and [ASP.NET Core file upload guidance](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-10.0).

## Identity and authorization

- Use an approved identity provider through OpenID Connect; do not build password storage.
- Require MFA for administrators, support, and reviewers; prefer phishing-resistant methods.
- Roles: User, Support (metadata only), Security Auditor, Policy Administrator. Extraction workers use workload identity, not user tokens.
- Enforce record ownership in server-side policies; never trust tenant/user IDs submitted by the client.
- Privileged support access is time-limited, reason-coded, visible in audit, and excludes raw documents by default.

## Cryptography and secrets

- TLS 1.2+ in transit; encryption at rest for database, object store, queue, and backups.
- Separate keys by environment; prefer customer-managed keys when the authorization boundary requires them.
- Use managed workload identity and RBAC rather than embedded API keys. Azure Document Intelligence supports [managed identity](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/authentication/managed-identities?view=doc-intel-4.0.0) and [private network access](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/authentication/managed-identities-secured-access?view=doc-intel-4.0.0).
- Store secrets in an approved vault; rotate, inventory, and alert on anomalous use.

## AI-specific controls

Indirect prompt injection is a data-integrity and exfiltration risk; follow [OWASP prompt-injection defenses](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) and [RAG security guidance](https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html).

- OCR/extraction stage has no browser, email, shell, retrieval, or profile-write tool.
- System instructions and document text occupy separate, typed channels in the orchestration layer.
- Validate output against a closed JSON schema and enumerated field types; reject extra keys.
- Scan hidden Unicode, embedded objects, links, and instruction-like text; preserve a security flag for the reviewer.
- Never place raw service documents in a general-purpose vector store.
- Model-generated narrative is always labeled as a draft, with citations back to confirmed facts.
- Document each provider's training, abuse-monitoring, retention, and regional-processing terms; for Azure-hosted models, start with the current [data privacy documentation](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy) and validate the chosen configuration.

## Secure development lifecycle

- Pull requests: secret scan, dependency review, SAST, lint, unit/integration/UI tests, IaC policy checks.
- Release: signed artifacts, SBOM, provenance/attestation, protected `release` and `main` branches, two-person approval for security-sensitive changes.
- Runtime: WAF/rate limits, CSP, HSTS, secure cookies, antiforgery, egress allowlist for the worker, alerting on bulk reads/exports and policy changes.
- Quarterly: access review, dependency threat review, restore test, incident tabletop, deletion reconciliation.
- Annually and before material launch: independent penetration test and privacy/security assessment.

## Incident response

Define severity, on-call ownership, evidence preservation, containment, affected-user determination, legal/privacy notification decision, credential/key rotation, document deletion/lockdown, and post-incident action tracking. Maintain a one-click control to disable uploads and external model calls while leaving profile/plan access available.

## Launch gates

- Written data classification and system boundary approved.
- Threat model and data-flow diagram reviewed by security/privacy stakeholders.
- Provider and region assessment complete.
- Upload quarantine, scan, retention, and deletion demonstrated end-to-end.
- Authorization and cross-user isolation tests pass.
- No critical/high findings open; medium findings have owners and dates.
- User notice accurately describes storage, analysis, review, retention, deletion, and limitations.
