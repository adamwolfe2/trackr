# Changelog

All notable changes to Trackr are documented here.

---

## February 2026

### 2026-02-25 — Integration Marketing Pages & Blog Expansion

**New Pages**
- **/chrome** — Chrome extension marketing page with feature breakdown, one-click research walkthrough, use cases, privacy policy note, and CTA. Linked from footer.
- **/slack** — Slack integration marketing page with slash command docs, renewal alert specs, 3-step setup guide, and pricing note. Linked from footer.
- **/partners** — Integrations hub page listing live integrations (Slack, Chrome) and in-development integrations (Notion), plus partner program types. Linked from footer as "Integrations."
- **74 blog posts** — Expanded to 74 posts adding: AI analytics tools, AI recruiting tools, AI customer support tools, AI SEO tools, AI content creation, CRM/sales comparisons (HubSpot vs Salesforce vs Pipedrive), support tool comparisons (Intercom vs Zendesk vs Freshdesk), design tool comparisons (Figma vs Sketch vs Adobe XD), and 12 operations/procurement how-to guides.

**SEO**
- Sitemap updated to include `/chrome`, `/slack`, `/partners`.
- Footer expanded with Chrome Extension, Slack Integration, and Integrations links.

---

### 2026-02-25 — GTM Content & SEO Infrastructure

**New Pages**
- **54 blog posts** — Expanded content library to 54 posts covering AI tool evaluation, SaaS stack management, RevOps tools, comparison guides, and cost reduction playbooks.
- **30 comparison pages** — Programmatic `/research/compare/[slug]` pages covering high-intent "X vs Y" searches: HubSpot vs Salesforce, Notion vs Confluence, Cursor vs GitHub Copilot, and 27 more.
- **5 ICP landing pages** — Role-specific landing pages at `/for/ops-teams`, `/for/revops`, `/for/founders`, `/for/engineering`, `/for/chiefs-of-staff`.
- **Lead magnet pages** — `/scorecard` (7-dimension template), `/spend-report` (2026 SaaS benchmark data), `/playbook` (AI-Native Ops Playbook, ~3,000 words).
- **Competitor displacement pages** — `/vs/g2`, `/vs/vendr`, `/vs/spreadsheets`, `/vs/notion`, `/vs/gartner` with feature comparison tables.

**SEO Infrastructure**
- Sitemap expanded to include all comparison, ICP, VS, and lead magnet pages.
- `SearchAction` added to WebSite JSON-LD for Google Sitelinks Searchbox eligibility.
- Fixed robots.txt — removed `/scorecard` and `/analytics` from disallow list (public pages were being blocked).
- Dashboard scorecard feature moved to `/settings/scorecard` to resolve route conflict with public marketing page.

**Onboarding**
- Post-onboarding redirect changed from `/tools` (empty state) to `/submit` (research form) — users reach Aha moment within 2 minutes of signup.
- Step 1 now shows a sample report preview with dimension score bars to set expectations before users complete setup.
- Step 3 scorecard copy clarified: "The recommended weights work well for most teams. You can always adjust from Settings later."

---



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

---

## November 2025

### 2025-11-25 — Feed, Notifications, and Team Features

**New Features**
- **AI News Feed** — Curated feed at `/feed` surfaces AI tool launches, category news, and product updates relevant to your stack. Powered by Tavily search with configurable topic channels.
- **Feed channel management** — Create custom channels around keywords, tools, or topics. Subscribe to community channels shared across workspaces.
- **In-app notifications** — Real-time notification bell with unread count for research completions, team activity, renewal alerts, and digest summaries.
- **Weekly email digest** — Automated weekly email summarizing new reports, stack changes, and upcoming renewals.
- **Renewal alerts** — Tools in the stack with renewal dates within 30 and 60 days trigger dashboard and email alerts.
- **Team workspace sharing** — Invite teammates via email. Role-based access: Admin and Member. Shared research reports, notes, and pain points.
- **Activity feed** — Dashboard Recent Activity log shows research completions, tool additions, and team member actions with timestamps.

**Improvements**
- Research queue at `/queue` shows live progress for in-flight research jobs with step-by-step status.
- Discover page at `/discover` surfaces trending tools from the community library with category filtering.

---

### 2025-11-10 — AI Features and Analytics

**New Features**
- **Ask Trackr AI** — Conversational research assistant at `/ask`. Answers questions about tools in your stack using a RAG pipeline over your research reports. Powered by GPT-4o with Neon pgvector for embeddings.
- **Analytics dashboard** — `/analytics` shows stack health over time: tools researched per month, average scores, score distribution, and top/bottom performers.
- **Tool comparison** — Side-by-side comparison at `/compare` for any two tools in your stack with dimension-by-dimension breakdown.
- **Kanban view** — Tools list supports Kanban board view organized by status: Evaluating, Active, Archived.
- **Bulk research** — Select multiple tools and trigger research on all of them with one click.

---

## October 2025

### 2025-10-20 — Scoring, Reports, and Recommendations

**New Features**
- **AI Nativeness Score** — Stack-level score (0–100) measuring the proportion of AI-native tools vs traditional software. Updated in real time as tools are added.
- **Score history and delta** — Tool detail page shows score trend over multiple research runs with delta indicators (↑0.8 since last run).
- **Recommendations engine** — Smart recommendations based on pain points, low-scoring tools, and stack gaps. Analyzes existing tools and suggests alternatives.
- **Report sharing** — Generate a public share link for any research report. Shared reports include a Trackr branding footer.
- **PDF export** — Download any research report as a formatted PDF. Available on Team and above.
- **Public research library** — Community-curated tool library at `/research` with 28+ pre-researched tools, ratings, and community votes.
- **Workflow templates** — Pre-built stack templates at `/research/templates` for common team configurations (RevOps stack, Engineering stack, etc.).

**Improvements**
- Research report quality significantly improved: deeper Reddit analysis, better pricing extraction, more nuanced competitive intel.
- Scorecard weights now customizable per workspace (Startup plan and above).

---

### 2025-10-05 — Billing, Subscriptions, and Referrals

**New Features**
- **Stripe billing integration** — Paid plans (Team $50/mo, Startup $149/mo, Enterprise $349/mo) with Stripe Checkout, customer portal, and webhook sync.
- **14-day free trial** — All paid plans start with a 14-day trial with full feature access. No credit card required.
- **Plan gating** — Feature access controlled by plan level. Graceful upgrade prompts on gated features.
- **Credit system** — Research credits per plan (3 free, 25 Team, 75 Startup, 200 Enterprise) with per-credit overage pricing.
- **Referral program** — Referral links generate 5 credits per successful signup. Referrals dashboard at `/referrals`.

---

## September 2025

### 2025-09-20 — Onboarding and Initial Public Launch

**New Features**
- **3-step onboarding** — Company setup → tool inventory selection → scorecard configuration. Draft state persisted in localStorage. Enter-key navigation between steps.
- **AI context generation** — Auto-fill company context from website URL using Firecrawl. Context used by research agents to tailor every report.
- **AI Nativeness preview** — Live preview of AI Nativeness Score during tool selection step of onboarding.
- **Tool catalog** — 100+ integrations in the tool picker with logo grid, category filtering, and custom tool entry.
- **Marketing site** — Homepage, pricing page, process page, about page, and blog with initial 34 posts.
- **Changelog** — Public changelog at `/changelog` documenting all feature releases.

**Initial Metrics**
- Research pipeline: average 90 seconds end-to-end.
- 7-dimension scorecard validated across 50+ tool categories.
- 34 SEO blog posts published at launch.

---
