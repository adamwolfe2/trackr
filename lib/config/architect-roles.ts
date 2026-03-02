export const ARCHITECT_ROLES = [
  { slug: "ai-strategist", title: "AI Strategist", description: "Help companies build AI adoption roadmaps" },
  { slug: "implementation-partner", title: "Implementation Partner", description: "Deploy and integrate AI tools for clients" },
  { slug: "fractional-cto", title: "Fractional CTO", description: "Part-time technical leadership for AI transformation" },
  { slug: "agency-partner", title: "Agency Partner", description: "Digital agency bringing AI tools to your client base" },
  { slug: "consultant", title: "Independent Consultant", description: "Solo advisor recommending AI solutions" },
] as const;

export type ArchitectRoleSlug = (typeof ARCHITECT_ROLES)[number]["slug"];
