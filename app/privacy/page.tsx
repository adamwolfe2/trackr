import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
    title: "Privacy Policy — Trackr",
    description: "How Trackr collects, uses, and protects your information.",
    openGraph: {
        title: "Privacy Policy — Trackr",
        description: "How Trackr collects, uses, and protects your information.",
        type: "website",
        url: "https://trytrackr.com/privacy",
    },
    alternates: {
        canonical: "https://trytrackr.com/privacy",
    },
};

export const revalidate = 86400;

export default async function PrivacyPage() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-6">
            <MarketingNavigation isLoggedIn={!!user} />

            <section className="py-16 border-t border-black/10 max-w-3xl">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Legal</span>
                <h1 className="font-serif text-4xl font-normal mb-2">Privacy Policy</h1>
                <p className="font-mono text-xs text-neutral-400 mb-12">Last updated: March 2024</p>

                <div className="space-y-10 font-mono text-sm text-neutral-700 leading-relaxed">
                    <div>
                        <h2 className="font-serif text-xl font-normal mb-3 text-black">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our interactive features.</p>
                    </div>

                    <div>
                        <h2 className="font-serif text-xl font-normal mb-3 text-black">2. How We Use Your Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, such as to personalize your experience and provide customer support.</p>
                    </div>

                    <div>
                        <h2 className="font-serif text-xl font-normal mb-3 text-black">3. Data Security</h2>
                        <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
