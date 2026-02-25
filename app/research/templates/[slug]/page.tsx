import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import type { Metadata } from "next";

// Fully static — template content comes from seed data, no DB calls
export const revalidate = false;
import { TEMPLATES } from "@/data/templates.seed";
import { CURATED_TOOLS } from "@/data/tools.seed";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const template = TEMPLATES.find((t) => t.slug === slug);
    if (!template) return { title: "Not Found — Trackr" };

    const desc = `${template.tagline} — ${template.description.slice(0, 140)}`;
    return {
        title: `${template.name} — AI Stack Template | Trackr`,
        description: desc,
        openGraph: {
            title: `${template.name} — Trackr Template`,
            description: desc,
            url: `https://trytrackr.com/research/templates/${slug}`,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: template.name }],
        },
        alternates: { canonical: `https://trytrackr.com/research/templates/${slug}` },
    };
}

export default async function TemplatePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const template = TEMPLATES.find((t) => t.slug === slug);
    if (!template) notFound();

    const recommendedToolObjects = template.recommendedTools
        .map((toolSlug) => CURATED_TOOLS.find((t) => t.slug === toolSlug))
        .filter(Boolean) as typeof CURATED_TOOLS;

    const otherTemplates = TEMPLATES.filter(
        (t) => t.slug !== slug && (t.category === template.category || t.tags.some((tag) => template.tags.includes(tag)))
    ).slice(0, 3);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: template.name,
        description: template.description,
        estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
        step: template.steps.map((step, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            text: step,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                <section className="py-16 border-t border-black/10">
                    <Link
                        href="/research"
                        className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-black transition-colors mb-10"
                    >
                        <ArrowLeft className="w-3 h-3" /> AI Tool Library
                    </Link>

                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                {template.category}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px] text-neutral-400">
                                <Clock className="w-3 h-3" /> {template.estimatedSetup} setup
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl font-normal mb-3">
                            {template.name}
                        </h1>
                        <p className="font-mono text-base text-neutral-600 max-w-2xl">
                            {template.tagline}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            <div className="border border-black p-5">
                                <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Overview</h2>
                                <p className="font-mono text-sm text-neutral-600 leading-relaxed">{template.description}</p>
                            </div>

                            {/* Steps */}
                            <div className="border border-black p-5">
                                <h2 className="font-mono text-xs uppercase tracking-widest mb-5">Implementation Steps</h2>
                                <div className="space-y-4">
                                    {template.steps.map((step, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex-shrink-0 w-7 h-7 border border-black flex items-center justify-center font-mono text-xs font-bold">
                                                {i + 1}
                                            </div>
                                            <p className="font-mono text-sm text-neutral-600 leading-relaxed pt-1">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Outcome */}
                            <div className="border border-black bg-black p-5 text-white">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-400" />
                                    <div>
                                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">Expected Outcome</h2>
                                        <p className="font-mono text-sm text-white leading-relaxed">{template.outcome}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: sidebar */}
                        <div className="space-y-5">
                            {/* Recommended tools */}
                            {recommendedToolObjects.length > 0 && (
                                <div className="border border-black p-5">
                                    <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Recommended Stack</h2>
                                    <div className="space-y-3">
                                        {recommendedToolObjects.map((tool) => (
                                            <Link
                                                key={tool.id}
                                                href={`/research/${tool.slug}`}
                                                className="flex items-center gap-3 group hover:bg-neutral-50 -mx-2 px-2 py-1.5 transition-colors"
                                            >
                                                <Image
                                                    src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=32`}
                                                    alt={tool.name}
                                                    width={24}
                                                    height={24}
                                                    className="w-6 h-6 object-contain flex-shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-serif text-sm group-hover:underline underline-offset-2">{tool.name}</p>
                                                    <p className="font-mono text-[9px] text-neutral-400 truncate">{tool.tagline}</p>
                                                </div>
                                                <span className="font-mono text-xs font-bold flex-shrink-0">{tool.overallScore.toFixed(1)}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick facts */}
                            <div className="border border-black p-5">
                                <h2 className="font-mono text-xs uppercase tracking-widest mb-4">Quick Facts</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Category</span>
                                        <span className="font-mono text-xs">{template.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Use Case</span>
                                        <span className="font-mono text-xs text-right max-w-[55%]">{template.useCase.split(" ").slice(0, 6).join(" ")}…</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Setup Time</span>
                                        <span className="font-mono text-xs">{template.estimatedSetup}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Steps</span>
                                        <span className="font-mono text-xs">{template.steps.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Tools Required</span>
                                        <span className="font-mono text-xs">{template.recommendedTools.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="border border-black p-5">
                                <h2 className="font-mono text-xs uppercase tracking-widest mb-3">Tags</h2>
                                <div className="flex flex-wrap gap-1.5">
                                    {template.tags.map((tag) => (
                                        <span key={tag} className="font-mono text-[9px] uppercase tracking-widest border border-neutral-300 px-2 py-0.5 text-neutral-500">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="border border-black bg-black text-white p-5">
                                <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">Track your stack</p>
                                <p className="font-serif text-base font-normal mb-4 text-white leading-snug">
                                    Research every tool in this template with AI-powered reports.
                                </p>
                                <Link
                                    href="/sign-up"
                                    className="block text-center bg-white text-black px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-white"
                                >
                                    Get Started Free →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related templates */}
                {otherTemplates.length > 0 && (
                    <section className="mt-12 pt-8 border-t border-black/10 mb-12">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">Related Templates</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-black bg-black">
                            {otherTemplates.map((tpl) => (
                                <Link
                                    key={tpl.id}
                                    href={`/research/templates/${tpl.slug}`}
                                    className="group bg-white hover:bg-[#F3F3EF] transition-colors p-5 flex flex-col gap-2"
                                >
                                    <span className="font-mono text-[9px] uppercase tracking-widest border border-neutral-300 px-1.5 py-0.5 text-neutral-500 w-fit">
                                        {tpl.category}
                                    </span>
                                    <h3 className="font-serif text-base group-hover:underline underline-offset-2">{tpl.name}</h3>
                                    <p className="font-mono text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{tpl.tagline}</p>
                                    <span className="flex items-center gap-1 font-mono text-[10px] text-neutral-400 mt-auto">
                                        <ArrowRight className="w-3 h-3" /> View template
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <MarketingFooter />
            </main>
        </>
    );
}
