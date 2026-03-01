export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import lazy from "next/dynamic";

// Above-fold: eager imports for first paint
import { OffsetHero } from "@/components/marketing/offset-hero";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingSocialProof } from "@/components/marketing/marketing-social-proof";
import { MarketingIntegrations } from "@/components/marketing/marketing-integrations";

// Below-fold: code-split to reduce initial JS bundle
const MarketingProblem = lazy(() => import("@/components/marketing/marketing-problem").then(m => ({ default: m.MarketingProblem })));
const MarketingHowItWorks = lazy(() => import("@/components/marketing/marketing-how-it-works").then(m => ({ default: m.MarketingHowItWorks })));
const OffsetFeatures = lazy(() => import("@/components/marketing/offset-features").then(m => ({ default: m.OffsetFeatures })));
const MarketingReportShowcase = lazy(() => import("@/components/marketing/marketing-report-showcase").then(m => ({ default: m.MarketingReportShowcase })));
const MarketingInteractiveDemos = lazy(() => import("@/components/marketing/marketing-interactive-demos").then(m => ({ default: m.MarketingInteractiveDemos })));
const MarketingComparison = lazy(() => import("@/components/marketing/marketing-comparison").then(m => ({ default: m.MarketingComparison })));
const MarketingPricing = lazy(() => import("@/components/marketing/marketing-pricing").then(m => ({ default: m.MarketingPricing })));
const MarketingUseCases = lazy(() => import("@/components/marketing/marketing-use-cases").then(m => ({ default: m.MarketingUseCases })));
const MarketingDiscovery = lazy(() => import("@/components/marketing/marketing-discovery").then(m => ({ default: m.MarketingDiscovery })));
const MarketingEnterprise = lazy(() => import("@/components/marketing/marketing-enterprise").then(m => ({ default: m.MarketingEnterprise })));
const MarketingFaq = lazy(() => import("@/components/marketing/marketing-faq").then(m => ({ default: m.MarketingFaq })));
const MarketingCTA = lazy(() => import("@/components/marketing/marketing-cta").then(m => ({ default: m.MarketingCTA })));
const MarketingFooter = lazy(() => import("@/components/marketing/marketing-footer").then(m => ({ default: m.MarketingFooter })));

export const metadata: Metadata = {
  title: "Trackr — AI Tool Research for Ops Teams",
  description: "Submit any software tool. Research agents evaluate it in under 2 minutes. Get a scored report — features, pricing, pros/cons. Your team's shared AI tool database.",
  openGraph: {
    title: "Trackr — Stop Researching Tools Manually",
    description: "Research agents evaluate any software tool in under 2 minutes. Scored reports. Shared team database. Always up to date.",
    type: "website",
    url: "https://trytrackr.com",
    images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr — AI Tool Research for Ops Teams" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trackr — AI Tool Research for Ops Teams",
    description: "Research agents evaluate any software tool in under 2 minutes. Scored reports. Shared team database.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://trytrackr.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://trytrackr.com/#organization",
      name: "Trackr",
      url: "https://trytrackr.com",
      logo: {
        "@type": "ImageObject",
        url: "https://trytrackr.com/logo.png",
      },
      sameAs: [],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://trytrackr.com/#software",
      name: "Trackr",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "AI-powered software tool research platform. Submit any tool, get a scored research report in under 2 minutes.",
      url: "https://trytrackr.com",
      publisher: {
        "@id": "https://trytrackr.com/#organization",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://trytrackr.com/#website",
      url: "https://trytrackr.com",
      name: "Trackr",
      publisher: {
        "@id": "https://trytrackr.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://trytrackr.com/research?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How long does a research report take?", acceptedAnswer: { "@type": "Answer", text: "Under 2 minutes. Our research pipeline maps the tool's site, scrapes key pages, pulls reviews from G2, Capterra, TrustRadius, ProductHunt, Trustpilot, and Reddit, analyzes competitors, and synthesizes everything into a scored report." } },
        { "@type": "Question", name: "How accurate are the research reports?", acceptedAnswer: { "@type": "Answer", text: "Reports are sourced from 25+ real data points — official sites, review platforms, Reddit threads, and competitive analysis. Every claim is grounded in real data, not hallucinated." } },
        { "@type": "Question", name: "Is my data private?", acceptedAnswer: { "@type": "Answer", text: "Yes. Your workspace data is isolated and never shared between accounts. Research reports are private to your workspace unless you explicitly create a share link." } },
        { "@type": "Question", name: "Can I try paid features before committing?", acceptedAnswer: { "@type": "Answer", text: "All paid plans include a 14-day free trial with full access. No credit card required to start. Cancel anytime during the trial." } },
        { "@type": "Question", name: "What types of tools can I research with Trackr?", acceptedAnswer: { "@type": "Answer", text: "Any SaaS or AI tool with a public website. Submit a URL and Trackr evaluates it across 7 dimensions: features, pricing value, ease of use, integration depth, support quality, security, and AI capabilities. The research library also includes 150+ pre-built scorecards for popular tools." } },
        { "@type": "Question", name: "Can multiple team members collaborate on tool research?", acceptedAnswer: { "@type": "Answer", text: "Yes. All research reports live in a shared team workspace. Team members can add notes, vote on tools, share report links externally, and collaborate on the software evaluation process. Team plans support 5 members; Startup plans support 15; Enterprise plans are unlimited." } },
      ],
    },
  ],
};

export default async function Home() {
  const user = await currentUser();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
        <MarketingNavigation isLoggedIn={!!user} />
        <OffsetHero />
        <MarketingSocialProof />
        <MarketingIntegrations />
        <MarketingProblem />
        <MarketingHowItWorks />
        <OffsetFeatures />
        <MarketingReportShowcase />
        <MarketingInteractiveDemos />
        <MarketingComparison />
        <MarketingPricing />
        <MarketingUseCases />
        <MarketingDiscovery />
        <MarketingEnterprise />
        <MarketingFaq />
        <MarketingCTA />
        <MarketingFooter />
      </main>
    </>
  );
}
