import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Users, FlaskConical, TrendingUp } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ARCHITECT_ROLES } from "@/lib/config/architect-roles";

export const metadata: Metadata = {
    title: "The AI Architect Program — Trackr",
    description: "Enterprise AI consultants who outpace traditional firms by building with the tools they recommend. We accept the top fraction of applicants. Multi-stage vetting. Enterprise engagements. Recurring compensation.",
    openGraph: {
        title: "The AI Architect Program — Trackr",
        description: "Enterprise AI consultants who run circles around traditional firms. Rigorous vetting. Enterprise engagements. 20% recurring compensation.",
        url: "https://trytrackr.com/apply",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr AI Architect Program" }],
    },
    alternates: { canonical: "https://trytrackr.com/apply" },
};

const BENEFITS = [
    {
        icon: Shield,
        title: "The Vetting Is the Credential",
        description: "Our multi-stage review evaluates your portfolio, domain expertise, and deployment track record. We accept a fraction of applicants. The designation itself signals caliber to enterprise buyers.",
    },
    {
        icon: Users,
        title: "Enterprise Client Access",
        description: "Architects are matched with organizations actively evaluating AI tooling — from Fortune 500 procurement teams to high-growth startups scaling their stack. We bring the pipeline to you.",
    },
    {
        icon: FlaskConical,
        title: "Proprietary Research Platform",
        description: "Full access to Trackr's AI intelligence layer — real-time tool benchmarks, spend analytics, and implementation data that doesn't exist anywhere else. Build recommendations backed by evidence.",
    },
    {
        icon: TrendingUp,
        title: "Recurring Compensation",
        description: "20% recurring on every client engagement, paid for the lifetime of the relationship. Compensation that reflects the value of your hands-on expertise and the outcomes you drive.",
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
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-6">Application — We accept the top 0.01%</p>
                        <h1 className="font-serif text-5xl sm:text-6xl font-normal leading-tight mb-6">
                            The AI Architect Program.
                        </h1>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed max-w-2xl mb-4">
                            Enterprise AI consultants who run circles around McKinsey by being grassroots — building with the tools
                            they recommend, every single day. This is the convergence of enterprise sales, consulting,
                            and hands-on AI implementation. We are looking for overachievers who live inside these tools.
                        </p>
                        <p className="font-mono text-[11px] text-neutral-400 leading-relaxed max-w-2xl">
                            Our architects have led AI implementations across Fortune 500 companies, Series A-D startups,
                            and category-defining platforms. They don't just advise — they build. That's the difference.
                        </p>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">What you gain</p>
                    <h2 className="font-serif text-3xl font-normal mb-8">Built for operators, not affiliates.</h2>
                    <div className="grid sm:grid-cols-2 gap-px border border-black bg-black">
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

                {/* Requirements */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Requirements</p>
                    <h2 className="font-serif text-3xl font-normal mb-8">What we look for.</h2>
                    <div className="grid sm:grid-cols-3 gap-px border border-black bg-black">
                        {[
                            { title: "Proven AI Portfolio", description: "Documented history of AI tool evaluations, deployments, or transformations. We review real work, not resumes." },
                            { title: "Tool Fluency", description: "Deep working knowledge across the AI landscape — LLMs, automation platforms, vertical SaaS, infrastructure. Generalists need not apply." },
                            { title: "Domain Authority", description: "Recognized expertise in a specific vertical or function. Your clients trust your judgment because you've done the work." },
                        ].map((item) => (
                            <div key={item.title} className="bg-[#F3F3EF] p-6">
                                <h3 className="font-serif text-lg font-normal mb-2">{item.title}</h3>
                                <p className="font-mono text-[11px] text-neutral-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Role selection */}
                <section className="py-16 border-b border-black">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Select your track</p>
                    <h2 className="font-serif text-3xl font-normal mb-8">Choose the role that fits your practice.</h2>
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
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Process</p>
                    <h2 className="font-serif text-3xl font-normal mb-8">A rigorous, multi-stage review.</h2>
                    <div className="grid sm:grid-cols-4 gap-px border border-black bg-black">
                        {[
                            { step: "01", title: "Apply", description: "Select your track and submit your portfolio, specialization, and deployment history." },
                            { step: "02", title: "Review", description: "Our team evaluates every application against expertise benchmarks. Most are declined within 72 hours." },
                            { step: "03", title: "Onboard", description: "Accepted architects receive platform access, client matching, and proprietary research tools." },
                            { step: "04", title: "Engage", description: "Advise enterprise clients on AI tooling. Earn 20% recurring compensation on every engagement." },
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
