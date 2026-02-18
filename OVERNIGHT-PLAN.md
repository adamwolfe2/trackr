# Trackr: Overnight 20-Phase Optimization Plan
_Generated: 2026-02-18 | Status: IN PROGRESS_

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
- `components/marketing/` — Marketing site components (Offset style)
- `components/tools/` — Tool cards, research button, stream

## Critical Bugs Found
1. `app/api/research/route.ts` — Reads `req.json()` TWICE (fails on catch block)
2. `app/api/research/route.ts` — Uses status `"researched"` which is NOT in schema (valid: submitted|researching|active|testing|archived|failed)
3. `components/analytics-provider.tsx` — `console.log("Analytics initialized")` in production
4. `lib/actions/tools.ts` — `console.log("Tool submitted:", newTool.id)` in production
5. `lib/actions/research.ts` — `@ts-ignore` on workspace relation access (Drizzle 0.45.1 should support this)
6. `app/api/webhooks/stripe/route.ts` — `@ts-ignore` on Stripe subscription items type
7. `components/tools/research-button.tsx` — Uses old `useToast` hook instead of sonner
8. No rate limiting on `/api/research` or `/api/search`
9. `app/(dashboard)/tools/page.tsx` — Missing `ToolGrid` import

## 20-Phase Progress

### ✅ Phase 1: Global Type Safety Audit — TODO
- Remove all @ts-ignore in dashboard/layout.tsx, dashboard/page.tsx, research.ts, onboarding.ts, stripe webhook
- Fix stripe webhook subscription types properly
- Add proper TypeScript types for Drizzle `with` relations

### ✅ Phase 2: Unused Code Removal — TODO
- Remove unused `totalSpend` mock in dashboard/page.tsx
- Remove analytics-provider commented code
- Remove unused imports

### ✅ Phase 3: Error Boundary Implementation — TODO
- `app/(dashboard)/error.tsx` — EXISTS, needs Offset brand style
- Add `app/(dashboard)/tools/error.tsx`
- Add `app/(dashboard)/tools/[id]/error.tsx`

### ✅ Phase 4: Skeleton Loading States — TODO
- `app/(dashboard)/loading.tsx` — EXISTS, needs Offset brand style
- Create `app/(dashboard)/tools/loading.tsx`
- Create `app/(dashboard)/tools/[id]/loading.tsx`

### ✅ Phase 5: Console Log Purge — TODO
- Remove all console.log in production code

### ✅ Phase 6: Empty State Polish — TODO
- Tools page empty state with proper branded CTA
- Queue empty state
- Dashboard empty states

### ✅ Phase 7: Toast Standardization — TODO
- Switch `research-button.tsx` from useToast to sonner toast directly
- Switch root Toaster in layout to use `<Toaster />` from sonner
- Add sonner to root layout import

### ✅ Phase 8: Mobile Responsiveness — TODO
- Fix sidebar overflow on mobile (sidebar is `hidden md:flex` but no mobile nav)
- Add mobile nav drawer
- Fix tool grid on mobile

### ✅ Phase 9: First-Run Onboarding — TODO
- Onboarding page exists at `/app/onboarding/page.tsx`
- Style it to match Offset brand (currently using dark/zinc style)
- Add proper progress indicator

### ✅ Phase 10: 404 & 500 Pages — TODO
- `app/not-found.tsx` — EXISTS, needs Offset brand polish
- `app/error.tsx` — EXISTS, needs Offset brand polish

### ✅ Phase 11: Metadata & OpenGraph Audit — TODO
- Root layout has partial OG metadata but missing image
- Pricing page needs metadata
- Tool detail pages need dynamic metadata
- Blog needs metadata

### ✅ Phase 12: Structured Data (JSON-LD) — TODO
- Add SoftwareApplication schema to homepage
- Add Organization schema to homepage

### ✅ Phase 13: Sitemap & Robots.txt — TODO
- Create `app/sitemap.ts` — marketing pages only
- Create `app/robots.ts` — block /api/, /(dashboard)/

### ✅ Phase 14: Asset Optimization — TODO
- next.config.ts already has AVIF/WebP
- Add `loading="lazy"` to below-fold images if any
- Font loading already using `display: swap`

### ✅ Phase 15: Lighthouse Performance — TODO
- Add `preconnect` for external services in layout
- Remove `export const dynamic = "force-dynamic"` from pages that don't need it

### ✅ Phase 16: Stripe Webhook Hardening — TODO
- Fix @ts-ignore with proper Stripe types
- Add idempotency check (don't re-create subscription if already exists)
- Add error handling for each webhook event type

### ✅ Phase 17: Database Indexing — TODO
- Add index on `tools.workspaceId`
- Add index on `workspace_members.userId`
- Add index on `reports.toolId`
- Add index on `research_jobs.toolId`
- Add index on `subscriptions.workspaceId`

### ✅ Phase 18: Rate Limiting — TODO
- Add Upstash Redis rate limiting OR simple in-memory rate limiting
- Apply to `/api/research`, `/api/search`, `/api/chat`
- Check if `@upstash/ratelimit` is installed

### ✅ Phase 19: Form Validation — TODO
- Research action: validate toolId is UUID format
- Submit tool: validate URL format
- All Zod schemas strict

### ✅ Phase 20: Smoke Test Script — TODO
- Create `/scripts/smoke-test.sh`
- Test: Sign Up → Add Tool → View Report → Upgrade Plan

## Files To Edit (in priority order)
1. `app/api/research/route.ts` — Fix critical bugs
2. `app/(dashboard)/layout.tsx` — TypeScript fix
3. `app/(dashboard)/page.tsx` — TypeScript fix
4. `app/(dashboard)/error.tsx` — Offset brand
5. `app/(dashboard)/loading.tsx` — Offset brand skeleton
6. `app/not-found.tsx` — Offset brand
7. `app/error.tsx` — Offset brand
8. `app/layout.tsx` — Add Sonner, improve metadata
9. `components/analytics-provider.tsx` — Remove console.log
10. `lib/actions/tools.ts` — Remove console.log
11. `lib/actions/research.ts` — Remove console.log, fix @ts-ignore
12. `lib/db/schema.ts` — Add DB indices
13. `app/api/webhooks/stripe/route.ts` — Fix types, add idempotency
14. `components/tools/research-button.tsx` — Switch to sonner
15. `app/onboarding/page.tsx` — Offset brand polish
16. `components/layout/app-sidebar.tsx` — Fix Submit Tool link
17. `next.config.ts` — Any improvements

## Files To Create
1. `app/(dashboard)/tools/loading.tsx`
2. `app/(dashboard)/tools/[id]/loading.tsx`
3. `app/(dashboard)/tools/error.tsx`
4. `app/(dashboard)/tools/[id]/error.tsx`
5. `app/sitemap.ts`
6. `app/robots.ts`
7. `app/api/research/route.ts` — Fix version
8. `scripts/smoke-test.sh`
9. `lib/middleware/rate-limit.ts` — Rate limiting helper

## Marketing Site Redesign Inspiration (Wispr Flow)
Key patterns to implement on the homepage:
- **Hero**: Split layout — bold copy left, animated Trackr UI right (live research report being generated)
- **Animated stats**: "2 min" counter ticking down, like Wispr's "4x faster than typing"
- **Live demo section**: Interactive animated simulation of submitting a URL → agents scanning → report appearing
- **Product in context**: Show the actual Trackr dashboard (bento grid, tool detail report) as screenshot
- **Dark section**: Dark bg section like Wispr Flow's hero showing the product UI prominently
- **"Ask AI about Trackr"**: Social proof section with Ask ChatGPT / Ask Claude buttons
- **Scroll-triggered animations**: Framer Motion scroll-reveal for feature sections
- **SideSpark-style feature cards**: 01/02/03 numbered cards with product illustrations
- Implement with Framer Motion (already installed as dependency in package.json)

## marketingskills Repo
- Located at: https://github.com/coreyhaines31/marketingskills.git
- Clone to: /Users/adamwolfe/marketingskills
- Use for copy, frameworks, and agent skills

## Next Session Context
- Working directory: `/Users/adamwolfe/trackr`
- Branch: main
- Run `pnpm dev` to test
- Commit changes and push to GitHub
