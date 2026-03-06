---
title: "The Software Waste Calculator: How Much Are You Overspending?"
description: "Most companies waste 20-40% of their software budget. Use this framework to calculate your actual waste, identify the biggest opportunities, and build a reduction plan."
date: "2026-03-05"
author: "Trackr Team"
tags: ["software waste", "cost optimization", "saas", "audit"]
image: "/og.png"
---

The number that surprises most finance leaders when they first run a proper software audit is not the total spend — it is what percentage of that spend is essentially waste. Industry research consistently places software waste between 20% and 40% of total SaaS spend. At $1M in annual software spend, that is $200,000 to $400,000 available for reallocation without losing any capability your team actually uses.

This post walks through a practical framework for calculating your own software waste number — not an industry average, but your actual waste at your company.

## What Counts as Software Waste

Before calculating, define what you are measuring. Software waste falls into four categories:

**Category 1: Unused licenses** — Seats that no one logs into. Paid for, activated, never used. This is the most egregious form of waste and often the easiest to eliminate.

**Category 2: Underused licenses** — Seats where users log in occasionally but are not using the tool in a way that justifies the cost. An enterprise plan user who only uses free-tier features. A team plan seat for someone who uses the tool once a month.

**Category 3: Duplicate tools** — Multiple tools doing the same job. Two note-taking apps. Three project management tools. This is often more expensive than the raw seat cost suggests, because maintenance overhead and cross-team friction add costs that do not appear in the SaaS invoice.

**Category 4: Retained but unnecessary tools** — Tools that solved a problem you no longer have, or tools from a use case that has evolved. The integration tool you bought before you standardized on Zapier. The data tool from a project that ended 18 months ago.

## The Calculation Framework

### Step 1: Build Your Baseline

Pull every SaaS vendor payment from the last 12 months. Your accounting system or credit card statements are the source of truth. Group by vendor and sum annual spend.

Total annual software spend = [your number]

### Step 2: Calculate Unused License Waste

For each tool that licenses by seat (most SaaS tools), pull:
- Paid seat count
- Monthly active users (from the vendor's admin panel, SSO logs, or API)

Waste rate per tool = (Paid seats - Active users) / Paid seats

Apply the waste rate to the annual cost:
Unused license waste per tool = Annual cost × Waste rate

Do this for every tool over $1,000/year in your stack. Sum the results.

**A realistic expectation**: Most organizations find unused license waste of 15-25% across their seat-licensed tools. In a rapidly growing company where hiring preceded tool audits, this can reach 40%.

### Step 3: Calculate Underuse Waste

This is harder to measure because "underuse" requires a judgment about what level of use justifies the cost. A useful heuristic: if a user has not used the tool in the last 30 days, they are a candidate for license removal.

Pull 30-day active users (not all-time users, not monthly-unique-visit-based counts — actual active users in the trailing 30 days). Compare to paid seats.

Many vendors distinguish between "activated" (ever logged in) and "active" (used in last 30 days). Use the latter.

**Practical shortcut**: If your vendor's admin panel shows a column for "last active" date, sort ascending. Anyone who has not been active in 90+ days is likely not using the tool meaningfully. That is your initial cut for underuse.

### Step 4: Identify Tool Overlap

List every tool in your stack and assign it a primary category:
- Project management
- Communication
- Document storage/collaboration
- CRM and sales
- Marketing automation
- Analytics and BI
- HR and recruiting
- Finance and accounting
- Security
- AI and automation
- Developer tools

For any category where you have three or more tools, calculate the overlap cost. If you have Asana, Jira, Monday, and Notion all used for project management, at least one or two of those is likely redundant for most users.

Quantify: what is the combined annual spend in categories where you have more tools than you need?

**Typical finding**: Mid-market companies often have 5-10 categories with meaningful overlap, representing $50,000-$300,000 in consolidated savings opportunity.

### Step 5: Identify Zombie Tools

A zombie tool is a subscription that nobody is actively advocating for — it just keeps renewing because it is easier to let it renew than to deal with canceling it.

Zombie tool indicators:
- Zero or near-zero active users in the last 90 days
- No internal champion (ask around — nobody knows who owns it)
- Solving a problem that has been solved another way

Check your renewal calendar for tools renewing in the next 90 days and ask: who in the organization would miss this if it disappeared? If the answer is nobody you can find, it is a zombie.

## Running the Total

Software waste total = Unused license waste + Underuse waste + Overlap cost + Zombie tool cost

Express this as both a dollar amount and a percentage of total software spend. The percentage is useful for benchmarking against peers (20-40% is normal, under 15% is excellent, over 50% is a serious problem).

## The Prioritized Reduction Plan

Once you have a waste number, build a reduction plan prioritized by effort-to-save ratio:

**Quick wins (1-30 days)**: Cancel zombie tools, remove unused seats from tools where the vendor allows partial cancellation. These produce savings immediately with minimal friction.

**Short-term projects (30-90 days)**: Right-size seat counts at next renewal for tools with high underuse rates. Consolidate overlapping tools in the highest-cost categories.

**Medium-term consolidation (90-180 days)**: Drive the migrations required to eliminate duplicate tools in categories where you have decided on a standard. This requires change management — users give up familiar tools — and should not be rushed.

## What to Do With the Savings

Software waste reduction frees up budget. The three best uses:

1. **Fund AI tool expansion in areas where you are under-invested** — the category growing fastest with the highest ROI potential
2. **Return to the bottom line** — software budget reductions are real savings
3. **Upgrade tooling in categories where you have underinvested** — if your team is using inadequate tools in critical workflows, sometimes the answer is better tools, not fewer

Most organizations do a combination: eliminate the clear waste, reinvest a portion in higher-value tools, and bank the rest.

[Trackr's spend analytics](/dashboard) automates much of this calculation — pulling your actual spend data, surfacing underused tools, and organizing the picture so you can make decisions based on real usage data rather than manual exports and spreadsheets. Teams using Trackr to manage this process typically identify their waste number in hours rather than weeks.
