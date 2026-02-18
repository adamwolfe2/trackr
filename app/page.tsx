export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { OffsetHero } from "@/components/marketing/offset-hero";
import { OffsetFeatures } from "@/components/marketing/offset-features";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingProblem } from "@/components/marketing/marketing-problem";
import { MarketingHowItWorks } from "@/components/marketing/marketing-how-it-works";
import { MarketingSocialProof } from "@/components/marketing/marketing-social-proof";
import { MarketingComparison } from "@/components/marketing/marketing-comparison";
import { MarketingPricing } from "@/components/marketing/marketing-pricing";
import { MarketingUseCases } from "@/components/marketing/marketing-use-cases";
import { MarketingDiscovery } from "@/components/marketing/marketing-discovery";
import { MarketingCTA } from "@/components/marketing/marketing-cta";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingIntegrations } from "@/components/marketing/marketing-integrations";
import { MarketingReportShowcase } from "@/components/marketing/marketing-report-showcase";

export const metadata: Metadata = {
  title: "Trackr — AI Tool Research for Ops Teams",
  description: "Submit any software tool. Research agents evaluate it in under 2 minutes. Get a scored report — features, pricing, pros/cons. Your team's shared AI tool database.",
  openGraph: {
    title: "Trackr — Stop Researching Tools Manually",
    description: "Research agents evaluate any software tool in under 2 minutes. Scored reports. Shared team database. Always up to date.",
    type: "website",
    url: "https://trytrackr.com",
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
        <MarketingComparison />
        <MarketingPricing />
        <MarketingUseCases />
        <MarketingDiscovery />
        <MarketingCTA />
        <MarketingFooter />
      </main>
    </>
  );
}
