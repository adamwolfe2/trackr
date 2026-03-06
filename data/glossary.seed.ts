export type GlossaryTerm = {
  term: string;
  slug: string;
  definition: string;
  longDefinition: string;
  relatedTerms: string[];
  faqs: { q: string; a: string }[];
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // A
  {
    term: "Annual Contract Value",
    slug: "annual-contract-value",
    definition: "The normalized yearly revenue from a single customer contract, regardless of whether payment is monthly or annual.",
    longDefinition:
      "Annual Contract Value (ACV) is a sales and finance metric that represents the average annualized revenue of a customer contract, excluding one-time fees. For a two-year contract worth $24,000 total, the ACV is $12,000. It gives sales and finance teams a consistent basis for comparing deals of different durations.\n\nACV is often confused with ARR (Annual Recurring Revenue). The key difference: ARR reflects the total recurring revenue of all active customers at a point in time, while ACV is a per-contract or per-customer figure. ACV is most useful for evaluating individual deal size, while ARR describes the health of the entire revenue base.\n\nFor SaaS procurement, understanding ACV helps benchmark whether your vendor contract is priced in line with market rates. Trackr surfaces ACV data for tools in your stack so you can identify contracts that have drifted above market during renewals.",
    relatedTerms: ["arr", "renewal-management", "total-cost-of-ownership"],
    faqs: [
      { q: "How is ACV different from ARR?", a: "ACV is the annualized value of a single contract; ARR is the sum of all recurring revenue across all active customers at a given point in time." },
      { q: "Should ACV include implementation fees?", a: "No. ACV typically excludes one-time fees like implementation, professional services, or setup charges, including only recurring contract value." },
    ],
  },
  {
    term: "API",
    slug: "api",
    definition: "An Application Programming Interface — a defined set of rules that lets two software systems communicate and exchange data programmatically.",
    longDefinition:
      "An API (Application Programming Interface) is a contract between two software systems that defines how they can exchange data and trigger actions. When a tool offers an API, it means other systems can read from it, write to it, or automate workflows without manual intervention.\n\nIn the context of tool evaluation, API quality is a critical dimension. A tool with a well-documented, versioned REST or GraphQL API integrates cleanly with your existing stack. A tool with a limited or undocumented API creates data silos — information stays locked inside it and cannot flow to your CRM, data warehouse, or reporting layer.\n\nKey API evaluation criteria include: rate limits, authentication method (API key vs OAuth), webhook support, and whether the API is read-only or supports writes. Tools that expose only read APIs cannot be automated as deeply as those offering full CRUD operations.",
    relatedTerms: ["sdk", "oauth", "integration-depth"],
    faqs: [
      { q: "What is a REST API?", a: "A REST API is an API that follows Representational State Transfer conventions, using standard HTTP methods (GET, POST, PUT, DELETE) and returning data typically in JSON format." },
      { q: "Why does API quality matter in tool evaluation?", a: "Poor API quality means your tool cannot integrate with the rest of your stack, forcing manual data entry and preventing automation — both of which increase operational cost." },
    ],
  },
  {
    term: "ARR",
    slug: "arr",
    definition: "Annual Recurring Revenue — the normalized, annualized value of all active subscription contracts at a given point in time.",
    longDefinition:
      "Annual Recurring Revenue (ARR) is the foundational SaaS revenue metric. It represents the predictable, recurring portion of a company's revenue, annualized regardless of billing frequency. A customer paying $1,000/month contributes $12,000 to ARR. A customer on a $30,000 two-year contract contributes $15,000/year to ARR.\n\nARR is used by investors and operators to measure the scale and growth trajectory of a SaaS business. ARR growth rate, ARR per employee, and ARR churn are the core indicators of business health. A company growing ARR 100%+ year-over-year is considered hypergrowth.\n\nFor procurement teams, understanding your vendor's ARR trajectory matters. A vendor with declining ARR may be at risk of being acquired, shutting down, or cutting support resources — all vendor risk signals that should factor into multi-year contract decisions.",
    relatedTerms: ["mrr", "nrr", "churn-rate"],
    faqs: [
      { q: "How do you calculate ARR?", a: "Multiply monthly recurring revenue (MRR) by 12. Alternatively, sum the annualized value of all active subscription contracts." },
      { q: "Does ARR include one-time fees?", a: "No. ARR only includes recurring subscription revenue. One-time implementation fees, professional services, and usage-based overages are excluded." },
    ],
  },
  // C
  {
    term: "CAC",
    slug: "cac",
    definition: "Customer Acquisition Cost — the total sales and marketing spend required to acquire one new paying customer.",
    longDefinition:
      "Customer Acquisition Cost (CAC) measures the efficiency of a company's go-to-market motion. It is calculated by dividing total sales and marketing spend in a period by the number of new customers acquired in the same period. A company spending $500,000 on sales and marketing to acquire 100 new customers has a CAC of $5,000.\n\nCAC must always be evaluated alongside LTV (Lifetime Value). A healthy SaaS business typically targets an LTV:CAC ratio of 3:1 or higher. If CAC exceeds LTV, the business is losing money on each customer it acquires.\n\nFor RevOps and marketing ops teams, reducing CAC is one of the primary ROI justifications for AI tools. Automation tools that qualify leads faster, personalize outreach at scale, or reduce sales cycle length all reduce CAC. When evaluating such tools, model the expected improvement in conversion rates or cycle length against the tool's total cost of ownership.",
    relatedTerms: ["ltv", "arr", "product-led-growth"],
    faqs: [
      { q: "What is a good CAC for SaaS?", a: "It depends on the segment. SMB SaaS typically targets CAC under $500; mid-market under $5,000; enterprise CAC can run $50,000 or more. The key ratio is LTV:CAC, which should exceed 3:1." },
      { q: "How do AI tools reduce CAC?", a: "AI tools reduce CAC by automating lead qualification, personalizing outreach, shortening sales cycles, and improving conversion rates at each stage of the funnel." },
    ],
  },
  {
    term: "CDP",
    slug: "cdp",
    definition: "A Customer Data Platform — a system that unifies customer data from multiple sources into a single persistent profile usable by marketing, sales, and product teams.",
    longDefinition:
      "A Customer Data Platform (CDP) ingests data from every touchpoint — web, mobile, email, CRM, support — and resolves it into unified customer profiles. Unlike a CRM, which is primarily a sales tool, or a DMP (Data Management Platform) focused on advertising audiences, a CDP is designed to power personalization and analytics across all customer-facing systems.\n\nCDPs are evaluated on identity resolution quality (how accurately they stitch together cross-device and cross-channel data), integrations (how many source systems they can ingest from), and activation capabilities (how easily you can push segments to downstream tools).\n\nFor data and operations teams considering a CDP, the primary evaluation questions are: Does it replace an existing warehouse or complement it? How does it handle GDPR and CCPA consent? And does its identity resolution approach match your customer data model? A poor CDP fit can create more data fragmentation than it solves.",
    relatedTerms: ["crm", "etl", "sso"],
    faqs: [
      { q: "What is the difference between a CDP and a CRM?", a: "A CRM is a sales and relationship management tool built around accounts and contacts. A CDP is a data infrastructure layer that unifies behavioral and transactional data across all channels into persistent customer profiles." },
      { q: "Do small companies need a CDP?", a: "Typically not until you have multiple customer touchpoints generating meaningful data. Most companies under $10M ARR get more value from strengthening their CRM and analytics stack before adding a CDP." },
    ],
  },
  {
    term: "Churn Rate",
    slug: "churn-rate",
    definition: "The percentage of customers or revenue lost in a given period, measured monthly or annually.",
    longDefinition:
      "Churn rate is the most critical health metric for a subscription business. Customer churn measures the percentage of customers who cancel in a period; revenue churn measures the percentage of recurring revenue lost. These two numbers can diverge significantly — a vendor losing small customers while retaining large ones may have high customer churn but low revenue churn.\n\nMonthly churn of even 2% compounds to roughly 22% annual customer loss. Most successful SaaS businesses target monthly logo churn below 1% and annual net revenue retention above 100% (meaning expansion revenue from existing customers more than offsets cancellations).\n\nWhen evaluating software vendors, churn signals on review platforms are a leading indicator of product quality. A vendor with a high volume of recent negative reviews citing cancellations, pricing disputes, or support failures warrants deeper vendor risk assessment before committing to a multi-year contract.",
    relatedTerms: ["nrr", "arr", "renewal-management"],
    faqs: [
      { q: "What is a good annual churn rate for SaaS?", a: "Best-in-class SaaS companies target annual logo churn below 5-10%. Enterprise-focused SaaS often achieves below 5% due to high switching costs and longer sales cycles." },
      { q: "What is the difference between gross and net revenue churn?", a: "Gross revenue churn counts only the revenue lost from cancellations and downgrades. Net revenue churn subtracts expansion revenue from existing customers — a negative net churn means the base is growing even before new sales." },
    ],
  },
  {
    term: "Cloud Cost Optimization",
    slug: "cloud-cost-optimization",
    definition: "The practice of reducing cloud infrastructure and SaaS spend without degrading performance or capability.",
    longDefinition:
      "Cloud cost optimization encompasses rightsizing compute and storage resources, eliminating idle infrastructure, negotiating reserved instance pricing, and auditing SaaS licenses for underutilization. As organizations scale, cloud costs tend to grow faster than revenue unless actively managed.\n\nCommon cloud cost optimization levers include: shutting down idle development environments, moving infrequently accessed data to cheaper storage tiers, consolidating redundant SaaS tools, renegotiating contracts at renewal, and implementing usage-based governance policies.\n\nFor operations teams, cloud cost optimization is increasingly a board-level priority. Public companies routinely cite 'cloud cost efficiency' as a key leverage point during downturns. The first step is always a comprehensive inventory — you cannot optimize what you cannot measure. Trackr provides the SaaS layer of this inventory, tracking spend and utilization across your tool portfolio.",
    relatedTerms: ["total-cost-of-ownership", "shadow-it", "software-asset-management"],
    faqs: [
      { q: "What are the biggest sources of cloud waste?", a: "Idle or oversized compute instances, orphaned storage volumes, unused SaaS licenses, and duplicate tools performing the same function are consistently the largest sources of avoidable cloud spend." },
      { q: "How often should you audit cloud costs?", a: "At minimum quarterly, with deeper annual reviews aligned to budget cycles. Fast-growing companies often benefit from monthly cost reviews as their usage patterns shift rapidly." },
    ],
  },
  {
    term: "CRM",
    slug: "crm",
    definition: "Customer Relationship Management — software that centralizes customer and prospect data, sales pipeline, and communication history for sales and success teams.",
    longDefinition:
      "A CRM is the operational core of any sales and customer success team. It stores contact and account records, tracks deal stages and pipeline value, logs communication history, and surfaces tasks and reminders. Modern CRMs also offer email sequencing, forecasting, and AI-assisted scoring.\n\nCRM evaluation is among the highest-stakes tool decisions an organization makes because of its deep integration surface area. A CRM touches email, calendar, marketing automation, support, billing, and analytics. Switching CRMs is expensive and disruptive, making vendor lock-in risk a primary evaluation criterion.\n\nKey CRM evaluation dimensions include: data model flexibility (can it support your specific go-to-market motion?), API quality for custom integrations, reporting depth, mobile usability, and total cost at your projected seat count. For growing companies, evaluate not just current needs but where the tool must be in three years.",
    relatedTerms: ["cdp", "hris", "erp"],
    faqs: [
      { q: "What is the difference between a CRM and a CDP?", a: "A CRM manages relationships and pipeline for sales and success teams. A CDP unifies behavioral data across all channels into persistent profiles for personalization. They serve different functions and are often used together." },
      { q: "When should a company invest in a CRM?", a: "As soon as a sales team has more than one person and is tracking more than a handful of active deals. Spreadsheets do not scale and introduce data loss risk from day one." },
    ],
  },
  // E
  {
    term: "EDR",
    slug: "edr",
    definition: "Endpoint Detection and Response — security software that monitors devices for threats, records behavioral telemetry, and enables rapid investigation and remediation.",
    longDefinition:
      "EDR solutions run agents on endpoints (laptops, servers, workstations) to continuously collect behavioral data — process creation, network connections, file modifications — and analyze it for indicators of compromise. When a threat is detected, EDR provides the forensic timeline needed to understand what happened and contain the damage.\n\nEDR has largely replaced legacy antivirus as the baseline endpoint security control for companies above startup stage. Key evaluation dimensions include detection efficacy (measured by MITRE ATT&CK test results), mean time to detection, false positive rate, and integration with your SIEM for centralized alerting.\n\nFor procurement teams evaluating EDR vendors, ensure coverage extends to all endpoint types in your environment — Windows, macOS, Linux, and cloud workloads. Gaps in coverage create blind spots that attackers actively exploit.",
    relatedTerms: ["siem", "mdr", "xdr"],
    faqs: [
      { q: "What is the difference between EDR and antivirus?", a: "Antivirus uses signature-based detection to block known malware. EDR uses behavioral analysis to detect novel and fileless threats, and provides the forensic detail needed to investigate and remediate incidents." },
      { q: "Do SMBs need EDR?", a: "Yes. EDR is no longer enterprise-only. Several vendors offer affordable, managed EDR (MDR) options designed for companies without dedicated security teams." },
    ],
  },
  {
    term: "Embeddings",
    slug: "embeddings",
    definition: "Numerical vector representations of text, images, or other data that capture semantic meaning and enable similarity search.",
    longDefinition:
      "Embeddings convert unstructured data — text, images, code — into dense numerical vectors in a high-dimensional space. Semantically similar items are placed close together in this space, enabling similarity search: given a query, find the most semantically relevant documents even if they share no exact keywords.\n\nEmbeddings are the foundation of Retrieval-Augmented Generation (RAG) architectures. When a user asks a question, the system embeds the query, searches a vector database for the nearest matching document chunks, and passes those chunks as context to a language model. This allows LLMs to answer questions about proprietary data without retraining.\n\nFor teams evaluating AI tools that use embeddings, key questions include: Which embedding model is used? How are embeddings updated when source documents change? What vector database stores the index? And how does the system handle embedding drift when models are updated?",
    relatedTerms: ["rag", "vector-database", "llm"],
    faqs: [
      { q: "What are embeddings used for?", a: "Embeddings power semantic search, recommendation systems, document clustering, anomaly detection, and RAG architectures that ground LLM responses in proprietary data." },
      { q: "How are embeddings stored?", a: "Embeddings are stored in vector databases such as Pinecone, Weaviate, pgvector, or Qdrant, which support approximate nearest-neighbor search at scale." },
    ],
  },
  {
    term: "ERP",
    slug: "erp",
    definition: "Enterprise Resource Planning — integrated software that manages core business processes including finance, supply chain, manufacturing, HR, and procurement in a single system.",
    longDefinition:
      "An ERP is the backbone system of record for operational and financial data in a mid-size or large enterprise. It unifies processes that otherwise live in separate systems: general ledger, accounts payable, purchase orders, inventory, payroll, and project accounting. Integration is its primary value — data entered once propagates throughout the organization.\n\nERP implementations are among the highest-risk IT projects. They require extensive configuration, data migration, change management, and ongoing support. Failed ERP implementations have cost companies hundreds of millions of dollars and are frequently cited in litigation. Rigorous evaluation, phased rollout, and strong internal ownership are critical success factors.\n\nFor SaaS-native companies, lightweight ERP alternatives (sometimes called 'modern ERP' or 'finance suites') offer a subset of ERP functionality without the implementation complexity. Evaluate whether you need the full ERP surface or whether best-of-breed tools (accounting + HR + procurement) can meet your needs at lower risk.",
    relatedTerms: ["hris", "crm", "total-cost-of-ownership"],
    faqs: [
      { q: "When does a company need an ERP?", a: "Typically when separate systems for finance, inventory, and operations create reconciliation pain and a single source of truth is needed. Most companies reach this point between $20M-$100M in revenue." },
      { q: "What is the difference between ERP and CRM?", a: "ERP manages internal operations and financial data. CRM manages external relationships and the revenue process. They are complementary systems that are typically integrated at larger organizations." },
    ],
  },
  {
    term: "ETL",
    slug: "etl",
    definition: "Extract, Transform, Load — a data pipeline process that moves data from source systems, transforms it into a consistent format, and loads it into a target data warehouse or database.",
    longDefinition:
      "ETL (Extract, Transform, Load) is the standard pattern for populating data warehouses and analytics platforms. The extract phase pulls raw data from source systems — databases, APIs, SaaS tools. The transform phase cleans, enriches, and reshapes the data into a consistent schema. The load phase writes the transformed data to the target system.\n\nModern ETL has largely been replaced or supplemented by ELT (Extract, Load, Transform), where raw data is loaded first and transformed inside the warehouse using SQL. Tools like dbt enable the T step to be version-controlled and tested like application code.\n\nFor data and operations teams evaluating ETL tools, key criteria include: the breadth of native connectors to your source systems, transformation flexibility, monitoring and alerting for pipeline failures, and total cost at your data volume. Gaps in ETL coverage create manual data work and reporting delays.",
    relatedTerms: ["cdp", "vector-database", "erp"],
    faqs: [
      { q: "What is the difference between ETL and ELT?", a: "ETL transforms data before loading it into the warehouse. ELT loads raw data first and transforms it inside the warehouse. ELT is now more common because modern cloud warehouses are powerful enough to handle transformations at scale." },
      { q: "What are common ETL tools?", a: "Fivetran, Airbyte, Stitch, and Informatica are widely used ETL/ELT platforms. dbt handles the transformation layer specifically and is often used alongside these ingestion tools." },
    ],
  },
  // F
  {
    term: "FERPA",
    slug: "ferpa",
    definition: "Family Educational Rights and Privacy Act — a US federal law that protects the privacy of student education records and limits their disclosure.",
    longDefinition:
      "FERPA applies to any educational institution receiving federal funding and governs access to student education records including grades, enrollment data, financial aid, and disciplinary records. Students (or parents of minor students) have the right to inspect their records, request corrections, and restrict disclosure to third parties.\n\nFor EdTech vendors, FERPA compliance is a baseline requirement for selling to K-12 districts and universities. Vendors must demonstrate that student data will not be used for advertising, will be retained only as long as necessary, and will be deleted upon request. Many districts require vendors to sign a FERPA-compliant data processing agreement before purchasing.\n\nWhen evaluating EdTech tools, confirm: Does the vendor sign a DPA? Are student PII handling practices documented? Does the vendor sub-process data through third parties who are also FERPA-compliant? Gaps here create institutional liability.",
    relatedTerms: ["gdpr", "hipaa", "soc-2"],
    faqs: [
      { q: "Who does FERPA apply to?", a: "FERPA applies to educational institutions that receive federal funding — essentially all public K-12 schools and most colleges and universities in the United States." },
      { q: "Can schools share student data with EdTech vendors?", a: "Yes, under the school official exception, but only for tools with a legitimate educational interest. Vendors must agree not to use the data for non-educational purposes." },
    ],
  },
  {
    term: "Fine-Tuning",
    slug: "fine-tuning",
    definition: "The process of further training a pre-trained AI model on a domain-specific dataset to improve its performance on a narrow task.",
    longDefinition:
      "Fine-tuning takes a foundation model — already trained on massive general corpora — and continues training it on a smaller, curated dataset relevant to a specific domain or task. The result is a model that retains broad language understanding but performs significantly better on the target task than the base model would.\n\nCommon fine-tuning use cases include: customer support automation (train on historical ticket data), document classification, domain-specific code generation, and tone/style consistency for brand voice. Fine-tuning is appropriate when prompt engineering alone cannot achieve the required output quality.\n\nFor teams evaluating AI tools that offer fine-tuning, key questions include: Who owns the fine-tuned weights? Is your training data used to improve the vendor's base model? What is the minimum dataset size required? And what is the per-inference cost premium vs the base model? These answers significantly affect ROI.",
    relatedTerms: ["foundation-model", "prompt-engineering", "llm"],
    faqs: [
      { q: "Is fine-tuning better than prompt engineering?", a: "For narrow, repetitive tasks where output format is critical, fine-tuning can outperform even sophisticated prompts. For general tasks and rapid iteration, prompt engineering is faster and cheaper to implement." },
      { q: "Does fine-tuning require a lot of data?", a: "Modern fine-tuning techniques like LoRA can work with as few as a few hundred high-quality examples. The key is data quality and relevance rather than raw volume." },
    ],
  },
  {
    term: "Foundation Model",
    slug: "foundation-model",
    definition: "A large AI model trained on broad, diverse data at massive scale that can be adapted to a wide range of downstream tasks.",
    longDefinition:
      "Foundation models — including GPT-4, Claude, Gemini, and Llama — are trained on internet-scale corpora using self-supervised learning. The resulting models develop emergent capabilities across language, reasoning, code, and structured data tasks that were not explicitly trained. They serve as the base for a broad ecosystem of downstream applications.\n\nThe foundation model landscape is evolving rapidly. Open-weight models (Llama, Mistral) allow organizations to run inference on their own infrastructure, avoiding data privacy concerns associated with API-based models. Closed API models offer state-of-the-art performance without infrastructure overhead.\n\nFor teams evaluating AI tools built on foundation models, the underlying model choice affects capability ceiling, cost, latency, and compliance posture. A tool built on a cheap, fast model may underperform on complex reasoning tasks. A tool requiring data to leave your infrastructure to a third-party API may fail security review in regulated industries.",
    relatedTerms: ["llm", "fine-tuning", "rag"],
    faqs: [
      { q: "What is the difference between a foundation model and an LLM?", a: "All LLMs are foundation models, but not all foundation models are LLMs. Foundation model is the broader category — it includes text, image, audio, and multimodal models. LLM specifically refers to language-focused models." },
      { q: "Should companies use open-weight or proprietary foundation models?", a: "Open-weight models offer data privacy and cost advantages. Proprietary API models offer better performance and lower operational overhead. The choice depends on compliance requirements, performance needs, and engineering capacity." },
    ],
  },
  {
    term: "Freemium",
    slug: "freemium",
    definition: "A pricing model that offers a permanently free tier alongside paid plans, using the free product as the primary acquisition channel.",
    longDefinition:
      "Freemium is a product-led growth strategy where a subset of product functionality is available indefinitely at no charge. Users self-serve through the free tier and convert to paid plans when they hit limits or need advanced features. Unlike free trials with expiration dates, freemium has no time pressure — conversion happens when users reach natural value ceilings.\n\nFreemium economics depend on high conversion rates from free to paid among users who activate deeply, and low marginal cost to serve free users. Slack, Dropbox, and Notion built dominant market positions on freemium. It works best when the core value can be delivered at low unit cost and network effects or collaboration features drive viral expansion.\n\nFor procurement teams, freemium tools are excellent for stakeholder buy-in — teams self-adopt, prove value, and then request paid upgrades. The evaluation risk is that free-tier adoption creates shadow IT. Establish a process for tracking which freemium tools are in use before their presence is discovered during a security audit.",
    relatedTerms: ["product-led-growth", "usage-based-pricing", "seat-based-pricing"],
    faqs: [
      { q: "What is the difference between freemium and a free trial?", a: "A free trial has a time limit after which the user must pay or lose access. Freemium has no time limit — a subset of functionality is free forever, with upgrades required for advanced features or higher limits." },
      { q: "What are the risks of freemium tools for enterprises?", a: "Freemium enables shadow IT — teams adopt tools without security review or procurement approval. Enterprise freemium tiers often lack the SSO, audit logging, and data residency controls required by security and compliance teams." },
    ],
  },
  // G
  {
    term: "GDPR",
    slug: "gdpr",
    definition: "General Data Protection Regulation — the EU regulation governing how organizations collect, process, store, and transfer personal data of EU residents.",
    longDefinition:
      "GDPR, effective May 2018, establishes the most comprehensive personal data protection framework in the world. It applies to any organization that processes the personal data of EU residents, regardless of where the organization is based. Key obligations include: obtaining lawful basis for processing, honoring data subject rights (access, erasure, portability), appointing a DPO in certain cases, and notifying regulators within 72 hours of a data breach.\n\nFor software procurement, GDPR compliance is a threshold requirement for any tool that processes EU employee or customer data. Vendors must be able to provide a Data Processing Agreement (DPA), document their sub-processors, and demonstrate Standard Contractual Clauses (SCCs) for cross-border data transfers.\n\nNon-compliance carries fines up to 4% of global annual revenue or €20M, whichever is higher. Several major enforcement actions have exceeded €100M. Procurement teams should treat GDPR review as a hard gate in the vendor evaluation process, not an afterthought.",
    relatedTerms: ["hipaa", "soc-2", "ferpa"],
    faqs: [
      { q: "Does GDPR apply to US companies?", a: "Yes. GDPR applies to any organization that processes personal data of EU residents, regardless of the company's location. If you have EU customers or employees, GDPR applies to you." },
      { q: "What is a Data Processing Agreement (DPA)?", a: "A DPA is a contract between a data controller (you) and a data processor (your vendor) that defines how personal data will be processed, protected, and deleted. It is required under GDPR for any vendor that processes personal data on your behalf." },
    ],
  },
  {
    term: "Gross Margin",
    slug: "gross-margin",
    definition: "The percentage of revenue remaining after subtracting the direct cost of delivering the product or service.",
    longDefinition:
      "Gross margin is calculated as (Revenue - Cost of Goods Sold) / Revenue. For SaaS businesses, COGS primarily includes hosting and infrastructure costs, third-party API fees (including AI inference), payment processing fees, and the cost of implementation or customer success resources directly tied to delivery.\n\nHigh gross margin is a defining characteristic of software businesses. Best-in-class SaaS companies target 70-80%+ gross margins. Infrastructure-heavy AI products often have lower gross margins due to inference costs — this is an important signal when evaluating AI-native vendors, as thin margins create pricing pressure over time.\n\nFor procurement teams, understanding vendor gross margin dynamics helps assess pricing stability. A vendor under margin pressure is more likely to raise prices, cut support, or seek acquisition. Vendors with high gross margins have more flexibility to invest in product and maintain pricing commitments through multi-year contracts.",
    relatedTerms: ["arr", "churn-rate", "mrr"],
    faqs: [
      { q: "What is a good gross margin for SaaS?", a: "Best-in-class SaaS targets 70-80%+ gross margin. AI-native products often run 50-65% due to inference costs. Below 50% typically indicates significant infrastructure or service delivery costs that may pressure future pricing." },
      { q: "How does AI inference cost affect gross margin?", a: "Every API call to an LLM or AI service has a variable cost. As AI tools scale, inference costs can erode gross margins significantly unless the vendor optimizes model choice, caching, and prompt efficiency." },
    ],
  },
  // H
  {
    term: "Hallucination",
    slug: "hallucination",
    definition: "When an AI model generates confident, fluent output that is factually incorrect or entirely fabricated.",
    longDefinition:
      "Hallucination is a fundamental limitation of large language models. Because LLMs predict the next most likely token given their training, they can generate plausible-sounding text that is factually wrong — inventing citations, misquoting statistics, fabricating product features, or asserting events that never occurred.\n\nHallucination rate varies significantly by task and model. Tasks requiring precise factual recall (citing specific data points, naming exact figures) are more prone to hallucination than tasks requiring synthesis or reasoning. RAG architectures reduce hallucination by grounding responses in retrieved source documents rather than model memory alone.\n\nFor teams evaluating AI tools, testing for hallucination on your specific use case is essential. Ask the tool questions where you know the ground truth. Count errors. A low hallucination rate on general benchmarks does not guarantee acceptable performance on your domain-specific content. Build evaluation sets and test before committing to a vendor.",
    relatedTerms: ["rag", "llm", "prompt-engineering"],
    faqs: [
      { q: "Can hallucination be eliminated?", a: "Not entirely. It can be substantially reduced through RAG, tool-calling (grounding in real-time data), constrained output formats, and chain-of-thought prompting, but some residual hallucination rate remains in all current models." },
      { q: "How do you test an AI tool for hallucination?", a: "Build a benchmark set of questions with known ground-truth answers. Run the tool against this set and measure the error rate. Repeat with questions about your proprietary data, processes, and products." },
    ],
  },
  {
    term: "HIPAA",
    slug: "hipaa",
    definition: "Health Insurance Portability and Accountability Act — US law establishing standards for protecting sensitive patient health information (PHI) from disclosure without consent.",
    longDefinition:
      "HIPAA applies to covered entities (healthcare providers, insurers, clearinghouses) and their business associates — any vendor that creates, receives, maintains, or transmits Protected Health Information (PHI) on their behalf. Business associates must sign a Business Associate Agreement (BAA) and implement administrative, physical, and technical safeguards.\n\nFor software procurement in healthcare or any company handling employee health data, HIPAA compliance is a hard gate. Vendors must provide a BAA, demonstrate encryption in transit and at rest, support audit logging, and have incident response procedures. Many mainstream SaaS vendors explicitly disclaim HIPAA coverage in their standard terms.\n\nPenalties for HIPAA violations range from $100 to $50,000 per violation, with annual caps and potential criminal liability for willful neglect. Before adding any tool that touches employee or patient health data, confirm BAA availability and scope of PHI handling.",
    relatedTerms: ["gdpr", "soc-2", "ferpa"],
    faqs: [
      { q: "What is a Business Associate Agreement?", a: "A BAA is a contract required by HIPAA between a covered entity and a vendor (business associate) that processes PHI. It defines how PHI will be used, protected, and reported in the event of a breach." },
      { q: "Does HIPAA apply to HR health data?", a: "Yes. Employee health information held by employers (such as medical leave records, disability accommodations, or benefits data) is subject to HIPAA protections when handled by covered entities and their business associates." },
    ],
  },
  {
    term: "HRIS",
    slug: "hris",
    definition: "Human Resource Information System — software that manages employee data, payroll, benefits, onboarding, and HR workflows in a centralized platform.",
    longDefinition:
      "An HRIS is the system of record for all employee-related data: org structure, job titles, compensation, benefits enrollment, performance reviews, time off, and compliance documentation. Modern HRIS platforms increasingly include recruiting (ATS), payroll processing, and learning management as native modules.\n\nHRIS selection is high-stakes because it handles sensitive employee data subject to GDPR, state privacy laws, and in some cases HIPAA. It also integrates deeply with payroll providers, benefits administrators, and identity systems (SSO/SCIM provisioning). Switching costs are high due to data migration complexity and employee retraining.\n\nWhen evaluating HRIS vendors, pay particular attention to: SCIM provisioning quality for automated employee onboarding/offboarding in connected SaaS tools, international payroll capabilities if you have global headcount, and the mobile experience for frontline workers if applicable.",
    relatedTerms: ["erp", "sso", "gdpr"],
    faqs: [
      { q: "What is the difference between HRIS and HCM?", a: "HRIS typically refers to the core employee data and process system. HCM (Human Capital Management) is a broader term that includes strategic talent management capabilities like succession planning, workforce analytics, and learning." },
      { q: "How does HRIS connect to SaaS provisioning?", a: "Modern HRIS platforms support SCIM (System for Cross-domain Identity Management) to automatically create and deactivate user accounts across connected SaaS tools when employees join, change roles, or leave. This prevents orphaned license accumulation." },
    ],
  },
  // I
  {
    term: "IaaS",
    slug: "iaas",
    definition: "Infrastructure as a Service — cloud computing that provides virtualized compute, storage, and networking resources on-demand, billed by consumption.",
    longDefinition:
      "IaaS providers — AWS, Azure, GCP — deliver raw infrastructure building blocks: virtual machines, object storage, managed databases, load balancers, and networking. Unlike PaaS or SaaS, IaaS requires customers to manage operating systems, middleware, runtimes, and applications, providing maximum flexibility at the cost of operational overhead.\n\nIaaS is the foundation layer on which most SaaS products are built. For organizations evaluating their cloud strategy, IaaS costs represent a significant and growing line item. Key optimization levers include: Reserved Instances or Savings Plans (1-3 year commitments for 30-60% discounts), rightsizing underutilized instances, and enforcing tagging policies to enable cost attribution.\n\nMulti-cloud IaaS strategies are increasingly common for resilience and vendor negotiation leverage, but introduce significant operational complexity. Evaluate whether multi-cloud operational overhead is justified by your specific resilience or data sovereignty requirements before committing.",
    relatedTerms: ["paas", "saas", "cloud-cost-optimization"],
    faqs: [
      { q: "What is the difference between IaaS, PaaS, and SaaS?", a: "IaaS provides raw infrastructure you manage yourself. PaaS provides a managed platform for deploying applications. SaaS delivers fully managed applications you use directly. Each layer trades control for convenience." },
      { q: "When should a company use IaaS vs PaaS?", a: "Use IaaS when you need fine-grained control over infrastructure configuration, specific compliance requirements around data residency, or are running workloads that do not fit standard PaaS abstractions." },
    ],
  },
  {
    term: "ITSM",
    slug: "itsm",
    definition: "IT Service Management — the practice and tools for designing, delivering, managing, and improving IT services aligned to business needs.",
    longDefinition:
      "ITSM encompasses the processes and technologies used to manage the full lifecycle of IT services: service request management, incident management, change management, problem management, and asset management. The ITIL framework is the most widely adopted ITSM methodology, providing a structured vocabulary and process model.\n\nITSM platforms (ServiceNow, Jira Service Management, Freshservice) are the operational hub for IT teams. They receive employee requests, track hardware and software assets, manage change approval workflows, and maintain a configuration management database (CMDB) of all IT assets and their relationships.\n\nFor companies scaling from startup to mid-market, ITSM investment often lags behind headcount growth. The result is IT teams managing requests via Slack messages and email, with no visibility into ticket volume, resolution times, or recurring problem patterns. An ITSM platform becomes justified when IT support load exceeds one or two IT staff members.",
    relatedTerms: ["erp", "siem", "software-asset-management"],
    faqs: [
      { q: "What is the difference between ITSM and ITIL?", a: "ITIL is a framework and set of best practices for IT service management. ITSM is the broader practice area. Most modern ITSM platforms implement ITIL-aligned processes, but ITSM can be practiced without strictly following ITIL." },
      { q: "When does a company need an ITSM platform?", a: "When ad-hoc IT request handling becomes unmanageable — typically around 50-100 employees with a dedicated IT function. Earlier adoption helps establish good practices before reactive habits become entrenched." },
    ],
  },
  // L
  {
    term: "Land and Expand",
    slug: "land-and-expand",
    definition: "A SaaS go-to-market strategy that acquires customers with a small initial footprint and grows revenue over time through expansion within the account.",
    longDefinition:
      "Land and expand is the dominant growth motion for enterprise SaaS. The 'land' phase involves a focused initial sale — often one team, one department, or one use case — at a relatively low deal size. The 'expand' phase grows the account through seat additions, new team rollouts, cross-sells, and upsells to premium tiers.\n\nVendors that execute land and expand successfully often show net revenue retention (NRR) above 120%, meaning their existing customer base grows in revenue each year even before adding new logos. This is a powerful business model indicator — it creates a revenue growth engine from within the existing customer base.\n\nFor procurement teams, land and expand dynamics mean initial contract terms matter less than expansion pricing. Negotiate most-favored-nation pricing commitments, caps on seat price increases, and volume discount thresholds at signing — before the vendor has leverage from your team's adoption of the tool.",
    relatedTerms: ["nrr", "seat-based-pricing", "annual-contract-value"],
    faqs: [
      { q: "What metrics indicate a successful land and expand motion?", a: "Net Revenue Retention above 110-120%, low churn among early cohorts, and increasing average contract value over customer lifetime are the strongest indicators of effective land and expand execution." },
      { q: "How should procurement approach land and expand vendors?", a: "Negotiate expansion pricing terms upfront. Cap per-seat price increases at renewal. Define the conditions under which pricing resets. Expansion leverage disappears once your team is embedded in the tool." },
    ],
  },
  {
    term: "License Optimization",
    slug: "license-optimization",
    definition: "The process of right-sizing software license counts and tiers to match actual usage, eliminating waste while maintaining necessary coverage.",
    longDefinition:
      "License optimization is the operational practice of aligning what you pay for with what you actually use. It involves auditing active users, reclaiming orphaned licenses, downgrading unused premium tier seats to lower tiers, and negotiating seat counts down at renewal based on utilization data.\n\nFor companies with 50+ SaaS subscriptions, license optimization consistently yields 20-35% cost reductions without any capability loss. The most common opportunities are: licenses assigned to departed employees, premium tier seats used only for features that free or basic tiers include, and tools with 10-30% active user rates that were purchased at full team headcount.\n\nTracking license utilization requires either vendor-provided dashboards (which are often incomplete or delayed) or ITSM/MDM-based telemetry. Trackr aggregates this data across your stack so optimization decisions are grounded in current usage, not last quarter's estimates.",
    relatedTerms: ["software-asset-management", "shadow-it", "vendor-management"],
    faqs: [
      { q: "How do you reclaim an orphaned license?", a: "Identify it through a user audit comparing your HRIS (active employees) against your SaaS user lists. Deactivate the user in the tool, downgrade the seat tier if applicable, and note the reclaimed cost in your renewal negotiation." },
      { q: "What utilization rate triggers a license review?", a: "Any tool with less than 60% of licensed seats showing active use in the past 90 days should be reviewed. Below 40% is a strong signal to reduce seat count at the next renewal." },
    ],
  },
  {
    term: "LLM",
    slug: "llm",
    definition: "Large Language Model — an AI model trained on massive text corpora that can generate, summarize, translate, and reason about natural language.",
    longDefinition:
      "Large Language Models (LLMs) are neural networks with billions to trillions of parameters, trained on diverse text data using next-token prediction. Through this training, they develop broad language capabilities including generation, summarization, classification, translation, code synthesis, and multi-step reasoning.\n\nThe LLM landscape has expanded dramatically since GPT-3's release in 2020. Today's leading models — GPT-4o, Claude 3.5/4, Gemini, Llama, Mistral — differ substantially in cost, latency, context window size, and performance on specific tasks. Model selection is now a critical engineering and procurement decision, not a given.\n\nFor teams evaluating tools built on LLMs, the underlying model affects output quality ceiling, inference cost per query, latency, and compliance posture. Enterprise AI deployments increasingly require LLM options that run on-premises or in private cloud to avoid sending sensitive data to third-party APIs.",
    relatedTerms: ["foundation-model", "rag", "hallucination"],
    faqs: [
      { q: "How do LLMs differ from traditional AI models?", a: "Traditional ML models are trained on labeled data for specific narrow tasks. LLMs are trained on vast general text corpora and develop generalized language capabilities that transfer across many tasks without task-specific training." },
      { q: "What is a context window in an LLM?", a: "The context window is the maximum amount of text an LLM can process in a single inference call — both the input prompt and output generation combined. Longer context windows enable processing of longer documents but increase computational cost." },
    ],
  },
  {
    term: "LTV",
    slug: "ltv",
    definition: "Lifetime Value — the total revenue a company expects to generate from a single customer over the entire duration of the relationship.",
    longDefinition:
      "LTV (also written CLV or CLTV) is the cumulative revenue value of a customer from acquisition through churn. For subscription businesses, LTV is approximated as Average Revenue Per Account (ARPA) divided by monthly churn rate. A customer paying $500/month with a 2% monthly churn rate has an LTV of approximately $25,000.\n\nLTV is the counterpart to CAC in assessing go-to-market efficiency. The LTV:CAC ratio is the single most important unit economics metric for SaaS businesses. A 3:1 ratio (LTV three times CAC) is considered the baseline for a healthy, fundable SaaS business. Below 1:1 means the business is economically broken — it loses money on every customer acquired.\n\nFor procurement teams evaluating tools that impact revenue retention (customer success platforms, CRMs, onboarding tools), model their impact on LTV explicitly. A tool that increases LTV by even 10% through improved retention has an outsized ROI relative to its cost.",
    relatedTerms: ["cac", "churn-rate", "nrr"],
    faqs: [
      { q: "How do you increase LTV?", a: "Reduce churn through better onboarding and customer success, increase average revenue through expansion and upsell, and extend relationship duration through lock-in and switching cost reduction from the customer's perspective." },
      { q: "What is the difference between LTV and ARR?", a: "ARR is the revenue you are currently generating annually from all customers. LTV is a predictive per-customer metric estimating total revenue over the life of that customer relationship. LTV informs CAC investment; ARR measures current business scale." },
    ],
  },
  // M
  {
    term: "MDR",
    slug: "mdr",
    definition: "Managed Detection and Response — a security service that provides outsourced threat detection, monitoring, investigation, and response from a team of security experts.",
    longDefinition:
      "MDR combines technology (EDR, SIEM, network monitoring) with a team of human security analysts who operate the tools 24/7. Rather than purchasing point security products and staffing an internal SOC, organizations use MDR providers to get enterprise-grade security coverage without building an internal security operations capability.\n\nMDR is particularly valuable for mid-size companies that face sophisticated threats but cannot justify the cost of a full internal security operations center. The MDR provider handles threat hunting, alert triage, incident investigation, and response coordination — activities that require deep expertise and continuous attention.\n\nWhen evaluating MDR vendors, key criteria include: mean time to detect (MTTD), mean time to respond (MTTR), scope of coverage (endpoints, cloud, network, email), SLA for incident escalation, and quality of the threat intelligence feed that informs detection. Reference checks with existing customers are essential — MDR quality varies enormously between providers.",
    relatedTerms: ["edr", "siem", "xdr"],
    faqs: [
      { q: "What is the difference between MDR and MSSP?", a: "An MSSP (Managed Security Service Provider) typically manages security tools and monitors alerts reactively. MDR provides a higher level of proactive threat hunting, investigation depth, and hands-on response — not just alert forwarding." },
      { q: "Do you still need your own security team with MDR?", a: "You need someone internally to own the security program, make risk decisions, and interface with the MDR provider. But you can run a strong security posture with a single security lead supported by an MDR provider instead of a full SOC team." },
    ],
  },
  {
    term: "MRR",
    slug: "mrr",
    definition: "Monthly Recurring Revenue — the normalized monthly value of all active subscription contracts.",
    longDefinition:
      "MRR is the operational companion to ARR (ARR = MRR x 12). It is the standard pulse metric for SaaS businesses, tracked in four components: New MRR (from new customers), Expansion MRR (upgrades and seat additions from existing customers), Contraction MRR (downgrades), and Churned MRR (cancellations). Net New MRR = New + Expansion - Contraction - Churned.\n\nMRR momentum is one of the clearest indicators of business health. A company with growing Expansion MRR and declining Churned MRR has strong product-market fit and an efficient customer success motion. A company with high New MRR but rising Churned MRR is filling a leaky bucket — its growth is masking a retention problem.\n\nFor vendor evaluation, request MRR growth charts from prospective SaaS vendors during procurement. A vendor with flat or declining MRR faces financial pressure that may affect product investment, support quality, and pricing stability over the life of your contract.",
    relatedTerms: ["arr", "churn-rate", "nrr"],
    faqs: [
      { q: "How is MRR different from revenue?", a: "MRR counts only recurring subscription revenue, normalized to monthly value. It excludes one-time fees, professional services, and usage-based overages. This makes it a cleaner measure of the predictable business base." },
      { q: "What causes MRR to decline?", a: "Cancellations (churned MRR), plan downgrades (contraction MRR), pricing errors, or paused accounts. Rising churned MRR is a product or customer success problem; rising contraction MRR often signals pricing misalignment." },
    ],
  },
  {
    term: "Multimodal AI",
    slug: "multimodal-ai",
    definition: "AI models that can process and generate multiple types of data — text, images, audio, video, and code — within a single unified architecture.",
    longDefinition:
      "Multimodal AI models extend beyond language to understand and generate across modalities. GPT-4o, Gemini, and Claude can process images alongside text, enabling use cases like document understanding, screenshot analysis, and visual question answering. More advanced systems add audio, video, and structured data inputs.\n\nMultimodality dramatically expands the range of tasks AI tools can handle. A multimodal AI can read a screenshot of a UI, a PDF invoice, a whiteboard diagram, or a chart — not just plain text. This makes these models significantly more useful for document workflows, visual data extraction, and content creation.\n\nFor teams evaluating multimodal AI tools, test specifically on your data types. Image understanding quality varies significantly between models, particularly for domain-specific content like medical images, engineering diagrams, or financial charts. Latency and cost also increase substantially with image inputs versus text-only prompts.",
    relatedTerms: ["foundation-model", "llm", "fine-tuning"],
    faqs: [
      { q: "What tasks benefit most from multimodal AI?", a: "Document understanding (invoices, contracts, forms), UI automation (reading and interacting with screenshots), visual content generation, data extraction from charts and images, and accessibility applications benefit most." },
      { q: "Are multimodal models more expensive than text-only models?", a: "Yes. Image and audio inputs consume significantly more tokens and compute than equivalent text inputs. Model image pricing is typically 5-20x the text token rate on a per-token equivalent basis." },
    ],
  },
  // N
  {
    term: "Net Revenue Retention",
    slug: "net-revenue-retention",
    definition: "The percentage of recurring revenue retained from existing customers after accounting for churn, contractions, and expansions — values above 100% indicate a growing installed base.",
    longDefinition:
      "Net Revenue Retention (NRR), also called Net Dollar Retention (NDR), measures the growth or shrinkage of the existing customer revenue base over time. It is calculated as: (Starting MRR + Expansion MRR - Contraction MRR - Churned MRR) / Starting MRR x 100.\n\nNRR is the most important predictor of long-term SaaS business health. A company with 120% NRR grows its revenue base 20% annually from existing customers alone — before adding a single new logo. Best-in-class enterprise SaaS companies (Snowflake, Datadog, Veeva) have sustained NRR above 130%.\n\nFor procurement teams, NRR is a leading indicator of vendor product quality and customer success maturity. High NRR means customers consistently find enough new value to expand — a signal the product is working. Low NRR (below 90%) signals a retention problem that may translate into reduced product investment, cost-cutting, or acquisition in coming years.",
    relatedTerms: ["nrr", "arr", "land-and-expand"],
    faqs: [
      { q: "What is the difference between NRR and GRR?", a: "NRR (Net Revenue Retention) includes expansion revenue from upsells and cross-sells. GRR (Gross Revenue Retention) counts only the revenue retained from the starting base — it excludes expansion. GRR is always lower than or equal to NRR." },
      { q: "What NRR should I expect from a SaaS vendor?", a: "Above 110% is good for mid-market SaaS. Above 120% is excellent. Below 100% means the vendor is losing revenue from its existing base, which is a risk signal for product quality and financial health." },
    ],
  },
  {
    term: "NRR",
    slug: "nrr",
    definition: "Net Revenue Retention — shorthand for the percentage of revenue retained and grown from the existing customer base, net of churn and expansion.",
    longDefinition:
      "NRR is often used interchangeably with Net Dollar Retention (NDR). It captures the net effect of all revenue movements within the existing customer cohort: churn reduces it, downgrades reduce it, upgrades and seat additions increase it. An NRR above 100% means the cohort is growing; below 100% means it is shrinking.\n\nNRR is distinct from gross retention. Gross retention measures how much of the starting revenue survives (ignoring expansion). NRR measures the net growth of the installed base. Companies can have high gross retention but low NRR if they are losing expansion revenue — or high NRR with moderate gross retention if expansion is exceptionally strong.\n\nOperationally, improving NRR requires investments in customer success, product expansion features (usage tiers, additional modules, team growth hooks), and renewal operations. For procurement, an NRR-healthy vendor is more likely to invest in the product, maintain competitive pricing, and remain independent.",
    relatedTerms: ["net-revenue-retention", "churn-rate", "arr"],
    faqs: [
      { q: "How does NRR affect SaaS valuations?", a: "NRR is one of the strongest valuation drivers in SaaS. Companies with NRR above 120% command significantly higher revenue multiples because their growth engine is partially self-funding from within the existing customer base." },
      { q: "Can a company survive with NRR below 100%?", a: "Only if new customer acquisition is strong enough to offset the shrinking base. But structurally, sub-100% NRR means the company must run faster and faster on new sales just to stay flat — an unsustainable long-term position." },
    ],
  },
  // O
  {
    term: "OAuth",
    slug: "oauth",
    definition: "An open authorization protocol that enables users to grant third-party applications access to their resources without sharing their credentials.",
    longDefinition:
      "OAuth 2.0 is the industry-standard protocol for delegated authorization. Instead of sharing a username and password with a third-party app, users authenticate with the identity provider (Google, Microsoft, Okta) and grant the app a scoped access token. The app can then access only the permitted resources, for a limited time, without ever seeing the user's credentials.\n\nFor security teams evaluating SaaS tools, OAuth implementation quality matters significantly. Apps should request the minimum necessary scopes, support token revocation, and implement PKCE (Proof Key for Code Exchange) for public clients. Overly broad OAuth scopes — requesting access to read all emails when only calendar access is needed — are a risk signal.\n\nFor enterprise deployments, OAuth integrations should be reviewed and approved by IT/security before users are permitted to connect tools. Unreviewed OAuth connections are a common shadow IT vector — users connect personal accounts or unapproved tools to business systems without any central awareness.",
    relatedTerms: ["sso", "rbac", "gdpr"],
    faqs: [
      { q: "What is the difference between OAuth and SSO?", a: "OAuth is an authorization protocol — it controls what data an app can access. SSO (Single Sign-On) is an authentication pattern — it lets users log in once to access multiple apps. OpenID Connect (OIDC) is built on OAuth to provide authentication as well as authorization." },
      { q: "How do you audit OAuth connections in your organization?", a: "Most identity providers (Google Workspace, Microsoft Entra, Okta) provide a third-party app connections dashboard showing which apps have been granted OAuth access by your users. Review and revoke connections to unapproved tools regularly." },
    ],
  },
  // P
  {
    term: "PaaS",
    slug: "paas",
    definition: "Platform as a Service — a cloud service that provides a managed environment for developing, deploying, and scaling applications without managing underlying infrastructure.",
    longDefinition:
      "PaaS sits between IaaS (raw infrastructure) and SaaS (finished applications) in the cloud service stack. PaaS providers manage the OS, middleware, runtime, and infrastructure, allowing developers to focus exclusively on application code. Examples include Heroku, Google App Engine, AWS Elastic Beanstalk, and Vercel for web applications.\n\nThe tradeoff in PaaS is control versus convenience. You gain faster deployment cycles, automatic scaling, and reduced operational overhead. You lose the ability to configure low-level infrastructure specifics, which can be a constraint for workloads with unusual performance or compliance requirements.\n\nFor startups and growing engineering teams, PaaS is often the optimal choice until infrastructure complexity outgrows what PaaS abstractions can handle. Moving from PaaS to IaaS at scale is a deliberate migration that buys cost efficiency and control at the expense of operational complexity.",
    relatedTerms: ["iaas", "saas", "cloud-cost-optimization"],
    faqs: [
      { q: "When should a company move from PaaS to IaaS?", a: "When PaaS costs exceed IaaS costs at your scale, when compliance requirements demand infrastructure control the PaaS does not support, or when workload patterns (GPUs, custom networking) fall outside PaaS abstractions." },
      { q: "Is Vercel a PaaS?", a: "Vercel is a specialized PaaS optimized for frontend and full-stack web applications built on Next.js and similar frameworks. It abstracts deployment, scaling, and CDN management while providing edge function and serverless capabilities." },
    ],
  },
  {
    term: "Prompt Engineering",
    slug: "prompt-engineering",
    definition: "The practice of crafting, structuring, and optimizing input prompts to improve the quality, consistency, and accuracy of AI model outputs.",
    longDefinition:
      "Prompt engineering is the primary lever for improving LLM output quality without retraining the model. Techniques include: chain-of-thought (asking the model to reason step-by-step), few-shot prompting (providing examples), role assignment (defining a persona or expertise level), output format specification, and constitutional constraints (telling the model what not to do).\n\nEffective prompt engineering is now a critical skill for teams deploying AI tools. A well-crafted system prompt can dramatically improve accuracy, reduce hallucination, and ensure consistent output formatting. Conversely, a poorly structured prompt can make a state-of-the-art model underperform a smaller model with a better prompt.\n\nFor teams evaluating AI tools, transparency about the underlying prompt architecture matters. Tools that expose their system prompts or allow customization give you more control over output quality. Black-box tools with opaque prompting may produce inconsistent results that are hard to diagnose and improve.",
    relatedTerms: ["llm", "fine-tuning", "hallucination"],
    faqs: [
      { q: "What is chain-of-thought prompting?", a: "Chain-of-thought prompting asks the model to show its reasoning step by step before giving a final answer. This significantly improves accuracy on multi-step reasoning, math, and logic tasks because it forces intermediate validation." },
      { q: "When is fine-tuning better than prompt engineering?", a: "When output format must be extremely consistent (structured JSON, specific schemas), when the task is highly repetitive, or when the required knowledge is so domain-specific that it cannot be adequately conveyed in a prompt context window." },
    ],
  },
  {
    term: "Product-Led Growth",
    slug: "product-led-growth",
    definition: "A go-to-market strategy where the product itself drives acquisition, activation, and expansion — reducing reliance on traditional sales and marketing motions.",
    longDefinition:
      "Product-Led Growth (PLG) inverts the traditional SaaS sales motion. Instead of generating leads through marketing campaigns and closing them through sales representatives, PLG companies let users experience the product before any commercial conversation. The product's value drives adoption; usage signals drive sales outreach at the right moment.\n\nSuccessful PLG companies — Slack, Figma, Notion, Airtable — built massive user bases by making it frictionless to start and delightful to use. Enterprise contracts followed bottom-up adoption. The go-to-market cost is substantially lower because users self-qualify and self-onboard.\n\nFor procurement teams, PLG vendors are often easier to evaluate because the free tier lets you validate the product before any contract conversation. The risk is that bottom-up adoption bypasses security and procurement review. Establish a policy for PLG tools: when team usage reaches a threshold (5+ users, 30+ days), trigger a formal evaluation and IT review.",
    relatedTerms: ["freemium", "usage-based-pricing", "land-and-expand"],
    faqs: [
      { q: "What is the difference between PLG and sales-led growth?", a: "Sales-led growth drives acquisition through direct sales outreach, demos, and proposals. PLG drives acquisition through the product itself — self-service trials, virality, and word of mouth. Many mature SaaS companies run both motions simultaneously." },
      { q: "How do PLG companies monetize free users?", a: "Through usage limits, seat counts, feature gating, collaboration triggers (invite a teammate to unlock X), and enterprise upgrade prompts (SSO, audit logs, admin controls). Paid triggers are designed to appear when a team has already formed a habit around the tool." },
    ],
  },
  // R
  {
    term: "RAG",
    slug: "rag",
    definition: "Retrieval-Augmented Generation — an AI architecture that combines a retrieval step (fetching relevant documents from a knowledge base) with a language model to ground responses in specific, up-to-date information.",
    longDefinition:
      "RAG addresses a core limitation of LLMs: they have a fixed training data cutoff and cannot access proprietary information not in their training set. In a RAG pipeline, user queries are embedded into vectors, matched against a vector database of indexed documents, and the most relevant chunks are retrieved and passed as context to the LLM for response generation.\n\nRAG significantly reduces hallucination rates because the model is answering based on retrieved source content rather than relying on parametric memory. It also allows knowledge bases to be updated without retraining the underlying model — you update the document index, not the model weights.\n\nFor enterprise AI deployments, RAG is the standard architecture for internal knowledge assistants, customer support bots, and document QA systems. When evaluating AI tools that use RAG, assess: the quality of the chunking and retrieval pipeline, how freshness is maintained, whether retrieved sources are cited in responses, and how the system handles queries outside the scope of the knowledge base.",
    relatedTerms: ["embeddings", "vector-database", "llm"],
    faqs: [
      { q: "When should you use RAG instead of fine-tuning?", a: "Use RAG when your knowledge base changes frequently, when you need source attribution, or when the knowledge domain is too large to fit in a context window. Use fine-tuning when output format consistency is critical or when the task style needs to be deeply embedded in the model." },
      { q: "What is a vector database's role in RAG?", a: "The vector database stores embeddings of all document chunks. At query time, it performs approximate nearest-neighbor search to find the document chunks most semantically similar to the user's question, which are then passed as context to the LLM." },
    ],
  },
  {
    term: "RBAC",
    slug: "rbac",
    definition: "Role-Based Access Control — a security model that assigns permissions to users based on their role, rather than granting permissions individually.",
    longDefinition:
      "RBAC is the standard access control model for enterprise software. Users are assigned to roles (admin, editor, viewer, billing manager), and each role carries a defined set of permissions. When a user's job responsibilities change, their role assignment changes — permissions update automatically without requiring individual permission audits.\n\nFor enterprise software evaluation, RBAC granularity is a critical criterion. Coarse-grained RBAC (only admin vs member) forces organizations to over-provision access. Fine-grained RBAC with attribute-based extensions allows tight, least-privilege access configurations that satisfy both security requirements and operational practicality.\n\nRBAC quality directly impacts SOC 2 compliance posture. SOC 2 requires demonstrating that access to sensitive data is appropriately restricted. A tool with poor RBAC forces workarounds that are harder to document and audit. Always evaluate RBAC depth during the security review phase of vendor selection.",
    relatedTerms: ["sso", "soc-2", "oauth"],
    faqs: [
      { q: "What is the difference between RBAC and ABAC?", a: "RBAC grants permissions based on role membership. ABAC (Attribute-Based Access Control) grants permissions based on attributes — user department, data classification, time of day, IP address — enabling more dynamic and context-aware policies than role assignment alone allows." },
      { q: "How does RBAC relate to SOC 2?", a: "SOC 2 Trust Service Criteria require access to be restricted based on job function and regularly reviewed. RBAC is the mechanism that makes this operationally manageable — without it, access control audits require checking individual permissions for every user." },
    ],
  },
  {
    term: "Renewal Management",
    slug: "renewal-management",
    definition: "The process of proactively tracking, evaluating, and negotiating software contract renewals before auto-renewal deadlines.",
    longDefinition:
      "Renewal management is the operational discipline of ensuring every software contract is reviewed, evaluated, and negotiated before it auto-renews. Without systematic renewal management, organizations routinely pay for tools with low utilization, miss cancellation windows on tools they intended to drop, and renew at list price without negotiation.\n\nEffective renewal management requires three inputs: a complete contract inventory with renewal dates and auto-renewal notice windows, utilization data for each tool, and a review process that starts 90-120 days before each renewal. For enterprise agreements with long notice windows, renewal planning must begin even earlier.\n\nRenewal negotiations carry the most leverage before the vendor knows you are committed. Use utilization data, competitive alternatives, and benchmark pricing to support negotiation. If usage is low, lead with that data and propose a right-sized contract. If usage is high and the tool is embedded, negotiate pricing caps for future years as part of the renewal commitment.",
    relatedTerms: ["annual-contract-value", "total-cost-of-ownership", "vendor-management"],
    faqs: [
      { q: "When should renewal review start?", a: "For annual contracts, start the review process 90 days before the renewal date. For contracts with auto-renewal clauses and 60-day cancellation notice, start at 120 days. Enterprise agreements with 90-day notice windows need 150+ day lead times." },
      { q: "What data do you need for a renewal negotiation?", a: "License utilization rates for the past 90-180 days, competitive pricing benchmarks, the cost of migration to an alternative, user satisfaction survey results, and documented ROI or the lack thereof." },
    ],
  },
  {
    term: "RFP",
    slug: "rfp",
    definition: "Request for Proposal — a formal procurement document that solicits detailed vendor proposals against a defined set of requirements and evaluation criteria.",
    longDefinition:
      "An RFP is the standard procurement mechanism for large software purchases. The issuing organization defines its requirements across functional, technical, security, compliance, support, and commercial dimensions. Vendors respond in a structured format, enabling side-by-side evaluation.\n\nRFPs are most valuable when requirements are well-understood and multiple vendors can plausibly meet them. They are less effective for early-stage categories where requirements are still evolving, or when the real decision is being driven by a stakeholder preference that the RFP will only rationalize.\n\nFor effective RFP processes, invest heavily in requirements definition before issuing the document. An RFP with vague or generic requirements invites vendor cherry-picking of favorable interpretations. Include a mandatory demo against specific scenarios, reference check requirements, and security questionnaire as standard components of any enterprise software RFP.",
    relatedTerms: ["vendor-management", "total-cost-of-ownership", "renewal-management"],
    faqs: [
      { q: "When is an RFP necessary?", a: "RFPs are typically required for purchases above a defined dollar threshold (often $50K-$100K annual contract value), for government procurement, or when policy mandates competitive bidding. They are most valuable when functional requirements are well-defined and multiple vendors can genuinely compete." },
      { q: "What is the difference between an RFP and an RFI?", a: "An RFI (Request for Information) is an early-stage market research document asking vendors to describe their capabilities. An RFP is a formal solicitation requesting a binding proposal against defined requirements. RFIs precede RFPs in formal procurement processes." },
    ],
  },
  // S
  {
    term: "SaaS",
    slug: "saas",
    definition: "Software as a Service — software delivered over the internet as a subscription, managed by the vendor without requiring local installation.",
    longDefinition:
      "SaaS is the dominant software delivery model. The vendor hosts the application, manages infrastructure, handles upgrades and security patches, and delivers the software via a web browser or API. Customers pay a subscription fee — typically per seat, per usage, or a platform fee — rather than a one-time perpetual license.\n\nSaaS's advantages over on-premises software are significant: no installation overhead, automatic updates, accessible from anywhere, and predictable subscription costs rather than large capital expenditures. For vendors, SaaS enables a recurring revenue model, real-time telemetry on feature usage, and the ability to iterate rapidly.\n\nThe proliferation of SaaS has created management challenges: the average mid-size company now runs 100-200+ SaaS subscriptions. Tracking spend, utilization, renewals, security posture, and overlap across this portfolio requires systematic tooling. This is the core problem Trackr is designed to solve.",
    relatedTerms: ["iaas", "paas", "shadow-it"],
    faqs: [
      { q: "What is the difference between SaaS, PaaS, and IaaS?", a: "SaaS delivers finished applications (Salesforce, Slack). PaaS delivers a platform for building applications (Vercel, Heroku). IaaS delivers raw infrastructure building blocks (AWS EC2, GCP VMs). Each layer trades control for convenience." },
      { q: "Why is SaaS management difficult at scale?", a: "The low friction of SaaS adoption means tools proliferate faster than governance processes. Without systematic tracking, organizations accumulate duplicate tools, orphaned licenses, security gaps from unapproved tools, and wasted spend on underutilized subscriptions." },
    ],
  },
  {
    term: "SDK",
    slug: "sdk",
    definition: "Software Development Kit — a collection of tools, libraries, documentation, and sample code that enables developers to build applications on or integrations with a platform.",
    longDefinition:
      "An SDK packages everything a developer needs to integrate with or extend a platform: client libraries in multiple languages, authentication helpers, data models, error handling, and usage examples. A high-quality SDK reduces the engineering time required to integrate a tool and reduces the risk of implementation errors.\n\nSDK quality is a proxy for API maturity and vendor investment in developer experience. A vendor with a well-maintained, versioned SDK across multiple languages is signaling that integrations are a first-class product priority. A vendor whose only integration path is raw HTTP calls to a poorly documented API will create ongoing engineering maintenance burden.\n\nFor procurement teams evaluating tools that require custom integration work, include SDK quality in the evaluation criteria. Ask the vendor: How many languages are supported? How frequently is the SDK updated? What is the breaking change policy? Who maintains the SDK — dedicated team or occasional volunteers?",
    relatedTerms: ["api", "oauth", "sso"],
    faqs: [
      { q: "What is the difference between an SDK and an API?", a: "An API is the underlying interface between systems. An SDK is a set of developer tools that simplifies calling that API — providing pre-built client libraries, authentication flows, and helper functions so developers do not have to write raw API code." },
      { q: "Why does SDK quality matter in vendor evaluation?", a: "Poor SDK quality means your engineering team spends more time on integration maintenance and debugging than on product development. It also increases the risk of incorrect API usage that causes data integrity issues or security vulnerabilities." },
    ],
  },
  {
    term: "Seat-Based Pricing",
    slug: "seat-based-pricing",
    definition: "A SaaS pricing model where cost scales with the number of licensed users (seats), typically charged per user per month.",
    longDefinition:
      "Seat-based pricing is the most common SaaS pricing model. Organizations pay a per-seat monthly or annual fee, with the total cost determined by licensed user count. Pricing typically tiers by plan level (basic, professional, enterprise) with per-seat rates decreasing at higher volume commitments.\n\nSeat-based pricing aligns vendor revenue with customer usage in theory, but creates perverse incentives in practice. Organizations often over-purchase seats to avoid the friction of adding new users mid-term, creating the license waste that license optimization audits target. They also hesitate to add seats for occasional users — creating unauthorized tool sharing.\n\nWhen negotiating seat-based contracts, key levers include: negotiating named vs concurrent user licensing (concurrent seats cost more but reduce license waste), securing a committed seat bank with flex capacity, and defining the price for add-on seats mid-term — a provision vendors often omit from initial contracts.",
    relatedTerms: ["usage-based-pricing", "freemium", "license-optimization"],
    faqs: [
      { q: "What is the difference between named and concurrent user licensing?", a: "Named user licensing assigns a license to a specific individual — only that person can use it. Concurrent licensing counts simultaneous active users — any number of named users can share a pool of concurrent licenses, but only X can be logged in at the same time." },
      { q: "How do you reduce seat-based cost without losing access?", a: "Audit active users (active in last 90 days), reclaim seats from inactive and departed employees, downgrade infrequent users to read-only or viewer tiers if available, and negotiate seat count down at renewal based on utilization data." },
    ],
  },
  {
    term: "Shadow IT",
    slug: "shadow-it",
    definition: "Software tools adopted and used by employees without the knowledge or approval of IT or operations, creating security, compliance, and spend management gaps.",
    longDefinition:
      "Shadow IT emerges when teams solve their own problems faster than central IT can respond. A marketing team signs up for a design tool, a sales rep installs a prospecting extension, an engineer connects a productivity app to the company Slack — all without formal review or approval. Each connection is a potential data exposure risk, a potential compliance violation, and an untracked cost.\n\nThe scale of shadow IT in most organizations is substantially larger than IT teams estimate. Studies consistently show that IT teams are aware of 30-40% of the SaaS tools in actual use. The remainder are discovered during audits, security incidents, or offboarding reviews.\n\nAddressing shadow IT requires both detection (cataloging what is actually in use via expense analysis, SSO logs, and browser extension scanning) and governance (a clear, fast approval process that removes the incentive to bypass IT). Organizations that make the approval process faster than bypass behavior reduce shadow IT at the source.",
    relatedTerms: ["software-asset-management", "license-optimization", "soc-2"],
    faqs: [
      { q: "What is the biggest security risk from shadow IT?", a: "Unauthorized OAuth connections that grant third-party apps access to company data (email, calendar, documents) without IT review. These connections persist after employees leave unless systematically audited and revoked." },
      { q: "How do you discover shadow IT?", a: "Analyze corporate card and expense data for SaaS charges, review SSO provider logs for connected third-party apps, scan browser extensions on managed devices, and survey team leads about tools they rely on that are not in the official stack." },
    ],
  },
  {
    term: "SIEM",
    slug: "siem",
    definition: "Security Information and Event Management — a platform that aggregates logs and security events from across an organization's infrastructure, correlates threats, and generates alerts.",
    longDefinition:
      "A SIEM is the central nervous system of a security operations center. It ingests log data from endpoints, network devices, cloud infrastructure, SaaS applications, and identity providers — correlates events across these sources to identify attack patterns — and generates prioritized alerts for investigation.\n\nSIEM platforms have evolved from log aggregation tools into comprehensive threat detection platforms. Modern SIEMs incorporate machine learning for anomaly detection, SOAR (Security Orchestration, Automation, and Response) capabilities for automated playbooks, and threat intelligence feeds for context enrichment.\n\nFor organizations evaluating SIEM solutions, key criteria include: ingestion speed and log volume capacity, detection rule quality and update frequency, integration breadth with your specific stack, query performance for investigations, and total cost including ingest and storage charges — which can be surprisingly high for verbose log sources.",
    relatedTerms: ["mdr", "edr", "xdr"],
    faqs: [
      { q: "Do small companies need a SIEM?", a: "Not always. Small companies under 100 employees can often get equivalent visibility from a cloud-native MDR service without the operational overhead of running a SIEM. SIEM value increases with infrastructure complexity and compliance requirements." },
      { q: "What is the difference between SIEM and SOAR?", a: "SIEM aggregates and correlates security events to generate alerts. SOAR (Security Orchestration, Automation, and Response) automates the response workflows triggered by those alerts — notifying teams, blocking IPs, isolating endpoints — without manual intervention." },
    ],
  },
  {
    term: "SOC 2",
    slug: "soc-2",
    definition: "Service Organization Control 2 — an auditing framework developed by the AICPA that evaluates a vendor's security, availability, processing integrity, confidentiality, and privacy controls.",
    longDefinition:
      "SOC 2 is the most widely required security certification in enterprise SaaS procurement. It is an independent audit conducted by a licensed CPA firm that verifies a vendor's controls against the AICPA's Trust Service Criteria. Type I audits verify that controls exist at a point in time; Type II audits verify that controls operated effectively over a 6-12 month period.\n\nSOC 2 Type II has become a de facto table stake for enterprise sales. Without it, procurement teams at security-conscious buyers will not advance a vendor through the evaluation process. The audit examines: logical access controls, encryption standards, vulnerability management, incident response, change management, and vendor management practices.\n\nFor procurement teams evaluating vendors, request a current SOC 2 Type II report and review the auditor's exceptions section carefully. Exceptions indicate control failures. Ask what remediation was done. A clean audit with no exceptions is the baseline; a report with recurring exceptions in access management or change control is a risk signal.",
    relatedTerms: ["gdpr", "hipaa", "rbac"],
    faqs: [
      { q: "What is the difference between SOC 2 Type I and Type II?", a: "Type I is a point-in-time assessment verifying controls exist. Type II covers a period (typically 6-12 months) and verifies controls operated effectively throughout. Type II is significantly more valuable and is the standard required by enterprise buyers." },
      { q: "Is SOC 2 required for all SaaS vendors?", a: "Not legally required, but it is de facto required by enterprise buyers. Without SOC 2, vendors cannot pass security review at most large organizations. It has become the minimum security certification expectation for selling to enterprises." },
    ],
  },
  {
    term: "Software Asset Management",
    slug: "software-asset-management",
    definition: "The practice of systematically managing the procurement, deployment, maintenance, utilization, and disposal of software licenses and subscriptions across an organization.",
    longDefinition:
      "Software Asset Management (SAM) is the operational discipline of knowing exactly what software you own, what you are entitled to use, how much is in use, and what it costs. SAM programs maintain a software inventory, track contract terms and renewal dates, monitor license utilization, and ensure compliance with vendor license agreements.\n\nSAM emerged from the need to manage on-premises perpetual licenses and enterprise agreements, but has become more complex — not simpler — in the SaaS era. The proliferation of subscriptions, the ease of self-service purchase, and the distributed nature of SaaS adoption have made SAM a full-time function at organizations with 200+ employees.\n\nEffective SAM reduces software spend through license reclamation, renewal optimization, and duplicate tool elimination. It also reduces compliance risk — software audits by major vendors (Oracle, Microsoft, IBM) can result in substantial retroactive license fees if utilization has exceeded entitlements.",
    relatedTerms: ["license-optimization", "shadow-it", "vendor-management"],
    faqs: [
      { q: "What is the ROI of a SAM program?", a: "Studies consistently show SAM programs achieve 10-30% reduction in software spend through license reclamation, renewal optimization, and vendor negotiation. For companies spending $1M+ on software, the ROI of SAM tooling and staffing is typically 3-5x in year one." },
      { q: "What is the difference between SAM and SaaS management?", a: "SAM traditionally covers all software assets including on-premises and perpetual licenses. SaaS management specifically focuses on subscription-based cloud software. Modern SAM platforms increasingly cover both." },
    ],
  },
  {
    term: "SSO",
    slug: "sso",
    definition: "Single Sign-On — an authentication scheme that allows users to log in once with a single set of credentials to access multiple connected applications.",
    longDefinition:
      "SSO centralizes authentication through an Identity Provider (IdP) such as Okta, Microsoft Entra, or Google Workspace. Users authenticate once against the IdP and receive session tokens that grant access to connected applications — without re-entering credentials for each tool. SAML and OpenID Connect (OIDC) are the underlying protocols.\n\nFor enterprise security, SSO is a baseline requirement for three reasons: it enables centralized access revocation (offboarding an employee deactivates access to all SSO-connected tools instantly), it supports MFA enforcement at the IdP level (a single policy covers all connected apps), and it provides a centralized audit log of access events.\n\nSSO support is now a standard evaluation criterion for any enterprise SaaS purchase. Verify that SSO is available on your target plan tier — many vendors gate SSO behind expensive enterprise tiers, creating pricing pressure. Evaluate the protocol support (SAML 2.0 and OIDC are both required in diverse IdP environments) and whether the vendor supports SCIM for automated provisioning.",
    relatedTerms: ["oauth", "rbac", "soc-2"],
    faqs: [
      { q: "What is the difference between SSO and OAuth?", a: "SSO is an authentication pattern where one login grants access to many apps. OAuth is an authorization protocol that controls what data an app can access. OpenID Connect (OIDC) extends OAuth to provide authentication — it is the technical foundation most modern SSO implementations use." },
      { q: "What is SCIM and how does it relate to SSO?", a: "SCIM (System for Cross-domain Identity Management) is a protocol for automating user provisioning and deprovisioning. SSO handles login; SCIM handles account lifecycle — creating accounts when employees join, updating them when roles change, and deleting them when employees leave." },
    ],
  },
  {
    term: "Synthetic Data",
    slug: "synthetic-data",
    definition: "Artificially generated data that mimics the statistical properties and structure of real data, used for training AI models while preserving privacy.",
    longDefinition:
      "Synthetic data is generated by algorithms, models, or simulations rather than collected from real-world events. It can replicate the schema, distributions, and correlations of real data without containing any actual personal information. This makes it valuable for training AI models in regulated industries where real data cannot be used due to privacy restrictions.\n\nSynthetic data generation techniques include Generative Adversarial Networks (GANs), Variational Autoencoders (VAEs), and increasingly, LLM-based generation for text and tabular data. The quality of synthetic data is evaluated on statistical fidelity (how closely it matches the distribution of real data) and privacy guarantees (how confidently it prevents re-identification of real individuals).\n\nFor teams evaluating AI tools in healthcare, finance, or other regulated domains, synthetic data enables model training and testing without compliance exposure. Key questions when evaluating synthetic data tooling: What are the statistical fidelity metrics? Has the privacy guarantee been independently validated? What is the performance degradation on models trained on synthetic vs real data?",
    relatedTerms: ["fine-tuning", "llm", "gdpr"],
    faqs: [
      { q: "Is synthetic data a substitute for real data in AI training?", a: "In some cases yes, in others no. Synthetic data works well for augmenting limited real datasets and for testing pipelines. For tasks requiring high fidelity to rare real-world patterns, models trained purely on synthetic data may underperform." },
      { q: "Can synthetic data satisfy GDPR requirements?", a: "Properly generated synthetic data with strong privacy guarantees (differential privacy, k-anonymity) can satisfy GDPR requirements because it does not constitute personal data. However, the generation process must be documented and the privacy guarantee must be independently validated." },
    ],
  },
  // T
  {
    term: "Total Cost of Ownership",
    slug: "total-cost-of-ownership",
    definition: "The complete financial cost of a software tool over its lifecycle, including license fees, implementation, integration, training, support, and switching costs.",
    longDefinition:
      "Total Cost of Ownership (TCO) extends beyond the subscription price to capture every cost associated with adopting, running, and eventually replacing a software tool. Common TCO components beyond licensing include: implementation and configuration costs, integration engineering hours, data migration at adoption, ongoing admin overhead, training and change management, and migration cost if you eventually switch.\n\nTCO analysis frequently reveals that the cheapest tool by subscription price is not the cheapest tool to own. A $50/seat/month tool that requires 200 hours of integration work, ongoing admin maintenance, and carries high switching costs may have a higher 3-year TCO than an $80/seat/month tool with excellent integrations, low admin overhead, and a clean data export story.\n\nTrackr surfaces TCO signals across your evaluated tools — integration depth scores, vendor-reported implementation timelines, and exit cost indicators — to help procurement teams make decisions based on true cost rather than sticker price.",
    relatedTerms: ["annual-contract-value", "vendor-lock-in", "software-asset-management"],
    faqs: [
      { q: "What is the most overlooked component of SaaS TCO?", a: "The internal engineering and admin time required to maintain integrations. API changes, authentication updates, and data schema evolution require ongoing maintenance that is often not budgeted when a tool is initially purchased." },
      { q: "How do you calculate switching cost as part of TCO?", a: "Estimate the cost of data migration, re-integration with other tools, retraining, productivity loss during transition, and any contractual penalties. High switching costs are a form of vendor lock-in that should be evaluated upfront, not discovered at cancellation." },
    ],
  },
  {
    term: "Transformer",
    slug: "transformer",
    definition: "The neural network architecture underlying virtually all modern large language models, based on attention mechanisms that process entire sequences in parallel.",
    longDefinition:
      "The Transformer architecture was introduced in the 2017 paper 'Attention Is All You Need' and has since become the foundation for GPT, BERT, T5, Claude, Gemini, and virtually every state-of-the-art language model. Its core innovation is the self-attention mechanism, which allows the model to relate any position in a sequence to any other position regardless of distance — solving the context limitation of prior recurrent architectures.\n\nTransformers are highly parallelizable during training, enabling the scaling to billions of parameters that unlocked emergent capabilities. The standard Transformer consists of encoder and decoder stacks, though LLMs typically use decoder-only architectures, while classification models often use encoder-only architectures.\n\nFor practitioners evaluating AI tools, understanding Transformer basics helps contextualize model capability differences. Larger Transformer models (more parameters, larger training compute) generally outperform smaller ones but cost more to run. Architectural innovations — Mixture of Experts (MoE), efficient attention variants — enable specific capability or efficiency tradeoffs that affect tool pricing and performance.",
    relatedTerms: ["llm", "foundation-model", "embeddings"],
    faqs: [
      { q: "What is the difference between encoder and decoder Transformer architectures?", a: "Encoder-only models (BERT) process the full sequence bidirectionally — useful for classification and understanding tasks. Decoder-only models (GPT, Claude) generate text autoregressively — predicting the next token. Encoder-decoder models (T5, translation models) combine both for seq-to-seq tasks." },
      { q: "Why do larger Transformer models perform better?", a: "Scale increases both the model's capacity (number of parameters available to store learned patterns) and the diversity of training signal. Emergent capabilities — complex reasoning, instruction following, few-shot learning — reliably appear at scale thresholds that smaller models do not reach." },
    ],
  },
  // U
  {
    term: "Usage-Based Pricing",
    slug: "usage-based-pricing",
    definition: "A SaaS pricing model where cost scales with actual consumption — API calls, data volume, active users, or units processed — rather than a flat per-seat fee.",
    longDefinition:
      "Usage-based pricing (UBP), also called consumption-based pricing, aligns payment with value received. Customers pay for what they use — API calls, rows processed, tokens consumed, emails sent, or any other measurable unit of value delivery. This model is dominant in infrastructure (AWS charges per compute-hour) and increasingly common in SaaS (Snowflake, Twilio, OpenAI).\n\nUBP creates favorable unit economics for customers with variable or uncertain usage — you do not pay for idle capacity. However, it also creates budget unpredictability. Usage spikes, inefficient queries, or growth in team activity can result in invoices significantly above the base estimate. Many UBP vendors offer committed spend discounts (pre-purchasing usage credits at a discount) to provide budget certainty.\n\nFor procurement teams, UBP contracts require different management than seat-based contracts. Track usage trends monthly, model growth scenarios, and negotiate committed spend agreements when you have predictable usage patterns. Overage rates on UBP contracts can be 2-3x the base rate — understand the pricing cliff before usage surprises you.",
    relatedTerms: ["seat-based-pricing", "freemium", "cloud-cost-optimization"],
    faqs: [
      { q: "What are the budget risks of usage-based pricing?", a: "Unexpected usage spikes (a viral campaign driving email volume, a data processing job that ran too broadly) can cause invoices to exceed estimates dramatically. Understand overage rates and set alerts at 80% of your expected budget before committing to UBP." },
      { q: "Is usage-based or seat-based pricing better for growing companies?", a: "Usage-based pricing is better when usage is variable or uncertain. Seat-based pricing provides more budget predictability. Many growing companies prefer UBP early (when usage is uncertain) and shift to committed-spend discounts as usage becomes predictable." },
    ],
  },
  // V
  {
    term: "Vector Database",
    slug: "vector-database",
    definition: "A database purpose-built for storing and querying high-dimensional vector embeddings at scale, enabling fast approximate nearest-neighbor search.",
    longDefinition:
      "Vector databases store floating-point vector embeddings generated by AI models and provide efficient similarity search operations. When a query vector is submitted, the database finds the vectors in the index most similar to it — by cosine similarity or Euclidean distance — and returns the corresponding records.\n\nVector databases are the storage layer for RAG architectures, semantic search, recommendation systems, and anomaly detection. Popular options include Pinecone (managed cloud), Weaviate (self-hosted or cloud), Qdrant, Chroma, and pgvector (PostgreSQL extension). The right choice depends on scale, operational preferences, and existing infrastructure.\n\nFor teams evaluating AI tools that use vector databases, key considerations include: indexing algorithm (HNSW is standard), query latency at your expected scale, filtering capabilities (can you filter by metadata before running ANN search?), and cost per query/storage. Self-hosted options reduce cost at scale but introduce operational complexity.",
    relatedTerms: ["embeddings", "rag", "llm"],
    faqs: [
      { q: "Do I need a dedicated vector database or can I use PostgreSQL with pgvector?", a: "For small to medium scale (under a few million vectors), pgvector is sufficient and reduces infrastructure complexity. For large scale or high query volume requirements, dedicated vector databases offer better performance and operational tooling." },
      { q: "What is approximate nearest-neighbor search?", a: "ANN search finds vectors that are close to — but not guaranteed to be the absolute closest to — a query vector. The approximation trades a small accuracy loss for dramatically faster query speeds compared to exact nearest-neighbor search, which requires comparing against every vector in the index." },
    ],
  },
  {
    term: "Vendor Lock-In",
    slug: "vendor-lock-in",
    definition: "A situation where the cost of switching away from a vendor — in money, time, and operational disruption — is high enough to override the rational decision to switch.",
    longDefinition:
      "Vendor lock-in is created by a combination of factors: proprietary data formats that make export difficult, deep integration dependencies that require significant re-engineering to replace, custom configurations that do not transfer to other tools, long-term contracts with early termination penalties, and team habits formed around a specific interface.\n\nLock-in is not inherently bad — it is often a byproduct of deep value delivery. But it becomes a problem when the vendor degrades quality, raises prices aggressively, or is acquired by a strategic competitor. At that point, the cost of switching is so high that the customer is trapped.\n\nEvaluating lock-in risk upfront prevents this situation. Key questions at evaluation time: Can I export all my data in a standard format at any time? How many systems depend on this vendor's API? How difficult would ripping this tool out be in 18 months? The answers define your negotiating position and inform whether you should accept multi-year contract terms.",
    relatedTerms: ["total-cost-of-ownership", "vendor-management", "rfp"],
    faqs: [
      { q: "What creates the strongest vendor lock-in?", a: "Deep data accumulation in proprietary formats (custom CRM fields, historical analytics), complex automation workflows built on the vendor's proprietary scripting environment, and team habits around a specific interface are the strongest lock-in vectors." },
      { q: "How do you reduce lock-in risk at contract signing?", a: "Negotiate data portability guarantees (standard export formats, export on demand), avoid building critical automation exclusively on proprietary workflow builders, maintain API-based integrations that can be redirected to alternatives, and limit initial contract length to one year." },
    ],
  },
  {
    term: "Vendor Management",
    slug: "vendor-management",
    definition: "The process of selecting, contracting, monitoring, and managing relationships with software and service vendors throughout the vendor lifecycle.",
    longDefinition:
      "Vendor management encompasses the full lifecycle: market research and initial evaluation, RFP and vendor selection, contract negotiation, onboarding, performance monitoring, renewal management, and eventually offboarding. It involves both commercial and technical dimensions — ensuring vendors meet contractual SLAs, security requirements, and performance expectations.\n\nEffective vendor management creates organizational leverage in two ways: it builds institutional knowledge that improves evaluation speed and quality over time, and it builds negotiating credibility with vendors who know they are being actively managed. Vendors provide better commercial terms and support levels to customers who demonstrate active engagement.\n\nFor growing organizations, vendor management becomes a formal function — not a part-time responsibility — when the vendor portfolio exceeds 30-40 tools and total annual spend exceeds $500K. At that point, the ROI of dedicated vendor management tooling and staffing is clear.",
    relatedTerms: ["renewal-management", "rfp", "software-asset-management"],
    faqs: [
      { q: "What is vendor performance management?", a: "Vendor performance management involves tracking whether vendors are meeting their contractual SLA commitments — uptime, support response times, feature delivery — and using performance data as leverage in renewal negotiations or escalation conversations." },
      { q: "How often should vendor relationships be reviewed?", a: "Tier 1 vendors (critical business systems, high spend) should have quarterly business reviews. Tier 2 vendors (significant spend, non-critical) annual reviews. Tier 3 vendors (low spend, easily replaceable) passive monitoring with renewal reviews only." },
    ],
  },
  // X
  {
    term: "XDR",
    slug: "xdr",
    definition: "Extended Detection and Response — a security platform that unifies threat detection and response across endpoints, network, cloud, and identity into a single integrated layer.",
    longDefinition:
      "XDR extends the EDR model beyond endpoints to correlate signals across the full attack surface — network traffic, cloud workloads, email, identity, and application logs — in a unified detection and response platform. The goal is to break down the data silos between point security products and enable investigations that follow an attacker's path across multiple vectors.\n\nXDR evolved from the recognition that attackers rarely operate on a single vector. A phishing email leads to credential theft, which leads to lateral movement via network, which leads to data exfiltration via cloud storage. Detecting this chain requires correlating signals across email security, identity logs, network monitoring, and endpoint telemetry — which siloed tools cannot do.\n\nWhen evaluating XDR platforms, assess: breadth of native integrations with your existing security stack, detection coverage against the MITRE ATT&CK framework, investigation workflow quality, and response automation capabilities. XDR value is proportional to the number of signal sources it can ingest and correlate.",
    relatedTerms: ["edr", "siem", "mdr"],
    faqs: [
      { q: "What is the difference between XDR and SIEM?", a: "A SIEM aggregates and alerts on logs from many sources. XDR goes further — it provides native detection capabilities built for specific telemetry types and automates response actions. XDR is designed for detection and response; SIEM is designed for log management and compliance." },
      { q: "Should I choose XDR or MDR?", a: "XDR is a platform you operate internally. MDR is a service where a vendor operates the platform on your behalf. If you lack security operations capacity, MDR gets you to XDR-level coverage without building an internal SOC." },
    ],
  },
  // Additional terms to reach 80
  {
    term: "AI Agent",
    slug: "ai-agent",
    definition: "An AI system that autonomously plans and executes multi-step tasks using tools, APIs, and memory to achieve a goal.",
    longDefinition:
      "AI agents extend LLMs from reactive answer-generators to proactive task executors. An agent is given a goal, a set of tools (web search, code execution, API calls, file reading/writing), and a planning mechanism that breaks the goal into subtasks, executes them in sequence, and revises the plan based on intermediate results.\n\nAgent architectures typically combine a reasoning loop (plan → act → observe → revise) with memory (short-term context window plus long-term vector storage) and a tool registry. Popular frameworks include LangChain, LlamaIndex, AutoGPT, and the emerging Model Context Protocol (MCP) for standardized tool access.\n\nFor teams evaluating AI tools that use agent architectures, reliability and observability are the critical evaluation criteria. Agents can take actions with real-world consequences — sending emails, calling APIs, modifying files. Evaluate: What guardrails prevent harmful actions? How are failures detected and recovered? What logging is available for audit? How does the agent handle ambiguous instructions?",
    relatedTerms: ["llm", "rag", "prompt-engineering"],
    faqs: [
      { q: "What is the difference between an AI agent and a chatbot?", a: "A chatbot responds to each message reactively in a single exchange. An AI agent autonomously plans and executes multi-step tasks across multiple tool calls and API interactions to complete a longer-horizon goal without needing a human prompt at each step." },
      { q: "What industries are AI agents most applicable to?", a: "Agents are most applicable to industries with high volumes of repetitive, structured tasks: sales development (automated research and outreach), finance (data aggregation and reporting), legal (contract review), and software development (code generation and testing pipelines)." },
    ],
  },
  {
    term: "ARPU",
    slug: "arpu",
    definition: "Average Revenue Per User — the mean monthly or annual revenue generated per active user, measuring monetization efficiency.",
    longDefinition:
      "ARPU is calculated by dividing total recurring revenue by the number of active paying users (or all users, depending on the context). For SaaS businesses, ARPU is a key pricing efficiency metric — it measures how much revenue each user relationship generates on average and tracks whether pricing changes or expansion motions are improving monetization.\n\nARPU trends are revealing in both directions. Rising ARPU indicates successful upsell, expansion, or pricing improvement. Falling ARPU suggests price compression from competition, a growing base of lower-tier users, or failure to expand existing accounts. For investors, ARPU is a proxy for the quality of the customer base.\n\nFor procurement teams, understanding a vendor's ARPU dynamics helps assess pricing stability. A vendor with falling ARPU may be discounting aggressively to hold market share — a sign of competitive pressure that could affect product investment. A vendor with rising ARPU has pricing power and a successful expansion motion.",
    relatedTerms: ["mrr", "arr", "ltv"],
    faqs: [
      { q: "How is ARPU different from ACV?", a: "ARPU is an aggregate metric — total revenue divided by total users. ACV is a per-contract metric representing the annualized value of an individual customer agreement. ARPU is used for trend analysis; ACV is used for deal benchmarking." },
      { q: "What is a good ARPU for SaaS?", a: "ARPU varies enormously by market segment. Consumer SaaS might run $10-30/month per user. SMB SaaS $50-200/month. Mid-market and enterprise SaaS $500-5,000+/month. What matters is whether ARPU is trending up or down over time." },
    ],
  },
  {
    term: "Context Window",
    slug: "context-window",
    definition: "The maximum amount of text an LLM can process in a single inference call, measured in tokens — encompassing both the input prompt and output generation.",
    longDefinition:
      "The context window defines the LLM's working memory for a single interaction. Everything the model can see and reason about — the system prompt, conversation history, retrieved documents, and the response being generated — must fit within this window. Early LLMs had context windows of 2,048-4,096 tokens. Current frontier models support 100K to 1M+ tokens.\n\nContext window size directly affects which tasks are feasible. Summarizing a short document needs 4K tokens. Analyzing a full contract needs 32K. Processing a large codebase or long-form research report may require 128K or more. Tasks that exceed the context window require chunking strategies that introduce complexity and potential quality loss.\n\nFor teams evaluating LLM-powered tools, context window size is a practical capability constraint, not just a spec sheet number. Test your longest real-world inputs against the context limits of the tools you are evaluating. 'Needle in a haystack' benchmarks reveal whether models actually use information from throughout a long context or degrade in attention as context length increases.",
    relatedTerms: ["llm", "rag", "transformer"],
    faqs: [
      { q: "What happens when you exceed the context window?", a: "The model can only process the text that fits within its context window. Overflow is typically handled by truncating the earliest content (losing context) or by a RAG-style retrieval that selects the most relevant portions to include." },
      { q: "Does a larger context window mean better performance?", a: "Not necessarily. Models often perform better on information near the beginning and end of the context window than in the middle (the 'lost in the middle' phenomenon). Larger windows increase capability but cost more and can introduce retrieval quality degradation." },
    ],
  },
  {
    term: "DAP",
    slug: "dap",
    definition: "Digital Adoption Platform — software that provides in-application guidance, onboarding flows, and training overlays to help users learn and use software tools effectively.",
    longDefinition:
      "A Digital Adoption Platform (DAP) sits as a layer on top of existing software applications, providing contextual tooltips, guided walkthroughs, task flows, and in-app alerts that help users complete tasks without leaving the application. Platforms like WalkMe, Pendo, and Appcues are common examples.\n\nDAPs address the gap between software purchase and software adoption. Organizations routinely find that 50-70% of SaaS capabilities go unused not because they are unwanted but because users were never adequately trained. A DAP provides continuous, contextual training that scales without requiring repeated live training sessions.\n\nFor IT and HR teams evaluating DAPs, the primary ROI metrics are reduction in support ticket volume, time-to-competency for new users, feature adoption rates, and reduction in training cost per employee. DAPs are most valuable for complex enterprise tools (ERP, CRM, HRIS) with high learning curves and frequent workflow changes.",
    relatedTerms: ["hris", "crm", "erp"],
    faqs: [
      { q: "What is the difference between a DAP and in-app onboarding?", a: "In-app onboarding is built by the software vendor for their own product. A DAP is a third-party overlay that any organization can deploy on top of any web-based tool — including tools whose vendors do not provide strong native onboarding." },
      { q: "When does a company need a DAP?", a: "When software adoption rates are chronically low, support ticket volumes are high for basic tasks, and training costs are material. Companies deploying complex enterprise software to 200+ users typically see positive ROI from DAP investment." },
    ],
  },
];

export const GLOSSARY_SLUGS = GLOSSARY_TERMS.map((t) => t.slug);
