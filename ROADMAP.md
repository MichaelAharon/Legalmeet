# LegalMeet — Product Roadmap
**Version:** 2.1 (BMAD-Upgraded)  
**Method:** BMAD Orchestrator · Discovery → Planning → Architecture → Sprint Planning  
**Last Updated:** April 2026  
**Status:** Approved for Development  

**v2.1 supplement:** Compliance and data-processing scope; subprocessors map; retention vs legal hold; Phase 6 goal clarified (core data on Supabase from Phase 1+); testing and observability NFRs; enterprise export/support backlog.

---

## BMAD Project State

```
CURRENT PHASE:     Planning → Architecture handoff
PLATFORM:          LegalMeet — Governed Meeting OS
CORE WORKFLOW:     Protect → Convene → Preserve → Operationalize
ICP:               VC / Investors · Law Firms · Corp BD & Sales · Founders
STACK:             Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui
                   Supabase · Auth0 · Daily.co · Deepgram · Anthropic · Resend
MOCK STRATEGY:     USE_MOCK_SERVICES / NEXT_PUBLIC_USE_MOCK toggle (maintained throughout)
LAST ARTIFACT:     ROADMAP.md v2.1 (repo root)
NEXT ACTION:       Architecture.md → Sprint 0 stories
OPEN BLOCKERS:     Daily.co room creation API not wired in join route (mock stub only)
                   /guest/[token] NDA sign flow is a UI stub (no mutation hooked)
                   Deepgram hooked to /call but live transcript is simulated on timer
```

---

## Architecture Layers (Canonical)

```
Layer 4 — AI Intelligence       (Claude API — summaries, clause risk, Q&A)
Layer 3 — Workflow Automation   (State machine — meeting lifecycle + notifications)
Layer 2 — Interaction Capture   (Daily.co video · Deepgram transcript · recording pipeline)
Layer 1 — Governed Data Model   (Supabase Postgres — meetings, NDAs, signatures, audit log)
```

**The platform spine:**  
`Project → Meeting → NDA (generate · sign · verify) → Call (room · record · transcribe) → Artifacts (bundle · summary · risk)`

---

## Guiding Principles

| Principle | Implementation |
|-----------|---------------|
| **Mock-first, production-seamed** | `USE_MOCK_SERVICES` / `NEXT_PUBLIC_USE_MOCK` maintained at every integration boundary. Every new service gets a mock factory before a live client. |
| **Security by default** | Encryption at rest for recordings. Signature hashes + verification tokens. Auth0-protected routes. Supabase RLS on every new table from Phase 1. |
| **Meeting is the atomic unit** | Every feature — NDA, recording, transcript, summary, bundle — is owned by a Meeting. No orphaned documents. |
| **Audit trail is non-negotiable** | Every mutation on a Meeting or NDA (creation, edit, signature, status change) writes an audit log event. Implemented from Phase 1, not bolted on later. |
| **ICP-aware UX** | VC speed (fast-spin, templated NDA), Law Firm compliance (template governance, version history), Corp BD (lightweight habit, mobile-ready), Founder (personal deal desk). |
| **Responsive web first** | Mobile-ready means responsive layouts and touch-friendly flows in the browser through Phase 5. Native apps and PWA/offline are out of scope unless ICP research elevates them. |

---

## Compliance, Privacy & Data Processing

Cross-cutting requirements for a legal product. Jurisdiction and counsel review are customer responsibilities; the product should support **documented** flows and subprocessors.

### Consent and sensitive capture

| Area | Direction |
|------|-----------|
| **Recording & transcription** | Phase 3: host-visible controls and clear participant-facing disclosure before capture (copy and UX scoped to initial markets, e.g. US-first). Multi-party consent rules evolve with counsel input. |
| **Signatures & PII** | Guest emails, signature blobs, and audit rows are PII: minimize collection, secure storage, and align retention with org policy and Phase 7 legal hold. |
| **AI processing** | Claude usage for summaries and clause risk: no client API keys; data minimization where possible; model version logged per generation (Phase 4). |

### Retention vs legal hold

| Mechanism | Role |
|-----------|------|
| **Default retention** | Phase 5 analytics and Phase 7 **ENT-04** (retention policies) must not silently delete data under **legal hold** (ENT-03). Product rules: hold blocks delete/export-destructive jobs until released. |
| **Export / portability** | Phase 6 **HARD-05** and Phase 7 **ENT-09**: host or org export of projects, meetings metadata, and audit trails (CSV/JSON or bundled) for offboarding and compliance requests. |

### Subprocessors (illustrative)

Maintain a customer-facing list aligned with DPAs. Typical categories:

| Provider | Typical processing |
|----------|-------------------|
| **Supabase** | App data, Postgres, Storage, Auth linkage |
| **Auth0** | Authentication, session |
| **Daily.co** | Video, room metadata, recording events |
| **Deepgram** | Audio for transcription |
| **Anthropic (Claude)** | NDA/summary/risk text (server-side only) |
| **Resend** | Transactional email |
| **Stripe** | Billing (Phase 6) |

---

## ICP × Feature Priority Map

| ICP Segment | Primary Jobs-to-be-Done | Must-have by Phase |
|---|---|---|
| **VC / Investors** | Fast NDA spin-up, multi-party signing, deal artifact trail | Phase 1 + 2 |
| **Law Firms** | Template governance, version history, matter (project) org, audit export | Phase 2 + 5 |
| **Corp BD / Sales** | Lightweight NDA habit, calendar sync, CRM-ready bundles | Phase 2 + 5 |
| **Founders** | Personal deal desk, everything in one place, minimal friction | Phase 0 + 1 |

---

## Phase 0 — Baseline & Dev Loop ✅ (Ship-Ready)

**Goal:** Any developer can clone → run → demo the full workflow in mock mode within 15 minutes.

### Deliverables
- [x] Monorepo with Turbo + pnpm (`dev / build / lint / typecheck / test`)
- [x] `USE_MOCK_SERVICES` / `NEXT_PUBLIC_USE_MOCK` toggle, documented in `.env.example`
- [x] Mock middleware bypassing Auth0 in demo mode
- [x] Root `→ /meetings` redirect
- [x] Health check endpoint + request IDs + security headers
- [x] Service factory pattern: each integration has `createMockClient()` + `createRealClient()` paths

### Known Gaps (carry to Phase 1)
- `/guest/[token]` NDA sign button is a UI stub — no mutation wired
- `POST /api/meetings/[id]/room` creates a mock Daily URL — production Daily provisioning not wired
- `/call/[meetingId]` transcript is simulated via `setInterval`, not Deepgram

---

## Phase 1 — Core App Navigation + Data Primitives

**Goal:** Usable dashboard with Projects + Meetings full lifecycle. Supabase replaces in-memory mock for all core entities. Auth boundary enforced.

**ICP priority:** Founders (personal deal desk), VC (deal org)

### Epics

#### EPIC-01: Auth Boundary
| Story | Description | Points | Priority |
|---|---|---|---|
| AUTH-01 | Auth0 middleware — protect all non-public routes | 2 | P0 |
| AUTH-02 | Guest token route — `/guest/[token]` public, scoped | 2 | P0 |
| AUTH-03 | `/meeting-link/[id]` public, no auth required | 1 | P0 |
| AUTH-04 | Mock bypass — `NEXT_PUBLIC_USE_MOCK` skip Auth0 cleanly | 1 | P0 |

#### EPIC-02: Projects
| Story | Description | Points | Priority |
|---|---|---|---|
| PROJ-01 | Projects CRUD — create, read, update, archive | 3 | P0 |
| PROJ-02 | Sub-projects — nested under projects, CRUD | 2 | P0 |
| PROJ-03 | Project membership roles — owner / editor / viewer | 3 | P1 |
| PROJ-04 | Project dashboard tab — meetings + documents per project | 2 | P1 |

#### EPIC-03: Meetings Lifecycle
| Story | Description | Points | Priority |
|---|---|---|---|
| MTG-01 | Create meeting — title, time, flags (NDA, recording, transcription) | 3 | P0 |
| MTG-02 | Participants — invite by email, host + guest roles | 2 | P0 |
| MTG-03 | Meeting status machine — `scheduled → awaiting_signatures → ready → in_progress → completed / cancelled` | 3 | P0 |
| MTG-04 | Guest access tokens — generate, validate, scope to meeting | 3 | P0 |
| MTG-05 | Guest landing flow — `/guest/[token]` NDA sign wired end-to-end | 3 | P0 |
| MTG-06 | Meeting detail page — full status-driven UX | 2 | P1 |

### Data Model (Phase 1 tables, Supabase)

```sql
-- projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name text not null,
  description text,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- sub_projects
create table sub_projects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- meetings
create table meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  sub_project_id uuid references sub_projects(id),
  created_by uuid references auth.users not null,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  status text default 'scheduled' check (
    status in ('scheduled','awaiting_signatures','ready','in_progress','completed','cancelled')
  ),
  nda_required boolean default false,
  recording_enabled boolean default false,
  transcription_enabled boolean default false,
  host_signed_at timestamptz,
  invites_sent_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  room_name text,
  room_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- participants
create table participants (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  email text not null,
  display_name text,
  role text default 'guest' check (role in ('host', 'guest')),
  signed_at timestamptz,
  signature_hash text,
  guest_token text unique,
  token_expires_at timestamptz,
  created_at timestamptz default now()
);

-- audit_log (non-negotiable from Phase 1)
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,   -- 'meeting' | 'nda' | 'participant' | 'template'
  entity_id uuid not null,
  actor_id uuid references auth.users,
  actor_email text,
  event text not null,          -- 'created' | 'signed' | 'status_changed' | 'invited' | etc.
  metadata jsonb,
  created_at timestamptz default now()
);

-- RLS: all tables restricted to owner_id / created_by. Guest access via token validation only.
```

### Phase 1 Definition of Done
- [ ] All EPIC-01 through EPIC-03 stories shipped and QA-approved
- [ ] Supabase replaces in-memory mock for Projects + Meetings + Participants
- [ ] Mock mode still works end-to-end (`USE_MOCK_SERVICES=true`)
- [ ] RLS policies on every table
- [ ] Audit log writes on every Meeting mutation
- [ ] `/guest/[token]` NDA sign flow wired end-to-end (not a stub)
- [ ] Auth0 route protection validated in non-mock mode
- [ ] Schema changes applied via tracked Supabase migrations; staging path documented (local → staging → prod)
- [ ] Automated tests cover critical paths: guest token access, sign mutation, and RLS-sensitive API routes (minimum bar agreed in sprint planning)

---

## Phase 2 — NDA Workflow (Core Differentiator)

**Goal:** Full NDA lifecycle — template CRUD, generation, signature capture, verification, "all signed" meeting gate.

**ICP priority:** VC (speed, templated), Law Firm (governance, version history), Founder (lightweight habit)

### Epics

#### EPIC-04: NDA Templates
| Story | Description | Points | Priority |
|---|---|---|---|
| TMPL-01 | Template CRUD — create, read, update, archive, set-default | 3 | P0 |
| TMPL-02 | Template versioning — immutable versions, draft/published states | 3 | P1 |
| TMPL-03 | Template variables — `{{party_name}}`, `{{date}}`, `{{company}}` auto-fill from meeting | 2 | P0 |
| TMPL-04 | Template editor UX — rich text, variable picker, preview | 3 | P0 |

#### EPIC-05: NDA Generation
| Story | Description | Points | Priority |
|---|---|---|---|
| NDA-01 | Generate from description — Claude API call, returns NDA draft | 3 | P0 |
| NDA-02 | Customize NDA content per meeting — fork from template, store delta | 2 | P0 |
| NDA-03 | Meeting wizard — NDA step with template picker + editor + preview | 3 | P0 |

#### EPIC-06: Signing + Verification
| Story | Description | Points | Priority |
|---|---|---|---|
| SIGN-01 | Signature capture UI — canvas draw or typed, produces SVG/PNG | 3 | P0 |
| SIGN-02 | Sign NDA API — store signature data + hash + timestamp per participant | 3 | P0 |
| SIGN-03 | "All signed" gate — meeting transitions to `ready` when all participants signed | 2 | P0 |
| SIGN-04 | Verification token flow — `/meeting-link/[id]` unsigned participant → sign → join | 3 | P0 |
| SIGN-05 | Signature verification endpoint — validate hash against stored record | 2 | P1 |

### Data Model (Phase 2 additions)

```sql
-- nda_templates
create table nda_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name text not null,
  content text not null,
  variables text[],
  version integer default 1,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  is_default boolean default false,
  parent_template_id uuid references nda_templates(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- nda_instances (per meeting)
create table nda_instances (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  template_id uuid references nda_templates(id),
  customized_content text not null,
  generated_by text default 'template' check (generated_by in ('template', 'ai', 'custom')),
  all_signed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- alter participants — signature fields
alter table participants add column if not exists nda_instance_id uuid references nda_instances(id);
alter table participants add column if not exists signature_data text; -- base64 SVG/PNG
```

### Phase 2 Definition of Done
- [ ] Template CRUD + versioning + editor shipped
- [ ] NDA generation via Claude API (mock path + production path)
- [ ] Host signs in wizard — mutation fires, hash stored
- [ ] Guest signs on `/meeting-link/[id]` — end-to-end, not a stub
- [ ] Meeting status auto-transitions to `ready` when all signed
- [ ] Audit log: template created, template versioned, NDA generated, NDA signed (per participant)
- [ ] Template variables auto-populated from meeting context

---

## Phase 3 — Call + Recording + Transcription

**Goal:** Join the call inside the platform, store recording securely, generate structured transcript.

**ICP priority:** Law Firm (evidence trail), Corp BD (call record for CRM), VC (deal diligence artifact)

### Epics

#### EPIC-07: Video Room (Daily.co)
| Story | Description | Points | Priority |
|---|---|---|---|
| CALL-01 | `POST /api/meetings/[id]/room` — wire real Daily.co room creation | 3 | P0 |
| CALL-02 | Daily Prebuilt embed — `/call/[meetingId]` replace simulated UI | 5 | P0 |
| CALL-03 | Recording webhook handler — Daily fires event, store artifact ref | 3 | P0 |
| CALL-04 | Join gate — `canJoin` enforced server-side (not just client-side check) | 2 | P0 |

#### EPIC-08: Recording Storage
| Story | Description | Points | Priority |
|---|---|---|---|
| REC-01 | Recording artifact model — Supabase row + Supabase Storage bucket | 3 | P0 |
| REC-02 | Encrypted storage — `RECORDING_ENCRYPTION_KEY` applied, key management documented | 3 | P0 |
| REC-03 | Signed URL generation — time-limited download links | 2 | P1 |
| REC-04 | Recording player — in-app playback with transcript sync | 3 | P1 |

#### EPIC-09: Transcription (Deepgram)
| Story | Description | Points | Priority |
|---|---|---|---|
| TRANS-01 | Submit recording to Deepgram API — async job, callback webhook | 3 | P0 |
| TRANS-02 | Transcript data model — structured segments (speaker, start, end, text) | 2 | P0 |
| TRANS-03 | Transcript viewer — meeting detail page, speaker-diarized, timestamped | 3 | P1 |

### Data Model (Phase 3 additions)

```sql
-- recordings
create table recordings (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  storage_path text not null,       -- Supabase Storage object path
  storage_bucket text not null,
  duration_seconds integer,
  size_bytes bigint,
  encryption_key_id text,           -- reference to key management record
  deepgram_job_id text,
  transcription_status text default 'pending'
    check (transcription_status in ('pending','processing','completed','error')),
  daily_recording_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- transcript_segments
create table transcript_segments (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid references recordings(id) on delete cascade not null,
  meeting_id uuid references meetings(id) not null,
  speaker text,
  start_ms integer,
  end_ms integer,
  text text not null,
  confidence float,
  created_at timestamptz default now()
);
```

### Phase 3 Definition of Done
- [ ] Daily.co room creation wired (not mock) — room URL is real
- [ ] Recording webhook stores artifact in Supabase Storage + encrypted
- [ ] Deepgram transcription job kicks off post-recording, segments stored
- [ ] Transcript viewer renders speaker-diarized content
- [ ] In-app recording player with signed URL
- [ ] `canJoin` validated server-side, not just UI-layer
- [ ] Mock mode: Daily and Deepgram still mockable via service factory

---

## Phase 4 — Intelligence Layer (AI Summaries + Clause Risk)

**Goal:** Turn every meeting into action items and every NDA into risk signals.

**ICP priority:** VC (deal intelligence), Law Firm (clause risk = liability), Corp BD (action items for CRM)

### Epics

#### EPIC-10: Meeting Summaries
| Story | Description | Points | Priority |
|---|---|---|---|
| SUM-01 | Summary generation — Claude API, transcript → summary + decisions + action items | 3 | P0 |
| SUM-02 | Summary data model — `generating / completed / error` status, persist structured output | 2 | P0 |
| SUM-03 | Summary UI — meeting detail card, action items checklist, topics list | 2 | P1 |
| SUM-04 | Re-generate summary — host can trigger regeneration | 1 | P2 |

#### EPIC-11: Clause Risk Analyzer
| Story | Description | Points | Priority |
|---|---|---|---|
| RISK-01 | NDA clause analyzer — Claude API, NDA content → risks / missing clauses / suggestions | 3 | P0 |
| RISK-02 | Risk report model — risk level (low/medium/high/critical), flagged clauses, suggestions | 2 | P0 |
| RISK-03 | Risk report UI — NDA detail view, color-coded risk bands, clause-level highlights | 3 | P1 |
| RISK-04 | Risk score on meeting list — surface high-risk NDAs before signing | 2 | P1 |

#### EPIC-12: Document Bundle
| Story | Description | Points | Priority |
|---|---|---|---|
| BNDL-01 | Bundle generation — PDF: NDA + transcript + metadata + signatures | 3 | P1 |
| BNDL-02 | Bundle download — signed URL, time-limited, audit logged | 2 | P1 |
| BNDL-03 | Bundle email delivery — Resend, host-triggered | 2 | P2 |

### Claude API Contracts

```typescript
// Meeting Summary
system: `You are a legal-meeting assistant. Analyze the transcript and produce:
1. Executive summary (2-3 sentences)
2. Key decisions (bullet list)
3. Action items with implied owners
4. Topics covered
Return valid JSON matching the MeetingSummary schema.`

// Clause Risk Analyzer  
system: `You are a legal risk analyst. Analyze this NDA for:
1. Missing standard clauses (list)
2. Risky clauses with explanation
3. Suggestions per clause
4. Overall risk rating: low | medium | high | critical
Return valid JSON matching the ClauseRiskReport schema.`
```

### Data Model (Phase 4 additions)

```sql
-- meeting_summaries
create table meeting_summaries (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  status text default 'generating' check (status in ('generating','completed','error')),
  summary text,
  decisions jsonb,        -- [{ text, owner? }]
  action_items jsonb,     -- [{ text, owner?, due_date? }]
  topics text[],
  model_version text,
  generated_at timestamptz,
  created_at timestamptz default now()
);

-- nda_risk_reports
create table nda_risk_reports (
  id uuid primary key default gen_random_uuid(),
  nda_instance_id uuid references nda_instances(id) on delete cascade not null,
  meeting_id uuid references meetings(id) not null,
  overall_risk text check (overall_risk in ('low','medium','high','critical')),
  missing_clauses jsonb,   -- [{ name, description }]
  risky_clauses jsonb,     -- [{ text_excerpt, risk_level, explanation }]
  suggestions jsonb,       -- [{ clause, suggestion }]
  model_version text,
  generated_at timestamptz,
  created_at timestamptz default now()
);
```

### Phase 4 Definition of Done
- [ ] Summary generation triggers post-transcription-complete
- [ ] Clause risk analyzer triggers post-NDA-finalization (all signed)
- [ ] Both run as server-side API routes (never client-side Claude calls)
- [ ] Error states handled: `status='error'` + retry UI
- [ ] Bundle PDF generates with real content (NDA + transcript + metadata)
- [ ] Risk score visible on meeting list for host
- [ ] Claude model version recorded per generation (for reproducibility)

---

## Phase 5 — Collaboration, Engagement & Operations

**Goal:** Notifications, search, tags, and analytics. Make LegalMeet sticky and operationally complete.

**ICP priority:** Law Firm (matter-level analytics, search), Corp BD (pipeline hygiene, volume), VC (portfolio-level view)

### Epics

#### EPIC-13: Notifications
| Story | Description | Points | Priority |
|---|---|---|---|
| NOTIF-01 | In-app notification model + bell UI | 2 | P0 |
| NOTIF-02 | Email delivery — Resend, templated per event type | 3 | P0 |
| NOTIF-03 | Event triggers — NDA ready, signature received, all signed, recording ready, summary ready | 3 | P0 |
| NOTIF-04 | Meeting reminders — 24h + 1h before, email + in-app | 2 | P1 |
| NOTIF-05 | Notification preferences — per-user, per-event-type | 2 | P2 |

#### EPIC-14: Search + Tags
| Story | Description | Points | Priority |
|---|---|---|---|
| SRCH-01 | Cross-entity search — projects / meetings / templates by text | 3 | P1 |
| SRCH-02 | Tag CRUD — create, attach to any entity, color-coded | 2 | P1 |
| SRCH-03 | Tag filtering — filter meetings + documents by tag | 2 | P1 |
| SRCH-04 | Full-text search — Supabase `pg_trgm` or dedicated index | 3 | P2 |

#### EPIC-15: Analytics
| Story | Description | Points | Priority |
|---|---|---|---|
| ANLY-01 | Usage snapshots — meetings per period, NDAs signed, recordings stored | 2 | P1 |
| ANLY-02 | NDA turnaround time — time from invite → all signed, per meeting | 2 | P1 |
| ANLY-03 | Top templates — most-used templates, sign rate | 1 | P2 |
| ANLY-04 | Meeting stats — avg duration, participants, industries (from project tags) | 2 | P2 |

### Phase 5 Definition of Done
- [ ] In-app notifications fire on all 5 event types
- [ ] Resend email delivery live (not mock)
- [ ] Meeting reminders scheduled (cron or Supabase scheduled function)
- [ ] Cross-entity search returns relevant results < 300ms
- [ ] Analytics dashboard shows real data from Supabase aggregates

---

## Phase 6 — Monetization + External Integrations

**Goal:** Flip remaining **third-party integration** mocks to live providers (Stripe billing, Google/Outlook calendar, and any stragglers). Core app data and Auth0/Supabase paths are live from Phase 1+; this phase is the **commercial and calendar** production flip plus hardening.

**ICP priority:** All — this is the production SaaS flip.

### Epics

#### EPIC-16: Billing (Stripe)
| Story | Description | Points | Priority |
|---|---|---|---|
| BILL-01 | Stripe customer + subscription lifecycle | 3 | P0 |
| BILL-02 | Plan enforcement — meeting limit, storage limit, user limit | 3 | P0 |
| BILL-03 | Billing portal — self-serve upgrade/downgrade | 2 | P1 |
| BILL-04 | Metered usage events — meetings used, storage GB, AI generations | 3 | P1 |
| BILL-05 | Trial + free tier — 5 meetings/month, 1 user, no recording | 2 | P1 |

#### EPIC-17: Calendar Sync
| Story | Description | Points | Priority |
|---|---|---|---|
| CAL-01 | Google OAuth — request calendar scope, store refresh token | 2 | P0 |
| CAL-02 | Outlook OAuth — Microsoft Graph, store refresh token | 2 | P0 |
| CAL-03 | Create calendar event on meeting schedule | 2 | P1 |
| CAL-04 | Event sync — update/cancel meeting → update calendar event | 2 | P1 |

#### EPIC-18: Production Hardening
| Story | Description | Points | Priority |
|---|---|---|---|
| HARD-01 | RLS audit — all tables reviewed + policies tested | 3 | P0 |
| HARD-02 | Rate limiting — all API routes, per-user | 2 | P0 |
| HARD-03 | Webhook security — signature verification (Daily, Deepgram, Stripe) | 3 | P0 |
| HARD-04 | Key rotation procedure — documented + tested | 2 | P1 |
| HARD-05 | Export + audit controls — meeting bundle export, audit log CSV | 2 | P1 |

### Pricing Model (recommended)

| Plan | Price | Meetings/mo | Recording | AI Summaries | Users |
|------|-------|-------------|-----------|--------------|-------|
| **Starter** | Free | 5 | ✗ | ✗ | 1 |
| **Professional** | $49/mo | 50 | ✓ (5GB) | ✓ | 3 |
| **Business** | $149/mo | Unlimited | ✓ (50GB) | ✓ | 10 |
| **Enterprise** | Custom | Unlimited | ✓ (Custom) | ✓ | Unlimited |

---

## Phase 7 — Enterprise Readiness

**Goal:** Sell to law firms and financial institutions. SOC2-track. SCIM optional.

### Epics

| Story | Description | Points | Priority |
|---|---|---|---|
| ENT-01 | Multi-tenant orgs — org isolation, org-level billing | 5 | P0 |
| ENT-02 | SSO — SAML / OIDC via Auth0 enterprise connections | 5 | P0 |
| ENT-03 | Legal hold — freeze meeting artifacts from deletion | 3 | P1 |
| ENT-04 | Retention policies — auto-delete after N days, configurable | 2 | P1 |
| ENT-05 | DLP controls — restrict recording download by role | 2 | P1 |
| ENT-06 | SOC2-ready logging — structured access reviews + event stream | 3 | P1 |
| ENT-07 | SCIM provisioning (optional) — user lifecycle via IdP | 5 | P2 |
| ENT-08 | EU data residency — Supabase region selection, documented policy | 3 | P2 |
| ENT-09 | Data export / portability — host or org export of projects, meetings metadata, audit-friendly bundles beyond PDF | 2 | P2 |
| ENT-10 | Support & admin policy — read-only support view vs impersonation; audit every support access | 3 | P2 |

---

## Sprint Sequence (Phases 0–2)

```
Sprint 0  (2 weeks)  Phase 0 gap closure
  AUTH-01, AUTH-02, AUTH-03, AUTH-04
  PROJ-01, PROJ-02
  MTG-01, MTG-02, MTG-03
  Goal: Supabase wired for Projects + Meetings. Auth0 live in non-mock.
  Capacity: 20 pts

Sprint 1  (2 weeks)  Guests + NDA Templates
  MTG-04, MTG-05, MTG-06
  TMPL-01, TMPL-02, TMPL-03, TMPL-04
  Goal: Guest can sign NDA end-to-end. Templates CRUD live.
  Capacity: 22 pts

Sprint 2  (2 weeks)  NDA Generation + Signing
  NDA-01, NDA-02, NDA-03
  SIGN-01, SIGN-02, SIGN-03, SIGN-04
  Goal: Full NDA → sign → meeting gate → join flow working in production.
  Capacity: 21 pts
  Dependencies: Sprint 1 done (templates + guests)

Sprint 3  (2 weeks)  Call + Recording
  CALL-01, CALL-02, CALL-03, CALL-04
  REC-01, REC-02, REC-03
  Goal: Real Daily.co call. Recording stored + encrypted.
  Capacity: 21 pts
  Dependencies: Sprint 2 done (join gate wired)

Sprint 4  (2 weeks)  Transcription + Intelligence
  TRANS-01, TRANS-02, TRANS-03
  SUM-01, SUM-02, SUM-03
  RISK-01, RISK-02
  Goal: Transcript + AI summary + clause risk analysis live.
  Capacity: 20 pts
  Dependencies: Sprint 3 done (recording pipeline live)
```

---

## Open Architecture Decisions

| Decision | Options | Recommendation | Phase |
|---|---|---|---|
| PDF bundle generation | Puppeteer (server) · React PDF · WeasyPrint | Puppeteer via API route — server renders signed NDA template | Phase 4 |
| Recording encryption | KMS (AWS/GCP) · local key rotation | Start with env `RECORDING_ENCRYPTION_KEY`, document rotation procedure; move to KMS at enterprise | Phase 3 |
| Full-text search | Supabase `pg_trgm` · Typesense · Algolia | `pg_trgm` at Phase 5, evaluate Typesense at scale | Phase 5 |
| Calendar sync state | Supabase `calendar_syncs` table · direct API calls | Store OAuth tokens + event IDs in table; idempotent upsert | Phase 6 |
| Cron / reminders | Supabase scheduled functions · Vercel Cron · n8n | Supabase pg_cron for reminders (simple, no extra infra) | Phase 5 |

---

## Non-Functional Requirements (All Phases)

| Requirement | Target |
|---|---|
| API response time | < 500ms p95 for all non-AI routes |
| AI generation time | < 30s; show progress indicator; status polling pattern |
| Uptime | 99.5% (Phase 5+); 99% acceptable for Phase 0–4 |
| Recording encryption | AES-256 at rest from Phase 3 day 1 |
| Audit log latency | Write within same transaction as entity mutation |
| RLS | Every Supabase table has RLS enabled before any row is inserted |
| API key security | Zero client-side API keys. All AI + external calls server-side. |
| Mock parity | Every live integration has a mock path that returns realistic fixture data |
| Automated testing | Critical paths (auth boundary, guest flows, signing, webhooks when present) covered in CI; RLS regressions caught by integration tests where feasible |
| Observability | Structured application logging, error reporting (e.g. Sentry-class), and alerting on webhook or async job failures — escalate in scope through Phase 5 toward ENT-06 |
| Accessibility | Target WCAG 2.1 Level AA for core host and guest flows where feasible; prioritize signing, call join, and document review |

---

## Next Actions (Immediate)

1. **Architecture.md** — produce canonical data model, component tree, and API contract for Sprint 0 stories
2. **Story files** — `AUTH-01`, `PROJ-01`, `MTG-01` as first three BMAD story files
3. **Fix Phase 0 gaps** — wire `/guest/[token]` sign mutation, fix `/api/meetings/[id]/room` to call real Daily.co (behind `USE_MOCK_SERVICES` flag)
4. **Env audit** — validate every integration variable in `.env.example` (Auth0, Supabase, Daily, Deepgram, encryption, app config, etc.) with type, required/optional, and where to obtain values

---

*Built with BMAD · Discovery → Planning → Architecture → Sprint Planning*  
*Architect next: produce `architecture.md` with canonical schemas and component trees for Sprint 0*
