---
title: "The CTO's Tech Stack in 2026: What's Worth Keeping and What to Cut"
date: "2026-02-25"
description: "A guide to the modern CTO tech stack in 2026. What tools top engineering organizations are using, what's worth keeping, and where to cut costs."
author: "Trackr Team"
---

# The CTO's Tech Stack in 2026: What's Worth Keeping and What to Cut

The average engineering organization at a 100-200 person SaaS company runs 40-60 tools. Many were bought for good reasons that no longer apply. Some are genuinely critical. Others are expensive habits from a time when the team was smaller and budget scrutiny was lower.

This guide is for CTOs and engineering ops leads doing a stack rationalization — or who want to make a defensible case to the CFO for next year's tooling budget.

## The Tier 1 Stack: Non-Negotiable

These are the tools that, if they went down for 24 hours, would stop engineering work or create a business-critical incident:

**Source control and CI/CD**: GitHub or GitLab are the only serious choices at scale. GitHub's AI features (Copilot, code review summaries) have matured enough to meaningfully impact developer productivity. GitLab's integrated CI/CD is its differentiator. Don't fragment here — monorepo or not, having your SCM and CI/CD in one place reduces complexity.

**Cloud infrastructure**: AWS, Google Cloud, or Azure. This is a 5-10 year decision driven by your existing vendor relationships, team expertise, and specific service requirements (AI/ML workloads often favor Google Cloud, enterprise compliance often favors Azure, general SaaS workloads are well-served by AWS).

**Observability**: Datadog, New Relic, or Grafana Cloud. Datadog is the feature-richest but most expensive. Grafana Cloud is open-source-based and increasingly competitive. New Relic's per-seat pricing model is often more predictable. Whatever you choose, consolidate — running three partial observability tools is worse than one comprehensive one.

**Error tracking**: Sentry is the near-universal choice for application error tracking. Its AI-powered issue prioritization and GitHub integration make it much faster to route and fix production errors than the alternatives.

**Communication**: Slack for most engineering organizations, Microsoft Teams if you're in a Microsoft-heavy enterprise environment. These aren't really interchangeable from a workflow perspective — pick one and own it rather than running both.

## The Tier 2 Stack: High Value, Worth Defending

**AI coding assistance**: GitHub Copilot, Cursor, or Codeium. Copilot is the most widely used and integrates natively into GitHub workflows. Cursor has a strong following among teams that do significant AI-assisted development. The ROI is defensible — 20-30% developer productivity gains are consistently reported by teams that adopt these well. If you're not running one of these, the opportunity cost is real.

**Incident management**: PagerDuty or OpsGenie. These exist to solve a real problem (who gets paged when something breaks) and the cost of getting this wrong (slow response, alert fatigue, unclear escalation paths) is high. Don't cut here.

**Feature flagging**: LaunchDarkly is the leader. Flagsmith and Unleash are open-source alternatives that some teams run self-hosted to reduce cost. Feature flags are an infrastructure decision that affects your release process, A/B testing capability, and the ability to roll back features without a deploy. Worth investing in.

**Security scanning**: Snyk or GitHub's Dependabot/Advanced Security for dependency scanning, Wiz or Orca for cloud security posture. The cost of a security incident vastly outweighs the cost of these tools.

## The Tier 3 Stack: Question Everything

These are the tools where you should ask hard questions before renewing:

**Documentation tools**: Confluence is the incumbent but is often disliked and underused. Notion has become the preferred alternative for teams that aren't heavily Atlassian-committed. The question isn't which is better — it's whether you're actually maintaining documentation in either one. A tool license for documentation that nobody updates is wasted money.

**Project management**: Jira, Linear, Asana, or Monday. Linear has strong momentum among engineering-led teams for its speed and clean interface. Jira is the enterprise standard but requires investment to configure and maintain properly. If your engineers complain about your project management tool every sprint, it's worth a structured evaluation.

**Internal developer portal**: Backstage (open-source, Spotify origin) is the standard for larger engineering orgs. Cortex and Port are commercial alternatives. This is high-value when your org has dozens of services; less justified when you have fewer than 15-20.

**API management**: If you're exposing APIs externally, this matters for developer experience and security. Kong, AWS API Gateway, and Apigee are the main choices. If you're not actively managing your APIs, you may be exposing security surface you don't know about.

## The AI Infrastructure Question

The biggest new budget question for engineering leaders in 2026: how much to invest in internal AI infrastructure vs. leaning on API-based AI services.

The practical answer for most Series A-C SaaS companies: use APIs (OpenAI, Anthropic, Google) for most AI features and invest in evaluation infrastructure (Braintrust, LangSmith, Humanloop) rather than self-hosting models. Self-hosting makes sense for specific compliance requirements or extreme cost sensitivity at very high token volumes — not for the average growth-stage SaaS company.

Evaluation infrastructure for your AI features is often the highest-ROI engineering investment you're not making. If you can't measure whether a prompt change improved or degraded your AI feature, you're shipping changes blind.

## Where to Cut

The most common places to find savings in an engineering stack:

- **Unused or underused Datadog features**: Datadog's APM, logs, and custom metrics billing can balloon. Audit what you're actually using vs. what you're paying for.
- **Duplicate monitoring tools**: Many orgs run Sentry + another error tracker, or Datadog + another observability tool. Consolidate.
- **Old SaaS trials that became zombie contracts**: Do an audit of every SaaS contract in engineering. Find every auto-renewal that happened without active evaluation.
- **Over-provisioned cloud resources**: Not strictly a SaaS tool issue, but consistently one of the largest savings opportunities in engineering budgets.

## Running a Stack Review

A quarterly engineering stack review doesn't need to be complex: list every tool, note annual cost, note primary owner, note last active evaluation. Flag anything that hasn't been actively evaluated in 18 months for renewal review.

Tools like Trackr can accelerate this by generating a fresh research report on any tool — useful for re-evaluating legacy vendors where your knowledge of the current competitive landscape is stale.

## Bottom Line

A disciplined engineering stack isn't the smallest possible stack — it's the right tools, well-utilized, with clean integrations. The goal of a stack review isn't to cut everything possible; it's to ensure every dollar in tooling budget is working. In most engineering orgs, 15-25% of the tooling budget is either duplicated or underutilized. Finding and eliminating that is worth one annual review cycle.

---
*Trackr automates SaaS tool research. Submit any tool URL and get a scored 7-dimension report in under 2 minutes. [Start free →](https://trytrackr.com/sign-up)*
