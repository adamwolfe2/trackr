---
title: "How to Discover Shadow IT in Your Organization"
description: "Shadow IT is growing fast with AI tools. Learn practical methods to surface unauthorized software, assess the risk, and build a culture where employees report tools proactively."
date: "2026-03-05"
author: "Trackr Team"
tags: ["shadow it", "security", "saas management", "it governance"]
image: "/og.png"
---

Shadow IT has always existed. But the explosion of AI tools — most of which require nothing more than a credit card and an email address to activate — has made it exponentially harder to track. Employees are not trying to create problems. They are trying to get work done. Understanding that distinction is the starting point for any effective shadow IT program.

## What Shadow IT Actually Costs You

The risks from shadow IT are real, but they are often mischaracterized. The headline risk is security: an employee using an AI writing tool that trains on your data, a messaging app that stores conversations on unvetted servers, or an automation tool with access to your CRM. Data leaves your perimeter and you do not know it.

The less-discussed cost is financial. When ten different teams each pay for their own version of a note-taking tool, you are paying ten times what a consolidated license would cost. Spend analysis routinely finds 15-30% of SaaS costs are duplicates of tools already centrally licensed.

There is also the operational risk: critical business processes running on tools only one person knows about. When that person leaves, the process breaks.

## The Four Discovery Methods

### 1. Financial Statement Analysis

The most reliable starting point is your expense data. Pull credit card statements, expense reports, and AP invoices for the last 12 months. Filter for software-category vendors — look for monthly recurring charges in round numbers, vendor names that end in ".io" or "AI," and anything categorized as "software subscription" or "SaaS."

This catches the tools employees are paying for personally and expensing. It does not catch tools on company cards you do not review at the vendor level.

For company card spending, most accounting systems can export vendor-level detail. Ask finance for a list of every software vendor paid in the last year, sorted by total spend. Many companies have never run this report. The results are usually surprising.

### 2. Network and DNS Analysis

Your IT team can pull DNS query logs or network traffic data to see what external services employees' devices are connecting to. This requires either network-level monitoring or endpoint agents (like those used for MDM).

You do not need to inspect content — just destinations. A spike in connections to api.openai.com, app.notion.so, or unfamiliar AI tool domains tells you something is being used that may not be in your approved stack.

This method catches tools that employees have not expensed — free tiers, personal subscriptions, or tools the company has not been billed for yet.

### 3. SSO and Identity Provider Audits

If you use Okta, Azure AD, Google Workspace, or a similar identity provider, it likely logs every time an employee uses "Sign in with Google" or similar OAuth flows to authenticate with a third-party app. Pull that log. You will see every external app your employees have granted access to with their work credentials.

This is one of the most revealing discovery methods because it shows apps that employees have actively authenticated with — not just visited. Many of these apps will have access to email, calendar, or drive data through the OAuth scope they requested.

### 4. Manager and Department Head Surveys

The methods above find what technology can find. They miss tools that employees access through personal email addresses or personal devices. Sometimes the simplest approach is to ask.

A short quarterly survey to managers — "What software tools is your team using that are not in our approved stack?" — surfaces things no log will catch. Pair it with amnesty: you are not auditing for discipline, you are trying to consolidate and support the tools that are working.

Many teams have genuinely found better tools than the centrally licensed alternatives. A good shadow IT program identifies those tools and either adopts them centrally or provides a migration path — not just a shutdown.

## Assessing What You Find

Not all shadow IT is equal. Once you have a list of discovered tools, assess each one:

**Data sensitivity**: Does the tool have access to customer data, employee data, financial records, or intellectual property? Higher sensitivity means higher priority.

**Usage scope**: Is this one person using a personal preference tool, or is a whole team running a critical process on it? Scope determines urgency.

**Regulatory implications**: If your company handles healthcare, financial, or other regulated data, tools that touch that data have compliance implications regardless of how minor the tool seems.

**Vendor posture**: Is this a reputable vendor with a security program and documented privacy practices? Or an early-stage startup with no published security documentation?

Triage your findings into three buckets: approve and centralize, require migration, or block and remove. The third bucket should be small — most shadow IT deserves the first or second treatment.

## Building a Culture of Proactive Disclosure

The goal is not to catch employees doing something wrong. The goal is to get visibility into the tools that are actually driving productivity, so you can support them properly — or replace them with something better.

This requires making it easy and consequence-free to disclose tools. Build a simple intake form: "Using a tool not in our approved stack? Tell us about it." Route submissions to an IT or ops review process with a defined SLA (we will respond in five business days). Make the outcome binary: approved or let's talk about alternatives.

When employees know that disclosure leads to faster support rather than a stern conversation, they disclose more. When they think disclosure leads to confiscation, they hide tools more carefully.

Some organizations create a "shadow IT fast lane" — a 30-day expedited review for tools with fewer than five users and no access to sensitive data. This reduces friction enormously while maintaining governance.

## The AI Tool Challenge

AI tools are the hardest category of shadow IT to manage right now. They proliferate rapidly, often start free, and their data practices are frequently opaque or changing. Specific concerns:

**Training data opt-outs**: Many AI tools use your inputs to improve their models by default. Enterprise plans often include opt-outs. Free tiers often do not. An employee using a free AI writing tool may be training that model on your unpublished product roadmap.

**Data retention**: What does the vendor retain? For how long? Under what legal jurisdiction?

**Subprocessors**: AI tools often rely on foundation model APIs from third parties. The tool you approved may be routing your data through several vendors you have never evaluated.

Build an AI-specific addendum to your tool evaluation checklist that addresses these questions. See our [AI tool security evaluation guide](/blog/ai-tool-security-evaluation) for a detailed framework.

## Operationalizing Discovery

A one-time shadow IT audit produces a one-time list. The problem is continuous, so your process needs to be continuous:

- Run financial analysis quarterly (monthly is better if you can automate it)
- Pull SSO/OAuth logs monthly
- Survey managers quarterly
- Review new tool requests through a lightweight intake process

[Trackr](/dashboard) helps teams surface new tools as they appear in spend data, creating an ongoing early-warning system rather than periodic point-in-time audits.

Shadow IT is not a problem you solve once. It is a dynamic that you manage continuously — and the organizations that manage it best do so by making it easy to come out of the shadows, not by trying to eliminate all unsanctioned behavior.
