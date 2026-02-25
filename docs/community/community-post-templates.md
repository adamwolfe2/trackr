# Trackr — Community Post Templates
Generated: February 2026

These are authentic, value-first community posts for relevant forums and Slack communities.
Post guidelines: Always lead with genuine value. Never open with product promotion.
Wait at least 2 weeks between posts in the same community. Respond to every reply.

---

## Post 1 — r/operations

**Subreddit:** r/operations
**Title:** How we built a consistent scoring system for evaluating AI tools (free template)

**Body:**

Sharing something our ops team put together after the third time we evaluated the same tool twice because nobody could find the original research.

The core problem: tool evaluations were scattered across Notion docs, Slack threads, and people's memories. No consistent criteria, no shared record, and no way to compare options when we needed to make a final call.

We built a 7-dimension framework that we now use for every tool evaluation:

1. **Core Capability (25%)** — Does it actually do its one job well?
2. **Ease of Use (15%)** — How long until a new person is productive?
3. **Integration Depth (15%)** — Does it connect to the stack you already have?
4. **Pricing Value (15%)** — Are you getting what you pay for at your scale?
5. **AI Sophistication (15%)** — Is AI the core value, or just a checkbox feature?
6. **Community & Support (10%)** — What happens when something breaks?
7. **Scalability (5%)** — Will this still work when you're 2x your current size?

Each dimension gets a 1–10 score with written rationale. Apply the weights, get a weighted score. The formula: Score = (Core × 0.25) + (Ease × 0.15) + (Integrations × 0.15) + (Pricing × 0.15) + (AI × 0.15) + (Community × 0.10) + (Scale × 0.05).

Tools scoring 8.0+ are best-in-class. 7.0–8.0 is strong. Below 5.0 warrants active replacement research.

The most important part isn't the score — it's the written rationale you capture alongside it. "We scored this 5.5 on integrations because it doesn't have a native HubSpot connector" is actually useful at renewal time.

We put this into a free Notion template and also built a tool to automate the scoring (trytrackr.com) — but the framework itself is what matters. Happy to share the Notion template if anyone wants it.

What criteria does your team use when evaluating tools? Curious if others have developed something similar.

---

**Posting notes:**
- Post on Tuesday–Wednesday for highest ops community engagement
- Monitor for 48 hours and reply to every comment
- Don't mention Trackr in the first 3 replies — only if someone directly asks what tool you use
- Offer the scorecard template as a genuine resource

---

## Post 2 — r/SaaS

**Subreddit:** r/SaaS
**Title:** Built a tool that cuts tool research from 8 hours to 2 minutes — here's the problem it solves

**Body:**

I want to share what we built and why, because the problem is one I see people post about here constantly.

The pattern I kept seeing at my last company and at companies I advise:

Someone asks about a new tool. The ops person spends a half-day researching it. They write a Notion doc that nobody looks at again. Six months later, a different person asks the same question and the whole process repeats. Meanwhile, the original research is stale because the tool has updated three times.

The evaluation itself is also fundamentally inconsistent. G2 reviews weigh one set of criteria. The sales demo weighs another. The "my friend uses it" recommendation weighs a third. You make a decision and two months later half the team thinks it was the right call and half doesn't — and nobody has a record of why you chose it.

We built Trackr to fix this: submit any tool URL, get a scored 7-dimension research report in under 2 minutes. The report covers features, pricing accuracy, ease of use, integrations, AI quality, community/support, and scalability — with a written summary, pros, cons, and competitive context.

Reports live in a team workspace so everyone pulls from the same source. They auto-refresh when you schedule re-research. You can track spend and renewal dates alongside the scores.

It's at trytrackr.com — free tier gives you 3 full reports with no card required.

Sharing because this is the type of thing that took us months to figure out was even a "problem worth solving." Curious if ops people here have run into the same thing or solved it differently.

---

**Posting notes:**
- This is more product-forward than Post 1 — appropriate for r/SaaS which expects product sharing
- Lead with the problem story, not the product
- End with a genuine question to encourage discussion
- Respond to every comment within 4 hours on day 1

---

## Post 3 — Ops Nation Slack

**Channel:** #tools-and-resources (or #general if the community is smaller)
**Format:** Slack message (no title)

**Message:**

Hey ops folks — sharing something I put together that's been genuinely useful for our team.

We built a free scorecard template for evaluating AI and SaaS tools consistently. 7 dimensions, weighted scoring, written rationale fields. The goal was to have something we could use for every tool eval so we could actually compare options across time and across the team.

You can see the framework at trytrackr.com/scorecard — the template is there to download (Notion format).

The short version of the framework if you don't want to click:
- Core Capability (25%), Ease of Use (15%), Integration Depth (15%), Pricing Value (15%), AI Sophistication (15%), Community & Support (10%), Scalability (5%)
- Score each 1–10 with written rationale, apply weights
- 8.0+ = best in class, 7.0–8.0 = strong, below 5.0 = replacement candidate

Happy to share the full Notion template directly too — just DM me or drop a 👍 and I'll share it here.

Has anyone else built something like this for their team? Would love to see what others are using.

---

**Posting notes:**
- Only post in communities where you've already been active for at least 2 weeks
- This works best as a follow-up to a real conversation about tool evaluation struggles
- If the community has a #resources or #tools channel, that's the right place
- Don't post the same message in multiple Slack communities on the same day

---

## Post 4 — Pavilion Operations Community

**Channel:** #general or #tools-and-stack
**Format:** Slack/forum post
**Note:** Pavilion has a more sophisticated audience — RevOps and senior ops leaders. Lead with the business problem, not the tool.

**Message:**

Anyone else deep in SaaS renewal season right now?

Running through our stack for the year and realizing how little documentation we have from the original evaluations. For a few tools, I genuinely can't reconstruct why we chose them — there's no record of what we compared them against or what criteria we used.

We've been building out a more systematic approach over the past few months and one thing that's helped is treating tool evaluations the same way product teams treat feature specs: document before you decide, not after.

We use a 7-dimension scorecard now (I can share the template if useful) and recently started using Trackr (trytrackr.com) to automate the research portion — you submit a URL and get a scored report in under 2 minutes instead of spending a half-day on G2.

Has anyone cracked the renewal intelligence problem? Specifically: how do you decide at renewal time whether to keep a tool, negotiate it down, or replace it? Curious what frameworks Pavilion folks are using.

---

**Posting notes:**
- Pavilion is a paid community — be a genuine participant, not a promoter
- This post leads with a question, not a product
- The Trackr mention is natural and contextual — appropriate for Pavilion's culture
- If the conversation gets traction, offer to do a "stack review" session with interested members

---

## Post 5 — LinkedIn (Long-Form Article Format)

**Title:** The 8-hour tool evaluation problem — and how ops teams are fixing it

**Format:** LinkedIn article (not post — use the "Write an article" feature)

**Body:**

I talk to ops leaders every week who are dealing with the same problem: tool evaluations are eating their time and the output doesn't hold up.

Here's the typical scenario at a 50-person company:

Someone asks about a new CRM add-on. The ops lead spends 6–8 hours researching — G2, demos, competitor comparisons, pricing pages, Reddit threads. They write a Notion doc. They share it in Slack. A decision gets made.

Three months later, the CRO asks "why did we pick this over [competitor]?" and nobody can answer with confidence. The Notion doc is outdated. The original researcher has moved on. The pricing they evaluated has changed.

And the next evaluation starts from scratch.

**What makes tool evaluation hard**

It's not that ops teams don't care about tools. It's three structural problems:

1. **No consistent framework.** Every eval uses different criteria, measured differently by different people. You can't compare options across time or across evaluators.
2. **No shared workspace.** Research lives in personal Notion docs, browser bookmarks, Slack messages. No single source of truth.
3. **Research decays.** A tool you evaluated 6 months ago has probably changed pricing, added features, or lost market position. Static research misleads.

**What good tool evaluation looks like**

The teams I've seen do this well have three things in common:

**A standard scorecard.** Same 7 criteria, same 1–10 scale, same written rationale fields for every evaluation. The score matters less than the documentation. "We scored this 6.5 on integrations because it doesn't have a native HubSpot connector" is useful at renewal time. A bare number isn't.

**A shared team workspace.** Research lives where the whole team can pull it. When a new person joins and asks "have we looked at Notion?" the answer is a link, not "I think Sarah looked at it last year."

**Scheduled re-research.** Tools change. Pricing changes. New competitors launch. The evaluation you did 8 months ago needs to be revisited before renewal. The best ops teams set a calendar trigger at 60 days before renewal to re-run the research and compare current alternatives.

**The time math**

If a 50-person company evaluates 15 tools per year at 8 hours each, that's 120 person-hours of research — roughly $12,000 in salary equivalent at a $100/hr blended rate. Most of that research isn't reusable and doesn't survive the first team transition.

Getting that down to 2 hours per tool (realistic with a good process and the right tooling) is $10,000 back per year for a one-person ops function. At a 200-person company evaluating 30 tools, the math is correspondingly larger.

**The tools question**

We built Trackr (trytrackr.com) specifically to solve the research automation piece — submit a URL, get a scored 7-dimension report in under 2 minutes. But the framework itself (the scorecard and the process) is what makes the output usable.

If you want the scorecard template without the tool, it's at trytrackr.com/scorecard as a free download.

What are ops teams using to manage tool evaluation at scale? I'd genuinely like to know what's working beyond spreadsheets.

---

**Posting notes:**
- LinkedIn articles get indexed by Google — use keywords naturally in the text
- Share as an article, not a post, for longer shelf life and better SEO benefit
- End with a question to drive comments (LinkedIn algorithm rewards engagement)
- Pin it as a featured post on your profile after publishing
- Share it as a short post linking to the article 2 days after publishing

---

## Usage Guidelines

**Community etiquette:**
- Read the community rules before posting
- Be an active participant for at least 2 weeks before sharing Trackr
- Respond to every reply within 24 hours
- Never post the same content in multiple communities on the same day
- If someone asks "who built this?" — be transparent: "I built Trackr to solve this exact problem"
- Adjust tone to match community culture (r/operations is more casual; Pavilion is more professional)

**What not to do:**
- Don't crosspost identical content across multiple communities simultaneously
- Don't respond to unrelated threads with unsolicited Trackr mentions
- Don't post in communities you haven't participated in before
- Don't automate posting — these should feel human because they are

**Tracking results:**
- Note which post, which community, and when
- Track: upvotes/reactions, replies, profile visits, signups attributed (use UTM parameters on URLs)
- UTM format: `trytrackr.com/sign-up?utm_source=reddit&utm_medium=community&utm_campaign=ops-scorecard`
