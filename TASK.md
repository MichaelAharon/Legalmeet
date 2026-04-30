# LegalMeet — Execution Backlog (`TASK.md`)

Lightweight, working backlog for the LegalMeet project, derived from [`ROADMAP.md`](ROADMAP.md) v2.1.  
Use this file for day-to-day execution; treat `ROADMAP.md` as the canonical product and architecture spec.  
When it exists, see also [`architecture.md`](architecture.md) for detailed schemas and component trees.

---

## Immediate Next Actions

- [ ] **ARCH-01**: Produce `architecture.md` with canonical data model, component tree, and API contracts for Sprint 0 (see “Next Actions” in `ROADMAP.md`).
- [ ] **STORY-BOOT-01**: Create BMAD story files for `AUTH-01`, `PROJ-01`, and `MTG-01` as the first three Sprint 0 stories.
- [ ] **GAP-01**: Close Phase 0 gaps — wire `/guest/[token]` NDA sign mutation end-to-end; wire real Daily.co room creation in `POST /api/meetings/[id]/room` behind `USE_MOCK_SERVICES`; keep `/call/[meetingId]` transcript behavior aligned with mock vs real.
- [ ] **ENV-01**: Run full env audit against `.env.example` (Auth0, Supabase, Daily, Deepgram, encryption, app config, etc.), documenting required vs optional flags and where to obtain values.

---

## Sprint Backlog (Phases 0–2)

This section mirrors the “Sprint Sequence (Phases 0–2)” in [`ROADMAP.md`](ROADMAP.md), with each story as a checkbox.

### Sprint 0 — Phase 0 gap closure

Goal: Supabase wired for Projects + Meetings. Auth0 live in non-mock.

- [ ] **AUTH-01**: Auth0 middleware — protect all non-public routes.
- [ ] **AUTH-02**: Guest token route — `/guest/[token]` public, scoped.
- [ ] **AUTH-03**: `/meeting-link/[id]` public, no auth required.
- [ ] **AUTH-04**: Mock bypass — `NEXT_PUBLIC_USE_MOCK` skips Auth0 cleanly.
- [ ] **PROJ-01**: Projects CRUD — create, read, update, archive.
- [ ] **PROJ-02**: Sub-projects — nested under projects, CRUD.
- [ ] **MTG-01**: Create meeting — title, time, flags (NDA, recording, transcription).
- [ ] **MTG-02**: Participants — invite by email, host + guest roles.
- [ ] **MTG-03**: Meeting status machine — `scheduled → awaiting_signatures → ready → in_progress → completed / cancelled`.

Capacity (from roadmap): 20 pts.

### Sprint 1 — Guests + NDA Templates

Goal: Guest can sign NDA end-to-end. Templates CRUD live.

- [ ] **MTG-04**: Guest access tokens — generate, validate, scope to meeting.
- [ ] **MTG-05**: Guest landing flow — `/guest/[token]` NDA sign wired end-to-end.
- [ ] **MTG-06**: Meeting detail page — full status-driven UX.
- [ ] **TMPL-01**: Template CRUD — create, read, update, archive, set-default.
- [ ] **TMPL-02**: Template versioning — immutable versions, draft/published states.
- [ ] **TMPL-03**: Template variables — `{{party_name}}`, `{{date}}`, `{{company}}` auto-fill from meeting.
- [ ] **TMPL-04**: Template editor UX — rich text, variable picker, preview.

Capacity (from roadmap): 22 pts.  
See `EPIC-03` and `EPIC-04` in `ROADMAP.md` for full details.

### Sprint 2 — NDA Generation + Signing

Goal: Full NDA → sign → meeting gate → join flow working in production.

- [ ] **NDA-01**: Generate from description — Claude API call, returns NDA draft.
- [ ] **NDA-02**: Customize NDA content per meeting — fork from template, store delta.
- [ ] **NDA-03**: Meeting wizard — NDA step with template picker + editor + preview.
- [ ] **SIGN-01**: Signature capture UI — canvas draw or typed, produces SVG/PNG.
- [ ] **SIGN-02**: Sign NDA API — store signature data + hash + timestamp per participant.
- [ ] **SIGN-03**: “All signed” gate — meeting transitions to `ready` when all participants signed.
- [ ] **SIGN-04**: Verification token flow — `/meeting-link/[id]` unsigned participant → sign → join.

Capacity (from roadmap): 21 pts.  
See `EPIC-05` and `EPIC-06` in `ROADMAP.md` for full details.

---

## Later Phases Summary (3–7)

High-level, phase-level checklist for planning beyond Sprint 2. For full story tables and schemas, see the corresponding sections in [`ROADMAP.md`](ROADMAP.md).

### Phase 3 — Call + Recording + Transcription

- [ ] **EPIC-07**: Daily.co room creation wired live (`POST /api/meetings/[id]/room`), Prebuilt embed on `/call/[meetingId]`, and server-enforced join gate (`canJoin`).
- [ ] **EPIC-08**: Recording artifact model, encrypted storage in Supabase Storage with signed URL generation, and in-app recording player.
- [ ] **EPIC-09**: Deepgram transcription pipeline (submit recording, async job + webhook) and transcript viewer with structured segments.

### Phase 4 — Intelligence Layer (AI Summaries + Clause Risk)

- [ ] **EPIC-10**: Meeting summaries — Claude-backed summary pipeline from transcript to structured summary, decisions, and action items.
- [ ] **EPIC-11**: Clause risk analyzer — NDA content → risk report with missing clauses, risky clauses, suggestions, and overall risk score.
- [ ] **EPIC-12**: Document bundle — generate, download, and email PDF bundle (NDA + transcript + metadata + signatures).

### Phase 5 — Collaboration, Engagement & Operations

- [ ] **EPIC-13**: Notification system — in-app bell UI, email notifications via Resend, event triggers (NDA ready, signature received, all signed, recording ready, summary ready), and reminders.
- [ ] **EPIC-14**: Search + tags — cross-entity search, tag CRUD + filtering, and optional full-text search via Supabase `pg_trgm` or dedicated index.
- [ ] **EPIC-15**: Analytics dashboard — usage snapshots, NDA turnaround time, top templates, and meeting stats.

### Phase 6 — Monetization + External Integrations

- [ ] **EPIC-16**: Stripe billing — customer and subscription lifecycle, plan enforcement, billing portal, metered usage events, and trial/free tier.
- [ ] **EPIC-17**: Calendar sync — Google and Outlook OAuth, create/update/cancel calendar events tied to meetings.
- [ ] **EPIC-18**: Production hardening — RLS audit, rate limiting, webhook security, key rotation, and export/audit controls.

### Phase 7 — Enterprise Readiness

- [ ] **ENT-01–ENT-02**: Multi-tenant orgs and SSO (SAML / OIDC via Auth0 enterprise connections).
- [ ] **ENT-03–ENT-04**: Legal hold and retention policies — freeze artifacts under hold; auto-delete post-retention while respecting holds.
- [ ] **ENT-05–ENT-06**: DLP controls for recordings and SOC2-ready logging / event stream.
- [ ] **ENT-07–ENT-09**: SCIM provisioning, EU data residency, and expanded data export/portability beyond PDF bundles.
- [ ] **ENT-10**: Support & admin policy — read-only support view vs impersonation, with full audit of support access.

---

## Definitions of Done (anchors to ROADMAP)

For detailed “Definition of Done” criteria, see the corresponding sections in [`ROADMAP.md`](ROADMAP.md). This section highlights the most important checks per phase.

- **Phase 1 — Core App Navigation + Data Primitives**  
  Key DoD: Supabase replaces in-memory mocks for Projects, Meetings, and Participants; mock mode still works end-to-end; RLS policies on every table; audit log writes on every Meeting mutation; critical paths (guest token, sign mutation, RLS-sensitive routes) covered by automated tests.

- **Phase 2 — NDA Workflow (Core Differentiator)**  
  Key DoD: Template CRUD + versioning + editor shipped; NDA generation via Claude (mock + production paths); host and guests can sign end-to-end; meeting status auto-transitions to `ready` when all signed; audit log events for template lifecycle, NDA generation, and signing.

- **Phase 3 — Call + Recording + Transcription**  
  Key DoD: Daily.co room creation is live; recording webhook stores encrypted artifacts; Deepgram transcription jobs run and persist segments; transcript viewer and in-app recording player work with signed URLs; mock mode still available via service factory.

- **Phase 4 — Intelligence Layer**  
  Key DoD: Summaries and clause risk reports run via server-side API routes only; status and error states are surfaced (`generating / completed / error`); bundle PDF includes real NDA + transcript + metadata; Claude model version recorded per generation.

- **Phase 5 — Collaboration, Engagement & Operations**  
  Key DoD: Notifications fire on all key events; Resend email delivery live; meeting reminders scheduled; cross-entity search is performant; analytics dashboard populated from Supabase aggregates.

Refer back to `ROADMAP.md` for the complete, authoritative DoD lists.

---

## How to Use This File

- **Working backlog**: Use `TASK.md` as the working view of what the team is currently executing; use `ROADMAP.md` to understand *why* a story exists and its full context.
- **Checkboxes**: A story’s checkbox should only be checked when both the implementation and the relevant Definition of Done criteria in `ROADMAP.md` are satisfied.
- **Story IDs**: Keep using the `ID: short description` pattern (e.g. `AUTH-01`, `NDA-01`). When you add a new task that isn’t in `ROADMAP.md`, either (a) map it to an existing epic/story table there, or (b) add it to `ROADMAP.md` in the next planning pass.
- **Re-ordering per sprint**: It is safe to re-order or regroup tasks in `TASK.md` as sprint priorities change, but always treat `ROADMAP.md` as the north star for scope and long-term sequencing.
- **Branch and review workflow**: When implementing these tasks in code, prefer working on feature branches off `main` and merging only after review, so `main` remains a clean, deployable baseline aligned with the roadmap.

