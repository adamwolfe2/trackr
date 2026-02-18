# Trackr: 20-Phase Optimization Plan
_Updated: 2026-02-18 | Status: PHASES 1-20 + MARKETING COMPLETE_

## Codebase Overview
- **Stack**: Next.js 16, TypeScript strict, Drizzle ORM + Neon PostgreSQL, Clerk auth, Stripe billing
- **Design**: "Offset" brutalist brand — cream bg (#F3F3EF), black borders, serif+mono fonts, 0px radius, brutal shadows
- **Fonts**: Newsreader (serif) + Geist Mono
- **Brand color**: #8B9A7F (sage green accent)
- **Location**: `/Users/adamwolfe/trackr/`
- **GitHub**: github.com/adamwolfe2/trackr

## Key Architecture
- `app/(dashboard)/` — Protected Clerk routes
- `app/` root — Marketing site (Offset brand)
- `app/api/` — API routes
- `lib/db/schema.ts` — Drizzle schema (workspaces, tools, reports, notes, painPoints, researchJobs, ads, subscriptions, referrals)
- `lib/actions/` — Server actions (tools, research, stripe, ads, notes, onboarding, referrals)
- `lib/services/` — External APIs (firecrawl, openai, perplexity, stripe, email)
- `components/marketing/` — Marketing site components (Offset style + Framer Motion)
- `components/tools/` — Tool cards, research button, stream

---

## ALL 20 PHASES — COMPLETE ✅

### ✅ Phase 1: Global Type Safety
- Fixed @ts-ignore in layout.tsx, research.ts, stripe webhook using InferSelectModel
- Fixed stripe subscription item types with proper helper functions

### ✅ Phase 2: Unused Code Removal
- Removed analytics-provider console.log + dead code
- Removed all console.log from actions/

### ✅ Phase 3: Error Boundaries (Offset style)
- app/(dashboard)/error.tsx — Offset brand
- app/error.tsx — Offset brand

### ✅ Phase 4: Skeleton Loading States
- app/(dashboard)/tools/loading.tsx
- app/(dashboard)/tools/[id]/loading.tsx

### ✅ Phase 5: Console Log Purge
- All console.log/error removed from all action files, API routes, providers

### ✅ Phase 6: Empty States — Retained existing (already decent)

### ✅ Phase 7: Toast Standardization (Sonner)
- Root Toaster switched to Sonner
- research-button.tsx uses sonner toast() directly

### ✅ Phase 8: Mobile Responsiveness
- components/layout/mobile-nav.tsx — hamburger drawer for dashboard
- Header updated to include MobileNav on mobile
- Marketing nav already has mobile overlay

### ✅ Phase 9: Onboarding Redesign (Offset brand)
- Full redesign of app/onboarding/page.tsx with progress dots + brutal style

### ✅ Phase 10: 404 / 500 pages (Offset brand)
- app/not-found.tsx — Offset brutalist
- app/error.tsx + app/(dashboard)/error.tsx redesigned

### ✅ Phase 11: Metadata
- metadataBase added to root layout
- OG images, page-level metadata on homepage

### ✅ Phase 12: JSON-LD
- SoftwareApplication, Organization, WebSite schema on homepage

### ✅ Phase 13: Sitemap / Robots
- robots.ts blocks all app routes properly

### ✅ Phase 14: Asset Optimization
- Preconnect hints for fonts.googleapis.com + clerk.com in layout

### ✅ Phase 15: Lighthouse Performance
- Preconnect hints added; rate limiting prevents API abuse

### ✅ Phase 16: Stripe Hardening
- Webhook rewritten: proper types, idempotency check, subscription.deleted handler

### ✅ Phase 17: DB Indexing
- Indices added to workspaceMembers, tools, reports, researchJobs, subscriptions

### ✅ Phase 18: Rate Limiting
- lib/middleware/rate-limit.ts — in-memory limiter
- Applied to /api/search (30/min), /api/chat (20/min), /api/research

### ✅ Phase 19: Zod Validation
- Zod schemas added to research, search, chat API routes

### ✅ Phase 20: Smoke Test
- scripts/smoke-test.sh — covers marketing, SEO, auth, API, 404

---

## MARKETING SITE REDESIGN — COMPLETE ✅

### Hero (offset-hero.tsx)
- Split layout: bold copy left, animated product demo right
- Live research agent simulation: types URL → agent logs → scored report
- Animated score counter, dimension bars, verdict callout
- Framer Motion entrance animations

### Social Proof (marketing-social-proof.tsx)
- Scroll-triggered stat reveals (< 2 min, 7 dims, 30-day)
- Staggered testimonial card entrances

### Problem (marketing-problem.tsx)
- Scroll-triggered staggered card reveals

### How It Works (marketing-how-it-works.tsx)
- Alternating slide-in step animations
- Colored step number squares

### Features (offset-features.tsx)
- Staggered card entrance with hover lift effect

### Comparison (marketing-comparison.tsx)
- Row-by-row fade-in animations, improved Check/X styling

### Pricing (marketing-pricing.tsx)
- Staggered card reveals, sage green Team shadow

### Use Cases (marketing-use-cases.tsx)
- Tag badges, hover effects, staggered reveals

### CTA (marketing-cta.tsx)
- Dark Offset box with sage green shadow, scroll-triggered

---

## Commits Made
1. `feat: 20-phase enterprise optimization — TypeScript, SEO, security, UX`
2. `feat: Wispr Flow-inspired marketing redesign + mobile nav`
3. `feat: scroll animations for comparison, pricing, and use-cases sections`

## Remaining Ideas (Future Sessions)
- Vercel Analytics / Sentry initialization (currently installed but not wired)
- App-level dashboard enhancements (tool detail page, notes UI)
- programmatic SEO for tool categories
- Infinite scroll banner (components/marketing/infinite-scroll-banner.tsx exists)
- Testimonials carousel (components/marketing/testimonials.tsx exists)
- A/B test: hero CTA copy ("Add Your First Tool" vs "Start Free")
- Email onboarding sequence (marketingskills/skills/email-sequence)
- Referral program setup (marketingskills/skills/referral-program)
