export type PackageSlug = "assessment" | "implementation" | "retainer";

export type ArchitectPackage = {
    name: string;
    slug: PackageSlug;
    tagline: string;
    price: number;
    duration: string;
    includes: string[];
    meetings: string;
    deliverables: string[];
    idealFor: string;
    popular?: boolean;
};

export const ARCHITECT_PACKAGES: Record<string, ArchitectPackage> = {
    ASSESSMENT: {
        name: "AI Assessment",
        slug: "assessment",
        tagline: "Understand where you stand and where to start",
        price: 2500,
        duration: "One-time",
        includes: [
            "Deep AI readiness audit with live walkthrough",
            "Current stack analysis and optimization map",
            "90-day implementation roadmap",
            "Tool recommendations with ROI projections",
            "Executive summary for leadership team",
        ],
        meetings: "1 kickoff call + 1 findings presentation (60 min each)",
        deliverables: [
            "AI Readiness Scorecard (interactive)",
            "Stack optimization report",
            "90-day roadmap document",
            "Tool comparison matrix",
        ],
        idealFor: "Companies exploring AI adoption with no clear starting point",
    },
    IMPLEMENTATION: {
        name: "AI Implementation Sprint",
        slug: "implementation",
        tagline: "Go from roadmap to running in 90 days",
        price: 5000,
        duration: "90 days",
        includes: [
            "Everything in Assessment",
            "Hands-on tool setup and configuration",
            "Team training sessions (up to 3)",
            "Integration architecture and buildout",
            "Weekly progress check-ins",
            "Dedicated Slack channel for async support",
        ],
        meetings: "Weekly 30-min standups + 3 training workshops (60 min each)",
        deliverables: [
            "Fully configured AI tool stack",
            "Integration documentation",
            "Team training materials",
            "Adoption metrics dashboard",
            "Post-implementation review",
        ],
        idealFor: "Companies ready to implement but lacking internal AI expertise",
        popular: true,
    },
    RETAINER: {
        name: "Ongoing AI Advisor",
        slug: "retainer",
        tagline: "Continuous optimization with a dedicated AI strategist",
        price: 3000,
        duration: "Ongoing (monthly)",
        includes: [
            "Everything in Implementation Sprint",
            "Monthly stack health reviews",
            "New tool evaluation and testing",
            "Vendor negotiation support",
            "Quarterly executive briefings",
            "Priority response (< 4hr SLA)",
            "Budget optimization and spend tracking",
        ],
        meetings: "Bi-weekly 45-min strategy calls + quarterly executive briefing",
        deliverables: [
            "Monthly stack health report",
            "Quarterly AI maturity assessment",
            "Tool evaluation reports (as needed)",
            "Annual AI strategy document",
        ],
        idealFor: "Companies committed to AI-first operations needing ongoing strategic guidance",
    },
};

export const PACKAGE_LIST = [
    ARCHITECT_PACKAGES.ASSESSMENT,
    ARCHITECT_PACKAGES.IMPLEMENTATION,
    ARCHITECT_PACKAGES.RETAINER,
] as const;
