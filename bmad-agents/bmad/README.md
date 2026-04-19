# BMAD Agent System
### LegalMeet — AI-Powered Legal Meeting Platform

**Version:** 2.0.0
**Stack:** React 18, Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Auth0, Daily.co, Deepgram, Claude API

---

## What This Is

A complete BMAD (Breakthrough Method for Agile AI-Driven Development) agent team, custom-built for the LegalMeet platform. Each file is a specialized Claude persona with deep context about your stack, codebase patterns, and legal tech domain.

Upload all files to your Claude.ai Project. Claude will adopt the right persona based on what you ask.

---

## Your Agent Team

| File | Agent | When to Use |
|------|-------|-------------|
| `00-orchestrator.md` | Master Orchestrator | Project state, routing, phase tracking |
| `01-analyst.md` | Business Analyst | New feature discovery, legal workflow scoping |
| `02-pm.md` | Product Manager | PRD creation, user stories, requirements |
| `03-architect.md` | Solutions Architect | Data models, API design, system design |
| `04-scrum-master.md` | Scrum Master | Story files, sprint planning, task breakdown |
| `05-developer.md` | Senior Developer | Implementation, components, API routes, services |
| `06-qa.md` | QA Engineer | Review, testing, compliance checks, bug reports |
| `07-legal-ops-strategist.md` | Legal Ops Strategist | Legal workflows, compliance, law firm GTM, buyer personas |

---

## How to Use

### Activate an agent
Tell Claude which agent to load:

```
"Load the Analyst — I want to explore adding AI meeting summaries"
"Switch to Architect — let's design the calendar sync data model"
"You are the Developer — implement this story"
"Load QA — review this NDA signing implementation"
```

### Run the full workflow
```
1. ANALYST         → "Let's do discovery on [feature]"
2. PM              → "Turn the brief into a PRD"
3. ARCHITECT       → "Design the architecture for this PRD"
4. SM              → "Break this into stories"
5. DEVELOPER       → "Implement story [ID]"
6. QA              → "Review the implementation"
7. SHIP            → Update story status to Done
```

### Ask the Orchestrator
```
"What phase are we in?"
"What agent should I be using?"
"What's the next story?"
"Give me a project status update"
```

---

## Document Structure

After running the workflow, your project should have:

```
docs/
├── project-brief.md        ← Analyst output
├── prd.md                  ← PM output
├── architecture.md         ← Architect output
└── stories/
    ├── NDA-01-[name].md    ← SM output (one per feature)
    ├── MTG-01-[name].md
    └── ...
```

---

## Quick Starts

### "I have a new feature idea"
→ Load Analyst → run discovery interview → get project-brief.md

### "I want to build [module]"
→ Load PM → produce PRD → load Architect → produce architecture → load SM → create stories → load Developer → implement

### "I need to plan legal ops strategy"
→ Load Legal Ops Strategist → define workflows, compliance, buyer personas

### "Review my code before I ship"
→ Load QA → paste implementation → get QA report

---

## Platform Modules Status

| # | Module | Status |
|---|--------|--------|
| 1 | Meeting Scheduling & Management | Shipped (mock) |
| 2 | NDA Templates & AI Generation | Shipped (mock) |
| 3 | NDA Digital Signing Flow | Shipped (mock) |
| 4 | Video Conferencing (Daily.co) | Shipped (mock) |
| 5 | Live Transcription (Deepgram) | Interface only |
| 6 | PDF Generation & Document Bundles | Interface only |
| 7 | AI Meeting Summaries & Action Items | — |
| 8 | Calendar Integration (Google/Outlook) | — |
| 9 | Client Portal / Guest Access | — |
| 10 | Document Versioning & Redlining | — |
| 11 | Notification System | — |
| 12 | AI Clause Risk Analyzer | — |
| 13 | Analytics Dashboard | — |
| 14 | RBAC & Multi-Tenant Security | — |
| 15 | Billing & Subscriptions (Stripe) | — |

Update this table as modules ship.
