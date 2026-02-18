export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string;
}

export const posts: BlogPost[] = [
    {
        slug: "introducing-trackr",
        title: "Introducing Trackr: The Operating System for AI-First Companies",
        date: "2024-03-20",
        excerpt: "Why we built Trackr to solve the chaos of modern AI tool stacks.",
        content: `
      ## The Problem with AI Tools
      
      Every week, hundreds of new AI tools launch. Founders and teams are overwhelmed. 
      Which ones are legit? Which ones are safe? How much do they cost?
      
      ## Enter Trackr
      
      Trackr is designed to be the single source of truth for your company's AI usage.
      We help you:
      
      1. **Discover** the best tools for your specific needs using our AI agents.
      2. **Manage** subscriptions and access in one place.
      3. **Analyze** usage and ROI to ensure you aren't wasting money.
      
      ## What's Next
      
      We are just getting started. Our roadmap includes deep integrations with major
      platforms, advanced security scanning for AI tools, and much more.
    `
    },
    {
        slug: "top-10-ai-marketing-tools",
        title: "Top 10 AI Marketing Tools for 2024",
        date: "2024-03-25",
        excerpt: "A curated list of the most effective AI tools for growth teams.",
        content: `
      ## 1. Jasper
      Great for copywriters.
      
      ## 2. Midjourney
      The king of image generation.
      
      ## 3. Trackr
      Of course, you need somewhere to manage all these tools!
    `
    }
];

export function getPost(slug: string) {
    return posts.find(post => post.slug === slug);
}
