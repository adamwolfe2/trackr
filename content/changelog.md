# Changelog

All notable changes to Trackr are documented here.

---

## February 2026

### 2026-02-20 — Public Tool Library

**New Features**
- `/research` — Browse all publicly published tool research reports. Each card shows the tool's overall score, summary, and top scorecard dimension.
- `/research/[slug]` — Full public research page per tool. Includes scorecard breakdown, pros/cons, features, pricing, competitors, integrations, and market intel.
- **Publish button** — Workspace owners can now publish any research report to the public library from the tool detail page.

**Improvements**
- Pending workspace invitations now visible in Workspace Settings with a Cancel button.
- Email retry logic added to all transactional emails (3 attempts, exponential backoff).
- Drip email state tracked in database — emails can be canceled when a user upgrades.

---

### 2026-02-19 — Scale Readiness

**New Features**
- **Invitation flow fix** — Invited users now automatically join the correct workspace on signup instead of creating a new empty one.
- **Email drip sequence** — New users receive a 3-email onboarding sequence (Day 1, Day 3, Day 7) scheduled via Resend.
- **GitHub Actions CI** — Automated lint, typecheck, and test on every push.

**Improvements**
- Clerk webhook now properly handles `user.created` with pending invitation lookup.
- Perplexity integration now shows a clear warning when API key is missing rather than silently failing.
- Extra research credits via Stripe Checkout (`checkout.session.completed` handler).

---

## January 2026

### 2026-01-28 — Research UX & Sharing

**New Features**
- **Shared reports** — Generate a public link for any research report via the share button. Recipients see a read-only view.
- **Sentiment badge** — Overall sentiment (Positive/Neutral/Negative) shown on research reports with confidence percentage.
- **Data source badges** — Reports now show which sources contributed to the analysis (G2, Capterra, Reddit, official site, etc.).
- **Research progress** — Live streaming progress log during active research runs.

**Improvements**
- FAQ section added to marketing homepage.
- Contact form at `/contact` with Resend integration.
- Empty state improvements throughout dashboard.

---

### 2026-01-21 — Billing & Subscriptions

**New Features**
- **Stripe billing** — Pro, Team, Startup, and Enterprise plans available via Stripe Checkout.
- **Trial warnings** — Banner shown in dashboard when trial period is ending.
- **Extra credits** — Purchase additional research credits without upgrading your plan ($2/credit).
- **Billing portal** — Manage subscription, payment method, and invoices from `/settings/billing`.

**Improvements**
- Plan limits enforced on tool submissions and workspace member invites.
- Upgrade prompts shown throughout dashboard when limits are approached.

---

### 2026-01-14 — SEO & Performance

**New Features**
- **Sitemap** — `/sitemap.xml` dynamically generated, covering all public routes, blog posts, and shared reports.
- **OpenGraph images** — Consistent OG metadata across all marketing pages.
- **Sticky navigation** — Marketing nav applies backdrop blur on scroll.

**Improvements**
- Blog posts now show estimated reading time.
- Related articles section at the bottom of each blog post.
- Tool detail page: competitive overview section with competitor favicon grid.

---

## December 2025

### 2025-12-20 — Tool Research Engine

**New Features**
- **7-step research pipeline** — Map site → Scrape pages → Review sites → Trust & reputation → Reddit deep dive → Competitive intel → AI synthesis.
- **Scorecard** — 7-dimension scoring (Features, Pricing Value, Ease of Use, Support, Integration, Scalability, Value for Money).
- **Perplexity deep analysis** — Optional competitive intelligence layer using Perplexity Sonar.
- **Firecrawl integration** — Full site mapping and page scraping.
- **Tavily integration** — Multi-source review search (G2, Capterra, TrustRadius, Reddit).

---

### 2025-12-10 — Core Platform Launch

**New Features**
- Workspace creation on signup with Clerk authentication.
- Tool submission at `/submit` — paste any URL to start research.
- Dashboard at `/tools` — view all researched tools with status and scores.
- Notes system — annotate tools with general notes, test results, and pricing updates.
- Software stack at `/stack` — track monthly SaaS spend with renewal alerts.
- Pain points at `/pain-points` — document team needs for proactive tool suggestions.
- Slack integration — post research completion notifications to a channel.
- Chrome extension API — research tools directly from the browser.
