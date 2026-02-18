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

export default function Home() {
  return (
    <main className="flex-grow w-full max-w-6xl mx-auto px-6 animate-fade-in-up">
      <MarketingNavigation />
      <OffsetHero />
      <MarketingSocialProof />
      <MarketingProblem />
      <MarketingHowItWorks />
      <OffsetFeatures />
      <MarketingComparison />
      <MarketingPricing />
      <MarketingUseCases />
      <MarketingDiscovery />
      <MarketingCTA />
      <MarketingFooter />
    </main>
  );
}
