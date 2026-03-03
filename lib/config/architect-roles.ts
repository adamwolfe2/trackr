export const ARCHITECT_ROLES = [
  { slug: "enterprise-growth-architect", title: "Enterprise Growth Architect", description: "Drive revenue through AI-native go-to-market strategy and enterprise tooling transformation" },
  { slug: "ai-strategy-director", title: "AI Strategy Director", description: "Set the AI roadmap for organizations scaling from pilot programs to full operational adoption" },
  { slug: "fractional-cto", title: "Fractional CTO", description: "Embed as technical leadership for companies navigating AI infrastructure, vendor selection, and deployment" },
  { slug: "revenue-operations-lead", title: "Revenue Operations Lead", description: "Optimize the intersection of sales, CS, and AI tooling to accelerate pipeline velocity and close rates" },
  { slug: "vertical-practice-lead", title: "Vertical Practice Lead", description: "Deep domain expertise in a specific industry — healthcare, fintech, e-commerce, legal — paired with hands-on AI deployment" },
] as const;

export type ArchitectRoleSlug = (typeof ARCHITECT_ROLES)[number]["slug"];
