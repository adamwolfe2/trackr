# Trackr — Business Snapshot & GTM Plan

## Executive Summary

**Thesis:** Every company with more than 10 employees is drowning in SaaS sprawl. The average mid-market team runs 80–120 software tools, spends $15k–50k/month on software, and has no systematic way to evaluate whether those tools are actually working. Trackr is the AI research and stack intelligence layer that gives operations, IT, and finance leaders a single place to evaluate, score, track, and govern their entire software stack — with AI doing the heavy lifting in minutes instead of weeks of manual research.

**Core product loop:**
> Add a tool → AI researches it in 90 seconds → 7-dimension scorecard appears → stack health score updates → procurement, renewal, and risk workflows unlock → leadership gets board-ready reports

The managed service tier ($299–$599/mo on top of subscription) is the highest-margin product in the stack and the easiest enterprise wedge.

---

## Unit Economics

### Cost Per Research Run (Real COGS)

| Service | Per Research Job |
|---|---|
| Firecrawl (scrape + map) | ~$0.025 |
| Tavily (2–3 searches) | ~$0.025 |
| Perplexity (sonar-reasoning) | ~$0.05 |
| Claude Sonnet (synthesis/ask) | ~$0.04 |
| OpenAI gpt-4o-mini (cost est.) | ~$0.002 |
| **Total COGS per research job** | **~$0.14** |

### Credit Pricing vs. Cost

| Plan | Your price/credit | Your cost/credit | Gross margin |
|---|---|---|---|
| Free/Team | $0.40 | $0.14 | **65%** |
| Startup | $0.32 | $0.14 | **56%** |
| Enterprise | $0.24 | $0.14 | **41%** |

Margin is healthy. The risk is heavy users on included credits — a Team plan customer who burns all 25 included credits/month costs ~$3.50 in API fees against $50 revenue. A Startup customer burning 75 credits costs ~$10.50 against $149. Also fine. Watch for free plan abuse (5 credits × $0.14 = $0.70 of free value — negligible).

### Infrastructure Fixed Costs (Estimated Monthly)

| Service | Est. Monthly |
|---|---|
| Vercel Pro | $20–$50 |
| Neon Postgres | $19–$69 |
| Clerk (MAUs) | $25–$100 |
| Upstash Redis | $10–$30 |
| Resend | $20 |
| Sentry | $26 |
| PostHog | Free–$50 |
| **Fixed baseline** | **~$120–$345/mo** |

**Break-even math:** You need roughly 3–7 paying Team plan customers to cover fixed infrastructure. Every customer above that is margin.

### Target Unit Economics at Scale

| Plan | MRR | API COGS | Gross Profit |
|---|---|---|---|
| Team ($50) | $50 | ~$3.50 | $46.50 (93%) |
| Startup ($149) | $149 | ~$10.50 | $138.50 (93%) |
| Enterprise ($349) | $349 | ~$28 | $321 (92%) |
| Managed Basic ($299 add-on) | $299 | ~$5 (human time TBD) | $294+ |

SaaS gross margin on this model is 90%+. Your biggest cost variable as you scale is human time for managed service.

### LTV Estimates (18-month avg. retention)

| Plan | LTV |
|---|---|
| Team | $900 |
| Startup | $2,682 |
| Enterprise | $6,282 |
| Managed Premium | $10,782 |

### Viable CAC Targets (3:1 LTV:CAC ratio)

| Plan | Max CAC |
|---|---|
| Team | $300 |
| Startup | $894 |
| Enterprise | $2,094 |

---

## EBITDA Snapshot

| MRR | COGS (API) | Fixed Infra | Team | EBITDA |
|---|---|---|---|---|
| $2,000 (40 Team users) | ~$140 | $250 | $0 | **$1,610 (80%)** |
| $10,000 (mix) | ~$700 | $400 | $1,500 (SDR) | **$7,400 (74%)** |
| $30,000 (mix) | ~$2,100 | $700 | $5,000 (SDR + marketing) | **$22,200 (74%)** |
| $100,000 (mix) | ~$7,000 | $1,500 | $20,000 (full team) | **$71,500 (71%)** |

---

## The 5 ICPs (Ranked by Revenue Leverage)

### ICP #1 — Head of Operations at a Funded Startup (30–150 people)
**Title:** Head of Operations, Chief of Staff, VP of Operations
**Company:** Series A/B startup, $5M–$50M raised, 30–150 employees
**Pain:** Managing 60–100+ tools with zero centralization. Someone just asked them to cut software spend by 20% and they don't even know what they're paying for. Renewals blindside them. No process for evaluating new tools — engineers just buy stuff.
**Why they buy Trackr:** Makes them look like a hero to the CEO. Board-ready stack health report in minutes. Renewal alerts stop late renewals. Procurement workflows give them control.
**Budget:** $149–$349/mo is a rounding error. They expense it without finance approval.
**Where to find them:** Slack communities (Ops Nation, Chief of Staff Network, Lenny's community), LinkedIn targeting "Head of Ops" + "Series A" or "Series B" filters, Y Combinator alumni communities.
**Avg. deal:** Startup or Enterprise plan, high likelihood of managed service upsell once they see value.

---

### ICP #2 — IT Director at a Mid-Market Company (150–1,000 employees)
**Title:** IT Director, IT Manager, CTO (small company)
**Company:** $10M–$100M revenue, 150–1,000 employees, not venture-backed
**Pain:** Shadow IT is out of control. Finance is asking for software audits. They just paid for a Gartner license to evaluate tools and it was useless. Evaluating a new tool takes 3 weeks of vendor calls.
**Why they buy Trackr:** Research automation saves 10+ hours per tool evaluation. Risk monitoring catches security issues before they become incidents. The scorecard system gives defensible, objective data for "why we chose this tool."
**Budget:** $349/mo Enterprise is trivial against the alternative (consulting, Gartner, internal time).
**Where to find them:** LinkedIn (IT Director + company size filters), IT Slack communities, r/sysadmin, r/ITManagers.
**Avg. deal:** Enterprise plan + managed service. Higher ACV, lower churn, longer sales cycle (~2 weeks).

---

### ICP #3 — CFO or Finance Lead Who Controls SaaS Spend (50–300 employees)
**Title:** CFO, VP Finance, Controller, Finance Manager
**Company:** Any vertical, 50–300 employees, actively trying to cut burn or optimize spend
**Pain:** Paying $50k–$200k/year in software they can't fully see or justify. They know they have zombie subscriptions. They can't get engineers or ops to give them a real audit. They want ROI data on software decisions.
**Why they buy Trackr:** The AI Nativeness Score and spend tracking give them exactly the CFO-friendly dashboard they'd otherwise commission a consultant to build. Dollar value saved, time saved, cost per seat — all automated.
**Budget:** If Trackr can find even one zombie subscription, it pays for itself. Easy ROI story.
**Where to find them:** CFO communities (CFO Alliance, CFO Connect), LinkedIn, finance subreddits.
**Avg. deal:** Startup plan minimum. Likely adds managed service if they want hands-off governance.

---

### ICP #4 — Head of AI at a Corporate Innovation Unit (Enterprise)
**Title:** Head of AI, Chief AI Officer, VP of Digital Transformation, Head of Innovation
**Company:** Large enterprise, 500+ employees, Fortune 1000 adjacent
**Pain:** Their company is being asked "what's your AI strategy?" by the board. They're running 15+ AI tools in pilots across business units with no central governance. They can't answer what their "AI Nativeness Score" is.
**Why they buy Trackr:** The AI Nativeness Score, competitive intel dashboard, and board reports are literally the answer to "what's your AI strategy?" The team literacy module lets them train the whole org.
**Budget:** Large — comes out of innovation or digital transformation budgets. Could be $10k–$50k/year with a custom contract.
**Where to find them:** LinkedIn (Chief AI Officer, Head of AI + enterprise company), AI leadership conferences.
**Avg. deal:** Enterprise plan + managed Premium + custom contract. Highest ACV. Longest sales cycle (4–8 weeks) but highest LTV.

---

### ICP #5 — Fractional CTO or Agency Owner Managing Client Tech Stacks
**Title:** Fractional CTO, Tech Lead, Agency Owner, Consulting Firm Principal
**Company:** Solo or small team serving 5–20 client companies
**Pain:** Advising multiple companies on tech stack decisions and doing the research manually for each one. Writing the same Notion doc over and over. Clients ask "should we use X or Y?" and they spend 3 hours researching.
**Why they buy Trackr:** Used across all clients. One Startup or Enterprise plan pays for itself after the first tool eval they bill out. They can show clients a branded board report. The compare feature is their killer use case.
**Distribution leverage:** Each fCTO recommends Trackr to their clients → viral loop. One fCTO could convert 5–15 client companies.
**Budget:** Business tool — expensed, no friction.
**Avg. deal:** Startup plan per client workspace, or one Enterprise license across all clients. High referral value.

---

## Dream 100 — Distribution Partners, Not Just Customers

### Category 1: Operations & SaaS Practitioners (ICP #1 + #3)

**Who controls this audience:**
- **Lenny Rachitsky** (Lenny's Newsletter, 750k+ subs) — product and ops leaders. A mention or case study here would be transformative.
- **Ben Murray** (SaaS CFO, 100k+ LinkedIn) — CFO-focused SaaS metrics content. Perfect for the spend tracking angle.
- **Corey Haines** (Swipe Files, Indie Hackers) — SaaS growth practitioner audience
- **Ops Nation Slack** (community) — Head of Ops is literally ICP #1

**How to engage:**
- Offer free access + white-glove onboarding for their audience members
- Pitch a co-created resource: "The 2025 SaaS Stack Health Report" — generate data from anonymized Trackr usage, they publish it to their audience
- Guest post: "How to evaluate AI tools in 90 seconds instead of 3 weeks"

### Category 2: AI & Technology Podcasts (ICP #4)

**Who controls this audience:**
- **Kieran Flanagan & Scott Brinker** (Marketing AI Institute, HubSpot) — AI for business practitioners
- **Ethan Mollick** (One Useful Thing) — enterprise AI adoption, massive academic/corporate audience
- **The AI Breakdown (Nathaniel Whittemore)** — daily AI news, operator-focused
- **Hard Fork (NYT — Casey Newton & Kevin Roose)** — mainstream tech, enterprise angle
- **Latent Space Podcast (swyx & Alessio)** — AI engineers and technical buyers

**How to engage:**
- Pitch the "AI Nativeness Score" as a segment: "We scored 500 startup tech stacks — here's what the most AI-native companies have in common"
- Offer free stack audit for their listeners as a CTA
- The data angle is the hook — nobody has this data at scale yet

### Category 3: IT & SysAdmin Communities (ICP #2)

**Who controls this audience:**
- **Lawrence Systems** (YouTube, 350k subs) — IT professional audience, product reviews
- **NetworkChuck** (YouTube, 3M subs) — sysadmin/IT, very engaged
- **r/sysadmin** (Reddit, 900k members) — direct community, very active tool discussions
- **ITProTV / CBT Nuggets** — IT training, perfect for the literacy module angle

**How to engage:**
- "I tested Trackr on my entire office stack" style video collaboration
- Reddit AMA: "We built an AI tool to evaluate any SaaS app in 90 seconds — here's how it works"
- Offer a free community plan for their subreddit moderators

### Category 4: Fractional CTO & Consulting Networks (ICP #5)

**Who controls this audience:**
- **CTO Craft Community** (ctocraft.com — 7k+ CTOs and engineering leaders)
- **Toptal / YC's Startup School** — fractional executive networks
- **Accelerate Agency** — SaaS growth, agency owners

**How to engage:**
- Partner program: fCTOs get revenue share or free upgrade when their clients sign up
- Build a "Trackr Partner" badge — fractional CTOs love certifications for their LinkedIn
- Reach out directly via LinkedIn to 50 fractional CTOs with hyper-personalized pitch

### Category 5: SaaS Review Sites & Communities (All ICPs)

- **G2 / Capterra / Product Hunt** — get listed immediately, free distribution
- **Ben Tossell's Makerpad** — no-code + AI tools community
- **Indie Hackers** — founders building companies, ops-savvy
- **Product Hunt launch** — one-time spike, builds social proof and backlinks

---

## Go-to-Market: What To Do This Week

### Monday — Set Up Cold Email Infrastructure

Using **Cursive** for leads + **Email Bison** for sending.

**Campaign 1 — Head of Operations / Chief of Staff at Series A/B Startups**

Target criteria in Cursive:
- Title: "Head of Operations" OR "Chief of Staff" OR "VP Operations" OR "Operations Manager"
- Company size: 30–200 employees
- Funding: Series A or Series B (raised in last 18 months)
- Industry: Tech, SaaS, FinTech, HealthTech

Pull 500 leads. This is your highest-conversion cold audience.

**Cold Email — Sequence 1 (Ops Lead):**

> Subject: How many tools is [Company] running?
>
> Hey [First Name],
>
> Quick question — do you have a clean answer to "what's our full software stack and is it working?"
>
> Most ops leads I talk to at [Series]-stage companies don't. Tools get bought by engineers, finance has no visibility, and renewals blindside everyone.
>
> We built Trackr to fix this. Drop any SaaS tool name in — the AI researches it in 90 seconds and spits out a scored evaluation. Then it maps your entire stack, scores its health, and flags renewals.
>
> Happy to give you free access to run it on 3-5 tools this week, no card required.
>
> Worth a look?

Follow-up Day 3: "Still curious — what's your current process when someone asks you to evaluate a new tool?"

Follow-up Day 7: Send your AI Nativeness benchmark data if you have any from beta users.

---

**Campaign 2 — IT Directors at Mid-Market Companies**

Target: IT Director / IT Manager / CTO at 100–500 person non-VC-backed companies

> Subject: Your software audit — done in 2 minutes instead of 2 weeks
>
> Hey [First Name],
>
> Gartner wants $50k for a tool evaluation framework. Vendors send 40-page pitch decks. Your engineers haven't touched the evaluation in 3 months.
>
> There's a faster way. Trackr runs AI research on any SaaS tool — in about 90 seconds — and scores it across 7 dimensions (security, pricing, integrations, AI capability, etc.). It also maps your full stack, tracks spend, and alerts you on renewals.
>
> Would love to show you what it outputs for 2-3 tools you're already evaluating.

---

### Tuesday — Outbound to Fractional CTOs

Pull 100 fractional CTOs from LinkedIn/Cursive. Personalized LinkedIn DM + email:

> Subject: Partner program — use Trackr across all your clients
>
> Hey [Name],
>
> I see you work with multiple companies on their tech stack. We built Trackr — AI tool evaluation + stack management. I'm looking for 5 fractional CTOs to partner with for early access.
>
> Idea: you use it across your clients, we give you an upgraded account free, and if your clients sign up, we'll build out a partner revenue share.
>
> Would this be worth a 15-min call this week?

---

### Wednesday — Community & Product Hunt

1. **Product Hunt** — submit this week. Write a maker post about the problem (SaaS sprawl, AI evaluation). Tags: SaaS, AI Tools, Productivity, Operations.
2. **r/sysadmin** — genuine post: "We built a tool to evaluate any SaaS app with AI — here's what we learned after testing 200+ tools." Link in comments.
3. **Indie Hackers** — founder story: "The $200k SaaS stack problem — here's what we built to fix it."
4. **Hacker News Show HN** — "Show HN: AI that evaluates any SaaS tool in 90 seconds and gives you a 7-dimension scorecard." HN loves technical specificity.

---

### Thursday — Dream 100 Top 10 Outreach

Best bets for this week:
- **CTO Craft community** — email their team asking to post or sponsor a newsletter
- **Ops Nation Slack** — join, contribute, then share Trackr with context
- **Ben Murray (SaaS CFO)** — LinkedIn DM: "I built a spend tracking layer for software stacks — would love to get your take and share data if you'd feature it"
- **Product Hunt upcoming** — get in the upcoming section now to build followers before launch

---

### Friday — Conversion Optimization

1. **Add a "Book a Free Stack Audit" CTA** prominently on the marketing site — this is your enterprise wedge. Run a 30-min Zoom, run their 5 biggest tools through Trackr live, close on the call. The managed service offer slots in naturally at the end.
2. **Free plan review** — make sure the free plan outputs enough value that people see the magic before hitting the credit wall. If conversion rate is low, consider bumping free credits from 5 to 10 (cost: $1.40 — negligible).

---

## Hiring Roadmap

**Now (zero revenue):** Don't hire. You as the closer for the first 20 customers teaches you exactly who buys and why.

**At $5k MRR:** Part-time SDR or VA to run cold email campaigns at scale. Pay commission-heavy ($500–$1k/mo base + 10% of first month's revenue).

**At $15k MRR:** Fractional marketer to run Dream 100 outreach, communities, and content SEO. Not a full-time hire — find someone who's done this for a B2B SaaS before.

**At $30k MRR:** Full-time AE. When the pipeline is flowing, you need someone to close it.

---

## The One-Sentence GTM Strategy

**Get 10 paying customers by running personalized cold email to Heads of Operations at Series A/B startups, close them with a live free stack audit call, and use every one of those customers as a case study to unlock Dream 100 distribution partnerships.**

The platform is ready. The pricing is right. This is purely a distribution and sales execution problem now.
