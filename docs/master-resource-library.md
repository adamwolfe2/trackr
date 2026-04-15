# Master Resource Library — AI Business Toolkit

Everything we've built, aggregated, and battle-tested across 43+ projects. This is the curriculum backbone for teaching people how to use AI tools to build, grow, and operate real businesses.

---

## Table of Contents

1. [Production SaaS Products](#1-production-saas-products)
2. [Reusable Templates & Starters](#2-reusable-templates--starters)
3. [AI Agent Framework & Skills](#3-ai-agent-framework--skills)
4. [Marketing Skills Library (42+ Skills)](#4-marketing-skills-library-42-skills)
5. [MCP Servers & Integrations](#5-mcp-servers--integrations)
6. [Playbooks & GTM Documents](#6-playbooks--gtm-documents)
7. [Email Sequences (Cold Outreach)](#7-email-sequences-cold-outreach)
8. [Community & Content Templates](#8-community--content-templates)
9. [Internal Tools & Utilities](#9-internal-tools--utilities)
10. [Tech Stack Reference](#10-tech-stack-reference)
11. [Real-Life Business Use Cases](#11-real-life-business-use-cases)
12. [Curriculum Outline](#12-curriculum-outline-for-ai-community)

---

## 1. Production SaaS Products

These are live, revenue-ready products — each one is a case study in building AI-native SaaS from zero.

### Trackr — AI Tool Research & Stack Intelligence
- **Repo**: https://github.com/adamwolfe2/trackr
- **Live**: https://trytrackr.com
- **What it does**: Drop any SaaS tool name in, AI researches it in 90 seconds, generates a 7-dimension scored evaluation. Maps your full software stack, tracks spend, flags renewals, generates board reports.
- **Stack**: Next.js 16, React 19, TypeScript, Drizzle ORM, Neon Postgres, Clerk, Stripe, Anthropic Claude, OpenAI, Firecrawl, Tavily, Perplexity, Upstash Redis, Slack API
- **Key patterns**: Credit-based usage metering, AI research pipeline (scrape -> search -> reason -> score), multi-tenant workspaces, feature gating by plan tier, managed service upsell ($299-$599/mo)
- **Business lesson**: How to build an AI pipeline that costs $0.14/run and charge $0.24-$0.40 per credit for 65% margins

### Flowline — No-Code VSL Funnel Builder
- **Repo**: https://github.com/adamwolfe2/flowline
- **Live**: https://getmyvsl.com
- **What it does**: Describe your business, AI asks clarifying questions, generates a complete quiz-to-calendar booking funnel with lead scoring and tier-based routing. No code required.
- **Stack**: Next.js 16, React 19, Drizzle ORM, Neon Postgres, Clerk, Stripe, OpenAI GPT-4o, Vercel Blob, Upstash Redis
- **Key patterns**: Multi-step AI generation wizard, quiz logic builder, lead scoring engine, calendar booking integration, white-label output
- **Business lesson**: How to productize a service (building funnels) into a self-serve SaaS with AI doing the heavy lifting

### AIMS Platform — AI Managing Services Marketplace
- **Repo**: https://github.com/adamwolfe2/aims-platform
- **What it does**: B2B marketplace for AI services. CRM, client portal, productized service offerings, autonomous fulfillment engine.
- **Stack**: Next.js 14, TypeScript, Tailwind, shadcn/ui, Clerk, Neon/Prisma, Stripe, Anthropic Claude
- **Key patterns**: Multi-tenant marketplace, service productization, client portal, CRM pipeline, AI-powered fulfillment
- **Business lesson**: How to build a services marketplace with AI automating delivery

### Hook Platform — AI Viral Content Engine
- **Repo**: https://github.com/adamwolfe2/hook-platform
- **What it does**: "Go viral on autopilot." Autonomous content generation, distribution, and optimization across platforms.
- **Stack**: Next.js 16, Prisma, Neon Postgres, Anthropic Claude + Google Gemini, NextAuth, Stripe, Radix UI
- **Key patterns**: Multi-model AI pipeline (Claude + Gemini), content scheduling, distribution automation, engagement optimization
- **Business lesson**: How to use multiple AI models in a single product for different strengths

### VendHub Toolkit — Operator Growth Platform
- **Repo**: https://github.com/adamwolfe2/vendtools (private)
- **What it does**: Tools for vending machine operators — inventory management, logistics, profitability tracking, route optimization.
- **Stack**: Next.js 16, React 19, Supabase, TipTap editor, Fabric.js canvas, Retell SDK (voice AI), Stripe, Google Maps
- **Key patterns**: Voice AI integration (Retell), canvas-based visual editor, Google Maps routing, real-time inventory
- **Business lesson**: How to build vertical SaaS for a specific operator niche — vending is a $50B industry with zero modern tooling

### Amex Portal — Credit Card Benefits Tracker
- **Repo**: https://github.com/adamwolfe2/amex-portal
- **What it does**: Track and maximize American Express Platinum & Gold card benefits, redemptions, and offers.
- **Stack**: Next.js 16, React 19, Drizzle ORM, Neon Postgres, Clerk, Stripe
- **Key patterns**: Benefits tracking, ROI calculation, offer aggregation, personal finance dashboards
- **Business lesson**: How to build a niche consumer product around an existing high-value audience (Amex cardholders)

### Cursive / OpenInfo — B2B Lead Intelligence
- **Repo**: https://github.com/adamwolfe2/openinfo-platform
- **Live**: https://meetcursive.com
- **What it does**: B2B intent lead intelligence. Identifies companies actively researching specific topics, enriches contact data, scores intent signals.
- **Stack**: Next.js 14, Supabase, Stripe, Inngest (async workflows)
- **Key patterns**: Intent signal detection, contact enrichment, lead scoring, async job processing with Inngest
- **Business lesson**: How to build a lead gen platform that generates its own distribution advantage

---

## 2. Reusable Templates & Starters

Clone these to kickstart new projects. Each is battle-tested across multiple live products.

### VSL Quiz Template
- **Repo**: https://github.com/adamwolfe2/vsl-quiz-template
- **What it does**: Production-ready quiz funnel template. Multi-step quiz -> lead scoring -> calendar booking. Drop in your copy and go.
- **Stack**: Next.js 15, TypeScript, Tailwind, Framer Motion, shadcn/ui
- **Use case**: Build a lead qualification funnel in hours instead of weeks

### Distribution Portal Template
- **Repo**: https://github.com/adamwolfe2/distribution-portal-template (private)
- **What it does**: White-label B2B wholesale distribution portal. Marketplace, marketing site, client portal, admin panel, supplier portal. Reverse-engineered from TBGC.
- **Key feature**: 15-phase autonomous AI build guide — hand it to Claude Code and it builds itself
- **Use case**: Launch a distribution marketplace for any vertical

### Wholesail / Portal Intake
- **Repo**: https://github.com/adamwolfe2/wholesail
- **What it does**: Intake wizard for distribution portal builds. Collect client info, generate proposal, book consultation.
- **Use case**: Productize your consulting process

---

## 3. AI Agent Framework & Skills

This is the meta-layer — the system that builds the systems. Won an Anthropic hackathon.

### Everything Claude Code
- **Repo**: https://github.com/adamwolfe2/everything-claude-code
- **What it does**: Complete production-grade Claude Code configuration. 10 specialized agents, 12 domain skills, 17 slash commands, 9 rule sets. Evolved over 10+ months of intensive daily use across 43+ projects.
- **Status**: Open source, community-contributed

#### Agents (10 specialized roles)
| Agent | Role | When to use |
|-------|------|-------------|
| `ceo` | Strategic orchestrator | Complex multi-domain objectives |
| `planner` | Implementation planning | Features, refactoring, risk assessment |
| `architect` | System design | Architectural decisions, scalability |
| `tdd-guide` | Test-driven development | New features, bug fixes (write tests first) |
| `code-reviewer` | Code quality | After writing any code |
| `security-reviewer` | Vulnerability analysis | Before commits, auth/payment code |
| `build-error-resolver` | Fix build failures | When TypeScript or build breaks |
| `e2e-runner` | End-to-end testing | Playwright, critical user flows |
| `refactor-cleaner` | Dead code removal | Maintenance, cleanup |
| `doc-updater` | Documentation sync | After changes, before PRs |

#### Skills (12 domain-specific capabilities)
| Skill | Domain |
|-------|--------|
| `coding-standards` | TypeScript/React/Node best practices |
| `backend-patterns` | API design, DB optimization, server-side |
| `frontend-patterns` | React, Next.js, state, performance |
| `security-review` | Auth, input validation, OWASP Top 10 |
| `tdd-workflow` | Red-green-refactor, 80%+ coverage |
| `verification-loop` | Multi-pass validation |
| `continuous-learning` | Pattern extraction from sessions |
| `strategic-compact` | Context window management |
| `eval-harness` | Evaluation framework |
| `clickhouse-io` | Analytics database patterns |
| `project-guidelines-example` | Project setup template |
| `catch-up` | Session resume and context reload |

#### Commands (17 slash commands)
`/tdd`, `/plan`, `/code-review`, `/e2e`, `/build-fix`, `/refactor-clean`, `/learn`, `/checkpoint`, `/verify`, `/eval`, `/orchestrate`, `/init`, `/setup-pm`, `/update-docs`, `/update-codemaps`, `/test-coverage`

#### Rules (9 always-enforced guidelines)
| Rule | Focus |
|------|-------|
| `security.md` | No hardcoded secrets, input validation, CSRF, XSS |
| `coding-style.md` | Immutability, small files, error handling |
| `testing.md` | 80% coverage, TDD workflow, test types |
| `git-workflow.md` | Conventional commits, PR process |
| `agents.md` | Agent orchestration patterns |
| `performance.md` | Model selection, context management |
| `hooks.md` | Pre/post tool use automation |
| `patterns.md` | API responses, custom hooks, repository pattern |
| `performance-audit.md` | 7-category audit checklist with fix priority |

### BMAD-METHOD
- **Repo**: https://github.com/adamwolfe2/bmad-method
- **What it does**: "Breakthrough Method of Agile AI-Driven Development." Universal framework for domain-specific AI expertise. Published npm package.
- **Use case**: Transform any domain into a structured AI agent system

---

## 4. Marketing Skills Library (42+ Skills)

A complete marketing department in agent form. Each skill is a standalone prompt that turns any AI coding tool into a marketing specialist.

### Repo: https://github.com/adamwolfe2/marketingskills
- **Status**: Open source, works with Claude Code, Cursor, Windsurf, OpenAI Codex

#### SEO & Content (8 skills)
| Skill | What it does |
|-------|-------------|
| `seo-audit` | Full technical + content SEO audit |
| `ai-seo` | AI-specific search optimization (AIO, SGE) |
| `site-architecture` | Information architecture for crawlability |
| `programmatic-seo` | Template-based page generation at scale |
| `schema-markup` | Structured data implementation |
| `technical-seo` | Core Web Vitals, crawl budget, indexing |
| `video-seo` | YouTube/video optimization |
| `content-strategy` | Editorial calendar, topic clusters |

#### Conversion Rate Optimization (7 skills)
| Skill | What it does |
|-------|-------------|
| `page-cro` | Landing page optimization |
| `signup-cro` | Registration flow optimization |
| `onboarding-cro` | First-run experience optimization |
| `form-cro` | Form completion optimization |
| `paywall-cro` | Upgrade/pricing page optimization |
| `popup-cro` | Exit intent, lead capture popups |

#### Content & Copy (5 skills)
| Skill | What it does |
|-------|-------------|
| `copywriting` | Conversion-focused copy |
| `copy-editing` | Tone, clarity, brand voice |
| `cold-email` | Cold outreach sequences |
| `email-sequence` | Nurture/drip email campaigns |
| `social-content` | Platform-specific social posts |

#### Paid & Measurement (4 skills)
| Skill | What it does |
|-------|-------------|
| `paid-ads` | Google/Meta ad campaign setup |
| `ad-creative` | Ad copy and creative briefs |
| `ab-test-setup` | Experiment design and tracking |
| `analytics-tracking` | GA4, PostHog, event setup |

#### Growth & Retention (5 skills)
| Skill | What it does |
|-------|-------------|
| `referral-program` | Viral loop design |
| `free-tool-strategy` | Lead gen via free tools |
| `churn-prevention` | Retention triggers and flows |
| `product-led-growth` | PLG motion design |

#### Sales & GTM (6 skills)
| Skill | What it does |
|-------|-------------|
| `revops` | Revenue operations alignment |
| `sales-enablement` | Battle cards, objection handling |
| `launch-strategy` | Product launch playbook |
| `pricing-strategy` | Pricing page optimization |
| `competitor-alternatives` | Alternative page generation |

#### Strategy (7 skills)
| Skill | What it does |
|-------|-------------|
| `marketing-ideas` | Brainstorm campaigns |
| `marketing-psychology` | Behavioral triggers |
| `demand-generation` | Pipeline creation |
| `community-led-growth` | Community building |
| `influencer-marketing` | Creator partnerships |
| `newsletter-growth` | Email list building |
| `product-marketing-context` | Positioning and messaging |

---

## 5. MCP Servers & Integrations

### GoHighLevel MCP Server
- **Repo**: https://github.com/adamwolfe2/ghl-mcp
- **What it does**: Model Context Protocol server for GoHighLevel CRM. Contact management, conversation search, form submissions, tag management.
- **Stack**: Python 3.12+, OAuth 2.0, GoHighLevel API v2
- **Use case**: Let AI agents manage your CRM directly — create contacts, search conversations, process form submissions

---

## 6. Playbooks & GTM Documents

These are the actual strategy documents we use. Located in the Trackr repo but applicable to any SaaS.

### GTM Plan
- **File**: `docs/gtm-plan.md`
- **Contents**: Unit economics ($0.14 COGS per AI operation), infrastructure costs, LTV/CAC targets, 5 detailed ICP profiles, Dream 100 distribution strategy, weekly execution plan, hiring roadmap, EBITDA projections

### Security Audit Playbook
- **File**: `SECURITY_AUDIT.md`
- **Contents**: 14-vulnerability assessment template, attack surface analysis (40 API endpoints, 89 routes), remediation tracking, accepted risk documentation

### Overnight Optimization Plan
- **File**: `OVERNIGHT-PLAN.md`
- **Contents**: 20-phase codebase optimization checklist covering type safety, code cleanup, error boundaries, mobile responsiveness, onboarding redesign, security hardening, database indexing, rate limiting, Zod validation

### Performance Audit Template
- **File**: (in everything-claude-code) `rules/performance-audit.md`
- **Contents**: 7-category performance audit checklist (cold start, database, bundle, rendering, caching, network, API), fix priority framework, proven patterns with before/after impact data

---

## 7. Email Sequences (Cold Outreach)

6 complete, ready-to-send cold email sequences. 5 emails each, timed over 14 days. Written for Trackr but the frameworks apply to any B2B SaaS.

| Sequence | Target ICP | File |
|----------|-----------|------|
| Ops Head v1 | Head of Operations at Series A-B | `docs/email-sequences/icp1-ops-head-version-a.md` |
| Ops Head v2 | Same ICP, hiring signal trigger | `docs/email-sequences/icp1-ops-head-version-b.md` |
| RevOps v1 | RevOps managers at 50-500 B2B SaaS | `docs/email-sequences/icp2-revops-version-a.md` |
| RevOps v2 | Same ICP, stack audit angle | `docs/email-sequences/icp2-revops-version-b.md` |
| Chief of Staff | CoS at VC-backed Seed-B | `docs/email-sequences/icp3-chief-of-staff.md` |
| IT/SaaS Ops | IT managers at regulated enterprises | `docs/email-sequences/icp4-it-ops.md` |
| Founders | CEOs at pre-seed to seed | `docs/email-sequences/icp5-founder.md` |

---

## 8. Community & Content Templates

### Partnership Copy Kit
- **File**: `docs/community/partnership-copy.md`
- **Contents**: Slack App Directory listing, Chrome Web Store listing, Notion integration outreach email, extension marketing page copy

### Community Post Templates
- **File**: `docs/community/community-post-templates.md`
- **Contents**: 5 value-first post templates for r/operations, r/SaaS, Ops Nation Slack, Pavilion Operations, and LinkedIn; includes posting guidelines and UTM tracking

### LinkedIn 30-Day Calendar
- **File**: `docs/linkedin/linkedin-30-day-calendar.md`
- **Contents**: 30 pre-written LinkedIn posts covering pain points, frameworks, stories, thought leadership, insights, and lead magnets; includes optimal posting days and engagement strategy

---

## 9. Internal Tools & Utilities

### CRM Reconciliation Audit
- **Repo**: https://github.com/adamwolfe2/crm-reconciliation-audit
- **What it does**: Cross-checks Close CRM won deals against Airtable client records. Catches clients who fell through the onboarding pipeline.
- **Use case**: Audit your sales-to-onboarding handoff

### Claude Code Setup
- **Location**: `/Users/adamwolfe/claude code setup/`
- **What it does**: One command to set up a full autonomous Claude Code workspace — agents, skills, hooks, commands, rules all configured.
- **Use case**: Onboard new team members or new machines in minutes

### OrgChart
- **Repo**: https://github.com/adamwolfe2/orgchart
- **What it does**: Upload CSV of employees, get hosted searchable org chart with RAG ("who handles X?"). No HRIS required.
- **Use case**: Quick org intelligence for companies without proper HR tooling

### Knowledge Base OS
- **Repo**: https://github.com/adamwolfe2/knowlegebaseos
- **What it does**: Multi-tenant knowledge management with AI document processing. Pinecone vector search, Google Cloud Storage.
- **Use case**: Build a searchable knowledge base from any document corpus

---

## 10. Tech Stack Reference

The proven stack we use across 35+ production projects:

### Core Framework
| Layer | Tool | Why |
|-------|------|-----|
| Framework | Next.js 16 (App Router) | Server components, streaming, edge |
| Language | TypeScript (strict) | Catches bugs at compile time |
| Styling | Tailwind CSS v4 | Utility-first, zero CSS files |
| Components | shadcn/ui + Radix | Accessible, composable, no lock-in |
| Animation | Framer Motion | Production-grade React animations |

### Data Layer
| Layer | Tool | Why |
|-------|------|-----|
| Database | Neon Postgres (serverless) | Scales to zero, branches for dev |
| ORM | Drizzle ORM | Type-safe, SQL-like, fast migrations |
| Cache | Upstash Redis | Serverless Redis for rate limiting |
| Vector DB | Pinecone | Semantic search, RAG |
| Storage | Vercel Blob | File uploads, static assets |

### Auth & Payments
| Layer | Tool | Why |
|-------|------|-----|
| Auth | Clerk | Drop-in auth, org management, webhooks |
| Payments | Stripe | Subscriptions, usage billing, checkout |
| Email | Resend | Transactional email, React templates |

### AI & LLMs
| Layer | Tool | Why |
|-------|------|-----|
| Primary LLM | Anthropic Claude (Sonnet/Opus) | Best reasoning, tool use, coding |
| Secondary LLM | OpenAI GPT-4o / GPT-4o-mini | Cost-effective for structured output |
| Reasoning | Perplexity (sonar) | Web-grounded reasoning |
| Web Search | Tavily | Semantic search API |
| Web Scraping | Firecrawl | Structured web scraping |
| Voice AI | Retell SDK | Real-time voice agents |
| AI SDK | Vercel AI SDK | Streaming, tool use, multi-provider |

### Infrastructure
| Layer | Tool | Why |
|-------|------|-----|
| Hosting | Vercel | Zero-config Next.js deployment |
| Errors | Sentry | Error tracking with source maps |
| Analytics | PostHog | Product analytics, feature flags |
| Jobs | Inngest | Async workflows, event-driven |
| Webhooks | Svix | Reliable webhook delivery |

---

## 11. Real-Life Business Use Cases

These are the actual problems we solved and the patterns that emerged. Each is a teachable module.

### Use Case 1: AI Research Pipeline (Trackr)
**Problem**: Evaluating a SaaS tool takes 3-8 hours of manual research.
**Solution**: Chain 4 AI services (scrape -> search -> reason -> score) into a 90-second pipeline.
**Cost**: $0.14 per run. Charge $0.24-$0.40 per credit.
**Pattern**: Multi-service AI pipeline with cost tracking and credit metering.

### Use Case 2: AI Content Generation at Scale (Hook)
**Problem**: Creating viral content consistently is expensive and unpredictable.
**Solution**: Use Claude for ideation + Gemini for variation + scheduling for distribution.
**Pattern**: Multi-model orchestration — different AI models for different strengths.

### Use Case 3: No-Code Product Builder (Flowline)
**Problem**: Building a sales funnel costs $2,000-$10,000 and takes 2-4 weeks.
**Solution**: AI interviews the user, generates the complete funnel (quiz, scoring, routing, booking).
**Pattern**: Conversational AI wizard that replaces a human service with a self-serve product.

### Use Case 4: Vertical SaaS for Underserved Markets (VendHub)
**Problem**: Vending operators use spreadsheets and paper to manage $50B+ industry.
**Solution**: Purpose-built operator toolkit with route planning, inventory, profitability tracking.
**Pattern**: Find a large industry with zero modern tooling. Build the obvious product.

### Use Case 5: Lead Intelligence (Cursive/OpenInfo)
**Problem**: Finding companies actively researching your topic is impossible without expensive intent data.
**Solution**: Build your own intent signals from public data + enrichment APIs.
**Pattern**: Intent-based lead scoring — detect buying signals before competitors.

### Use Case 6: AI-Powered CRM Automation (GHL MCP)
**Problem**: CRM data entry and management is the #1 time sink for sales teams.
**Solution**: MCP server that lets AI agents directly manage GoHighLevel CRM — create contacts, search, tag, process forms.
**Pattern**: Model Context Protocol as the bridge between AI agents and business tools.

### Use Case 7: Autonomous Development System (Everything Claude Code)
**Problem**: Building software still requires constant human oversight and context-switching.
**Solution**: 10 specialized AI agents with defined roles, 42 marketing skills, 17 commands, and hooks that enforce quality automatically.
**Pattern**: Agent hierarchy — CEO orchestrates, specialists execute, hooks enforce standards.

### Use Case 8: Cold Outreach at Scale (Email Sequences)
**Problem**: Writing personalized cold emails for 5+ ICPs is tedious and inconsistent.
**Solution**: AI-generated sequences tailored to each ICP's specific pain points, with A/B variants.
**Pattern**: ICP-specific messaging frameworks with signal-based triggers (hiring posts, funding rounds).

### Use Case 9: Community-Led Growth (LinkedIn + Community Posts)
**Problem**: Posting consistently on LinkedIn and communities takes hours per week.
**Solution**: 30-day pre-written calendar + community post templates with value-first framing.
**Pattern**: Content batching — generate 30 days of content in one session, schedule and forget.

### Use Case 10: Service Productization (AIMS)
**Problem**: Selling AI services is high-touch and doesn't scale.
**Solution**: Marketplace with productized tiers, client portals, and AI-powered fulfillment.
**Pattern**: Turn a service into a product by standardizing delivery and automating with AI.

---

## 12. Curriculum Outline for AI Community

Based on everything above, here's how to structure the teaching:

### Module 1: Foundation — Your AI Development Environment
- Setting up Claude Code with everything-claude-code
- Agent hierarchy and when to use each
- Rules, hooks, and automated quality enforcement
- Slash commands for common workflows

### Module 2: Building AI-Native SaaS from Zero
- The proven stack (Next.js + Clerk + Stripe + Neon + Drizzle)
- Database design with Drizzle ORM
- Authentication and multi-tenancy with Clerk
- Subscription billing with Stripe
- Using templates (VSL Quiz, Distribution Portal) as starting points

### Module 3: AI Integration Patterns
- Single-model vs. multi-model pipelines
- Structured output with Zod schemas
- Credit-based usage metering
- Cost tracking per AI operation
- Caching expensive AI calls (Redis, research-cache pattern)
- Streaming responses to users

### Module 4: Growth & Marketing with AI
- 42 marketing skills walkthrough
- Cold email sequence creation (ICP-specific)
- LinkedIn content calendar generation
- Community engagement templates
- Dream 100 methodology execution
- Lead gen with Cursive

### Module 5: Operations & Automation
- MCP servers for CRM automation
- CRM reconciliation audits
- Async job processing with Inngest
- Webhook handling patterns
- Cron jobs and background processing

### Module 6: Performance & Security
- 7-category performance audit checklist
- Security audit template (14-vulnerability framework)
- Database optimization (N+1 detection, indexing)
- Bundle optimization (lazy loading, Suspense boundaries)
- Rate limiting and abuse prevention

### Module 7: Go-to-Market Execution
- ICP identification framework
- Unit economics calculation (COGS, LTV, CAC)
- GTM weekly execution plan
- Dream 100 outreach strategy
- Partnership and integration marketing
- Self-serve vs. enterprise sales motion

### Module 8: Scaling & Operations
- Multi-tenant architecture patterns
- Feature gating by plan tier
- Managed service overlay ($299-$599/mo add-on)
- Hiring roadmap (SDR -> Marketing -> AE)
- EBITDA modeling at different MRR levels

---

## Quick Start: Clone & Fork Guide

To get started with any of these resources:

```bash
# The AI agent framework (agents, skills, commands, rules)
gh repo clone adamwolfe2/everything-claude-code

# Marketing skills library (42+ marketing agent skills)
gh repo clone adamwolfe2/marketingskills

# VSL quiz funnel template
gh repo clone adamwolfe2/vsl-quiz-template

# GoHighLevel CRM integration
gh repo clone adamwolfe2/ghl-mcp

# BMAD development methodology
gh repo clone adamwolfe2/bmad-method
```

For private repos, request access or fork the template structure.

---

## Repository Index (All 43+ Projects)

| Repo | Type | Public | Primary Use |
|------|------|--------|-------------|
| `trackr` | SaaS Product | Private | AI tool research & stack intelligence |
| `flowline` | SaaS Product | Private | No-code VSL funnel builder |
| `aims-platform` | SaaS Product | Private | AI services marketplace |
| `hook-platform` | SaaS Product | Private | AI viral content engine |
| `vendtools` | SaaS Product | Private | Vending operator toolkit |
| `amex-portal` | SaaS Product | Private | Credit card benefits tracker |
| `openinfo-platform` | SaaS Product | Private | B2B lead intelligence |
| `myslp` | Niche SaaS | Private | SLP practice management |
| `orgchart` | Niche SaaS | Private | Hosted org charts with RAG |
| `knowlegebaseos` | Niche SaaS | Private | AI knowledge management |
| `campus-gtm` | Niche SaaS | Private | Ambassador program platform |
| `vendcfo` | Niche SaaS | Private | Vending financial management |
| `amcollective` | Internal Tool | Private | Agency CRM & CEO dashboard |
| `everything-claude-code` | Framework | **Public** | AI agent configuration system |
| `marketingskills` | Framework | **Public** | 42+ marketing agent skills |
| `vsl-quiz-template` | Template | **Public** | Quiz funnel starter |
| `distribution-portal-template` | Template | Private | B2B marketplace template |
| `wholesail` | Template | Private | Portal intake wizard |
| `ghl-mcp` | Integration | **Public** | GoHighLevel MCP server |
| `bmad-method` | Framework | **Public** | AI development methodology |
| `crm-reconciliation-audit` | Utility | Private | CRM audit tool |
| `taxapp` | Utility | Private | Vending tax calculator |
| `pulse` | Experimental | Private | AI desktop companion |
| `intent-loop` | Experimental | Private | Shopify identity resolution |
| `cursive` | Platform | Private | Recursive learning LLM |
| `aims-site` | Marketing | Private | AIMS marketing site |
| `campusgtmsite` | Marketing | Private | CampusGTM marketing site |
| `charged-pinwheel` | Marketing | Private | Cursive marketing site |
| `superpower-mentors-vsl` | Client Work | Private | VSL funnel for client |
| `davidgwynnai` | Client Work | Private | AI governance website |
| `attributeOS` | Legacy | Private | Attribute management |
| `taskspace` | Legacy | Private | Task management |
| `flowcus` | Legacy | Private | Mindmap tool |

---

*Last updated: 2026-04-15*
*Total projects: 43+ | Public repos: 5 | Templates: 3 | Agent skills: 52+*
