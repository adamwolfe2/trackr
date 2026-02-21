# Changelog

All notable changes to Trackr are documented here.

---

## February 2026

### 2026-02-20 — Security Hardening & Bug Fixes

**Security**
- **SSRF protection expanded** — Private IP ranges (10.x, 192.168.x, 172.16–31.x, 127.x) now blocked in onboarding URL validator, RSS feed submissions, and tool preview actions. Prevents server-side request forgery attacks.
- **Webhook idempotency race condition fixed** — Stripe and Clerk webhooks now use atomic database insert (`INSERT...ON CONFLICT DO NOTHING`) to claim events, preventing duplicate processing if Stripe retries a webhook while the first delivery is still in-flight.
- **Rate limiting improved** — Authenticated search endpoint now rate-limits by user ID instead of IP address (IP is trivially spoofed via X-Forwarded-For).
- **Invite rate limiting** — Workspace owners are now limited to 20 pending invitations per hour to prevent email spam abuse.
- **Chrome Extension CORS hardened** — Extension API now validates origin against a strict `chrome-extension://[a-z0-9]{20,}` regex instead of a loose prefix check.

**Bug Fixes**
- **Delete with error recovery** — Stack/spend item deletion now shows a toast and restores the confirm state if the server action fails, instead of silently failing.
- **Notes error feedback** — Adding a note now shows a toast error if the action fails instead of swallowing the exception.
- **Slug race condition** — Concurrent `publishReport` calls can no longer generate duplicate public slugs; uniqueness check now runs inside the database transaction.
- **Discover page crash** — Tavily API errors on the Discover page no longer crash the entire server component; errors are caught and return an empty results array.
- **Suggested prompts** — Ask page suggested prompts are now disabled while a request is in flight to prevent duplicate submissions.
- **Compare page security** — Slug parameters are now allowlisted to `[a-z0-9-]+` before query, preventing path traversal in the public compare endpoint.

**TypeScript & Tests**
- Zero TypeScript errors (Next.js 16 `revalidateTag` API updated, loading page prop names fixed).
- 743 tests, all passing.

---

### 2026-02-20 — Referral Credits & Production Fix

**Bug Fixes**
- **Onboarding 500 error fixed** — A missing database migration was causing all new workspace creation to fail with a generic "An error occurred" message in production. Applied migration 0009 (adds `webhook_events`, `drip_emails`, `reports.is_public`, `tools.public_slug`, and workspace member unique index).
- **ensureWorkspace reliability** — Rewrote workspace creation to use `INSERT...onConflictDoNothing` instead of `db.transaction()`. More reliable with Neon HTTP driver and handles race conditions at signup correctly.

**New Features**
- **Referral credits** — Referring a new user now awards 5 research credits to your account automatically. Credits appear on the billing page and carry over month to month.

---

### 2026-02-20 — Reliability & Research Intelligence

**New Features**
- **Auto-retry failed research** — Research jobs that fail are automatically retried once after 5 minutes. Eliminates the most common user support request ("my research failed, what do I do?").
- **Our Process page** — `/process` shows the full 7-step research pipeline with animated demos at each stage. Maps site → scrape pages → review sites → trust signals → Reddit → competitive intel → AI synthesis.

**Improvements**
- **Invitation deduplication fix** — Inviting the same email address twice no longer creates duplicate invitation rows. The system now detects and reuses the existing active invite.
- **Perplexity visibility** — Missing `PERPLEXITY_API_KEY` now emits a visible warning in server logs and surfaces in the research progress stream, instead of silently skipping.
- **Research retry UX** — The "Retry Research" button on failed tool cards is now more prominent with clear troubleshooting guidance.

---

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
