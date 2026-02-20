import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import { ProcessPage } from "@/components/marketing/process/process-page";

export const metadata: Metadata = {
    title: "Our Process — Trackr",
    description:
        "See how Trackr researches AI tools in 7 automated steps — from site crawling to structured reports — using Firecrawl, Tavily, Perplexity, and GPT-4o.",
    openGraph: {
        title: "Our Process — Trackr",
        description:
            "See how Trackr researches AI tools in 7 automated steps — from site crawling to structured reports.",
        type: "website",
        url: "https://trytrackr.com/process",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Research Process" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Our Process — Trackr",
        description: "See how Trackr researches AI tools in 7 automated steps — from site crawling to structured reports.",
        images: ["/og.png"],
    },
};

function ProcessJsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How Trackr Researches AI Tools",
        description:
            "Trackr uses a 7-step automated research pipeline to evaluate AI tools from 25+ data sources in under 2 minutes.",
        totalTime: "PT2M",
        estimatedCost: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: "0.12",
        },
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "Map Site",
                text: "Crawl the tool's website with Firecrawl to discover all pages and build a sitemap.",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "Scrape Pages",
                text: "Scrape selected pages in parallel, converting HTML to clean markdown for analysis.",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "Search Review Sites",
                text: "Search G2, Capterra, TrustRadius, and Product Hunt for verified user reviews and ratings.",
            },
            {
                "@type": "HowToStep",
                position: 4,
                name: "Verify Trust & Reputation",
                text: "Check funding data, company size, tech stack adoption, and ecosystem signals.",
            },
            {
                "@type": "HowToStep",
                position: 5,
                name: "Reddit Deep Dive",
                text: "Run parallel Reddit searches for user experiences, comparisons, and pain points.",
            },
            {
                "@type": "HowToStep",
                position: 6,
                name: "Competitive Intelligence",
                text: "Analyze competitive landscape using Perplexity to identify alternatives and market positioning.",
            },
            {
                "@type": "HowToStep",
                position: 7,
                name: "AI Synthesis",
                text: "Feed all collected data into GPT-4o to generate a structured, scored research report.",
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default async function ProcessPageRoute() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-6">
            <ProcessJsonLd />
            <MarketingNavigation isLoggedIn={!!user} />
            <ProcessPage />
            <MarketingFooter />
        </main>
    );
}
