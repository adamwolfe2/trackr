---
title: "AI Vendor Due Diligence: The Complete Checklist for 2026"
description: "Before signing any AI software contract, run through this vendor due diligence checklist. Covers security, pricing traps, data practices, and the questions your vendor doesn't want you to ask."
date: "2026-02-20"
author: "Trackr Team"
tags: ["vendor due diligence", "ai tools", "security", "procurement", "saas buying"]
image: "/og.png"
---

## Why AI Vendor Due Diligence Is Different

Buying AI software isn't like buying traditional SaaS. When you adopt a conventional tool — say, a CRM or project tracker — the stakes are mostly about features, pricing, and fit.

With AI vendors, the stakes are higher. You're often giving them your most sensitive business data to train models on, process in real time, or store indefinitely. You're depending on underlying model providers (OpenAI, Anthropic, Google) whose own terms and pricing can change without notice. And you're betting that capabilities that seem mature today will still be competitive in 12 months.

This checklist covers everything you should verify before committing to any AI vendor contract.

---

## Section 1: Data Practices

These questions determine whether your data is being used to train competitors' models or exposing your company to compliance risk.

### 1.1 Training Data Opt-Out

**Ask:** Does our data get used to train or fine-tune any models — yours or your underlying model providers'?

**Red flags:**
- "We use data to improve our service" without a clear definition of "improve"
- No explicit opt-out in the contract
- Terms that say model training is prohibited but don't define how prompts/outputs are handled

**What good looks like:** A clear data processing addendum (DPA) stating that your data is not used for model training, with the same guarantee passed through to all sub-processors.

### 1.2 Data Residency and Storage

**Ask:** Where is our data stored and processed? Can we specify a region?

**Ask:** What data do you retain after our subscription ends, and for how long?

**Red flags:**
- No SOC 2 Type II report available
- Data processed in regions where you have compliance requirements (GDPR for EU customers, HIPAA for healthcare)
- Retention policy buried in ToS rather than explicitly in the contract

### 1.3 Sub-Processor Disclosure

**Ask:** Who are all the sub-processors that touch our data, specifically which LLM providers?

Most AI vendors use OpenAI, Anthropic, Cohere, or other foundation model providers. Each of those has its own data handling policy. You're agreeing to all of them.

**What good looks like:** A maintained sub-processor list (often at `/legal/subprocessors`) that updates with notice when sub-processors change.

---

## Section 2: Pricing and Contract Terms

AI pricing is particularly prone to unexpected costs at scale.

### 2.1 Usage-Based Pricing Clarity

Many AI tools charge per token, per API call, per "run," or per output. Before signing:

- **Get specific numbers:** How many tokens/calls does your typical workflow consume?
- **Request a usage estimate:** Reputable vendors will estimate your monthly bill based on your use case.
- **Cap your exposure:** Negotiate a spending cap or alert threshold in your contract.

**Red flag:** Vendors who can't give you a usage estimate or refuse to include a spend cap.

### 2.2 Automatic Annual Renewals

Most SaaS contracts auto-renew annually. AI contracts often have the same clause, but with less flexibility.

**What to negotiate:**
- 60-90 day cancellation window (not 30)
- Price lock for the first renewal term
- No surprise "model upgrade" fees that count against your usage allowance

### 2.3 Fair Use and Acceptable Use Policies

AI vendors typically include Acceptable Use Policies (AUPs) that are broader than you expect. These can affect:

- Which industries can use the product
- What content the AI can and cannot generate for you
- Whether you can use outputs for training your own models

Read these carefully. They're often more restrictive than the marketing materials suggest.

---

## Section 3: Security Posture

### 3.1 Certifications to Require

At minimum, ask for:

- **SOC 2 Type II** — The baseline. If they don't have it, walk away.
- **ISO 27001** — Standard for larger enterprise evaluations.
- **GDPR/CCPA compliance documentation** — Required if you handle EU or California consumer data.
- **HIPAA BAA** — Required if you're in healthcare.

**Verify, don't just ask.** Ask for the actual report, not just confirmation that they "have" compliance. Certificates expire. Check the date.

### 3.2 Penetration Testing

**Ask:** When was your last third-party penetration test? Can I see the executive summary?

Reputable vendors will share pen test executive summaries under NDA. If they refuse entirely, that's a red flag.

### 3.3 Incident Response

**Ask:** What is your incident response process? How and when would you notify us of a breach affecting our data?

**What good looks like:** A defined SLA for breach notification (72 hours is the GDPR standard), a named security contact, and a clear escalation path.

---

## Section 4: Reliability and Performance

### 4.1 SLA and Uptime History

**Ask:** What SLA do you offer, and what does it cover?

Many AI vendors offer 99.5% or 99.9% SLAs — but the fine print often excludes:
- Scheduled maintenance windows
- Issues caused by underlying model providers
- Degraded performance (slow responses count as "up")

**Also ask:** Can I see your public status page history for the last 3 months?

Tools like Statuspage.io show real incident history. If they don't have a public status page, that's a signal.

### 4.2 Model Versioning and Deprecation

AI vendors frequently update their underlying models, which can change output behavior without warning. This matters if your workflows depend on consistent output format.

**Ask:**
- How will we be notified before model versions change?
- Can we pin to a specific model version?
- What is your deprecation policy for older models?

### 4.3 Rate Limits and Throttling

**Ask:** What rate limits apply to our plan? How will we be notified if we're approaching limits?

Hitting rate limits in production can break workflows silently. Know the limits before you deploy.

---

## Section 5: Competitive and Strategic Risk

### 5.1 Vendor Concentration Risk

If this vendor is acquired, pivots, or fails, what happens to your workflows?

**Questions to consider:**
- Is this functionality available from multiple vendors, or are you locked in?
- What is the data portability policy if you want to leave?
- Can you export all your data in a standard format?

### 5.2 Underlying Model Dependency

Most AI SaaS products are wrappers on foundation models from OpenAI, Anthropic, or Google. If those providers change their pricing or capabilities, your vendor will pass that through.

**Ask:** Which underlying models does your product use, and how would a price increase from those providers affect your pricing?

Some vendors absorb price changes for the contract term. Others pass them through immediately.

### 5.3 Reference Checks

Before signing, ask for two or three customer references in your industry. Specifically ask those references:

- Have you had any data or security incidents with this vendor?
- How has their pricing changed over your contract period?
- Has model performance degraded or changed in ways that affected your workflows?

---

## The Quick Veto List

If any of these are true, don't proceed without significant contractual protection:

- No SOC 2 Type II report
- No explicit training data opt-out in the DPA
- No sub-processor list
- No public status page or uptime history
- Pricing that's entirely usage-based with no caps
- No data portability/export capability
- No clear breach notification SLA

---

## Using Trackr for Vendor Research

Before you even get to contract negotiation, you need to know if a vendor is worth your time. Trackr automates the research phase — pulling data from G2, Capterra, Reddit, Crunchbase, and the vendor's own documentation — to give you a structured report on security posture, user sentiment, pricing reputation, and competitive alternatives.

Running an initial Trackr report takes about 90 seconds and costs a fraction of the time you'd spend doing the same research manually. It won't replace your security team's evaluation, but it will tell you whether a vendor is worth that evaluation in the first place.

[Research any AI tool for free →](/sign-up)
