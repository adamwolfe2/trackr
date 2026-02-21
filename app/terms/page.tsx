import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
    title: "Terms of Service — Trackr",
    description: "Terms and conditions for using the Trackr platform.",
    openGraph: {
        title: "Terms of Service — Trackr",
        description: "Terms and conditions for using the Trackr platform.",
        type: "website",
        url: "https://trytrackr.com/terms",
    },
    alternates: {
        canonical: "https://trytrackr.com/terms",
    },
};

export default async function TermsPage() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-6">
            <MarketingNavigation isLoggedIn={!!user} />

            <section className="py-16 border-t border-black/10 max-w-3xl">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Legal</span>
                <h1 className="font-serif text-4xl font-normal mb-2">Terms of Service</h1>
                <p className="font-mono text-xs text-neutral-400 mb-12">Last updated: March 2024</p>

                <div className="space-y-10 font-mono text-sm text-neutral-700 leading-relaxed">
                    <div>
                        <h2 className="font-serif text-xl font-normal mb-3 text-black">1. Acceptance of Terms</h2>
                        <p>By accessing and using Trackr (&quot;the Service&quot;), you agree to these Terms of Service.</p>
                    </div>

                    <div>
                        <h2 className="font-serif text-xl font-normal mb-3 text-black">2. Use License</h2>
                        <p>Permission is granted to temporarily view the materials on Trackr&apos;s website for personal, non-commercial transitory viewing only.</p>
                    </div>

                    <div>
                        <h2 className="font-serif text-xl font-normal mb-3 text-black">3. Subscription and Billing</h2>
                        <p>Some parts of the Service are billed on a subscription basis (&quot;Subscription(s)&quot;). You will be billed in advance on a recurring and periodic basis (&quot;Billing Cycle&quot;).</p>
                    </div>

                    <div>
                        <h2 className="font-serif text-xl font-normal mb-3 text-black">4. Termination</h2>
                        <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
