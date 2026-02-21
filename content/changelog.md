# Changelog

All notable changes to Trackr are documented here.

---

## February 2026

### 2026-02-20 — Research Scheduling, CSV Exports, and UX Polish

**New Features**
- **Scheduled auto-research** — Set per-tool research intervals (weekly, bi-weekly, or monthly) directly from the tool detail page. Trackr automatically re-researches tools on schedule and advances the next run date. Available on Team, Startup, and Enterprise plans.
- **CSV export for stack and pain points** — Download your full software stack inventory or all pain points as a CSV file directly from the list views.
- **Shareable compare links** — The tool comparison page now has a "Copy Link" button that copies a URL with both tool IDs pre-selected for easy sharing with teammates.
- **Chat persistence** — Ask Trackr conversations now persist across page refreshes via localStorage. A "New Chat" button lets you clear the history and start fresh.
- **Referrals credits earned stat** — The referrals page now shows a "Credits Earned" stat card (5 credits per signup) alongside clicks and signups.
- **Team activity attribution** — The dashboard Recent Activity feed now shows which team member triggered each research job.
- **Upcoming Scheduled Research widget** — A new dashboard widget shows tools due for auto-research within the next 7 days, with "Due now" badges for overdue tools.
- **Schedule badge on tool cards** — Kanban board cards now display a clock icon and interval label for tools with auto-research configured.

**Bug Fixes**
- **Build failure fixed** — Removed dead shadcn `toast.tsx` / `toaster.tsx` / `use-toast.ts` stubs that imported `@radix-ui/react-toast` (never in package.json), which was blocking all Vercel deployments.
- **Referral link toast** — Generating a referral link now shows a success toast instead of silently revalidating.
- **Billing error feedback** — Upgrade button now forwards the actual server error message instead of swallowing it.
- **Onboarding redirect** — Missing-workspace state in the advertise/create flow now redirects to onboarding instead of showing a bare error div.

**Tests**
- 754 tests, all passing (+5 schedule action tests).

---

### 2026-02-20 — Deep Security Audit Rounds 8-11

**Security**
- **XSS prevention in blog renderer** — Custom markdown-to-HTML renderer now escapes HTML before applying inline formatting regex. Link URLs validated to block `javascript:` and `data:` protocol injection. Inline code blocks processed first to prevent content from being re-processed by bold/italic regex.
- **HTML injection in digest emails** — Workspace names and tool names are now HTML-escaped before being embedded in weekly digest email templates. Previously an attacker-controlled workspace name like `<script>` would have been included verbatim.
- **SSRF in Slack research command** — `/trackr research <url>` now blocks requests to private IP ranges (10.x, 192.168.x, 172.16–31.x, 127.x, ::1) and `.local`/`.internal` hostnames to prevent server-side request forgery via the Slack integration.
- **Invoice access control** — Invoice PDF generation now requires the ad campaign to be in `active` or `completed` status. Draft and paused campaigns can no longer produce invoices.
- **Rate limiting on report sharing** — Share token generation is now rate-limited to 10 requests per minute per user.
- **Rate limiter memory cap** — In-memory rate limiter now hard-caps at 50,000 entries to prevent unbounded memory growth under sustained traffic.

**Bug Fixes**
- **UUID validation expanded** — `deleteSoftwareSpend`, `updateSoftwareSpendStatus`, `updateSoftwareSpendDetails`, and `cancelInvitation` now validate that the ID parameter is a valid UUID before executing any database queries.
- **Null safety in notifications** — `toolSuggestions.reason` could theoretically be null; now guarded with optional chaining before `.slice()`.
- **Stripe ad rollback** — If Stripe checkout session creation fails after an ad record is inserted, the orphaned draft ad record is now cleaned up automatically.
- **Production error logging** — All API route `catch` blocks that were previously gated behind `NODE_ENV === "development"` now always log errors. Fixes invisible failures in production for: extension/context, extension/check, cron/recover-stuck-jobs, cron/feed, cron/auto-retry-failed, and search.

**Tests**
- 749 tests, all passing (+4 invoice status, +3 spend UUID, +2 workspace UUID, +1 pain-point UUID).

---

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
