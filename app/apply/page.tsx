import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, DollarSign, BarChart3, Briefcase } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ARCHITECT_ROLES } from "@/lib/config/architect-roles";

export const metadata: Metadata = {
    title: "Become a Trackr AI Architect",
    description: "Join the Trackr AI Architect program. Earn 20% recurring commissions by referring companies to Trackr's AI tool intelligence platform.",
    openGraph: {
        title: "Become a Trackr AI Architect",
        description: "Earn 20% recurring commissions by helping companies adopt AI tools with Trackr.",
        url: "https://trytrackr.com/apply",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr AI Architect Program" }],
    },
    alternates: { canonical: "https://trytrackr.com/apply" },
};

const BENEFITS = [
    {
        icon: DollarSign,
        title: "20% Recurring Commissions",
        description: "Earn on every payment your referred clients make, for as long as they stay subscribed.",
    },
    {
        icon: BarChart3,
        title: "Dedicated Portal",
        description: "Track your referrals, clients, commissions, and payouts from your own architect dashboard.",
    },
    {
        icon: Briefcase,
        title: "Trackr Research Tools",
        description: "Access the full Trackr platform to research AI tools and build recommendations for your clients.",
    },
];

export default function ApplyPage() {
    return (
        <>
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={false} />

                {/* Hero */}
                <section className="pt-16 pb-12 border-b border-black">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-6">AI Architect Program</p>
                        <h1 className="font-serif text-5xl sm:text-6xl font-normal leading-tight mb-6">
                            Become a Trackr AI Architect.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-2xl">
                            Help companies adopt the right AI tools. Earn 20% recurring commissions on every client you refer.
                            Get your own dashboard, referral code, and direct payouts via Stripe.
                        </p>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-8">Why join</p>
                    <div className="grid sm:grid-cols-3 gap-px border border-black bg-black">
                        {BENEFITS.map((benefit) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={benefit.title} className="bg-[#F3F3EF] p-6">
                                    <div className="w-8 h-8 border border-black flex items-center justify-center mb-4">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-serif text-lg font-normal mb-2">{benefit.title}</h3>
                                    <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{benefit.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Role selection */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Select your role</p>
                    <h2 className="font-serif text-3xl font-normal mb-8">How do you work with clients?</h2>
                    <div className="space-y-px border border-black bg-black">
                        {ARCHITECT_ROLES.map((role) => (
                            <Link
                                key={role.slug}
                                href={`/apply/${role.slug}`}
                                className="flex items-center justify-between bg-[#F3F3EF] p-6 hover:bg-white transition-colors group"
                            >
                                <div>
                                    <h3 className="font-serif text-xl font-normal mb-1">{role.title}</h3>
                                    <p className="font-mono text-[11px] text-neutral-600">{role.description}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors flex-shrink-0 ml-4" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="py-16">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">How it works</p>
                    <div className="grid sm:grid-cols-4 gap-px border border-black bg-black">
                        {[
                            { step: "01", title: "Apply", description: "Select your role and tell us about your experience." },
                            { step: "02", title: "Get approved", description: "We review applications within 48 hours." },
                            { step: "03", title: "Refer clients", description: "Share your unique referral link with prospects." },
                            { step: "04", title: "Earn commissions", description: "20% recurring on every client payment." },
                        ].map((item) => (
                            <div key={item.step} className="bg-[#F3F3EF] p-6">
                                <p className="font-mono text-[10px] text-neutral-400 mb-2">{item.step}</p>
                                <h3 className="font-serif text-lg font-normal mb-1">{item.title}</h3>
                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </>
    );
}
