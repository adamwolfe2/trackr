import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { INDUSTRY_PAGES, INDUSTRY_SLUGS } from "@/data/industries.seed";
import { ICP_PAGES } from "@/data/icp-pages.seed";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

// Fully static
export const revalidate = false;

export async function generateStaticParams() {
    return INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const page = INDUSTRY_PAGES.find((p) => p.slug === slug);
    if (!page) return { title: "Not Found — Trackr" };

    return {
        title: page.title,
        description: page.description,
        openGraph: {
            title: page.title,
            description: page.description,
            url: `https://trytrackr.com/industries/${slug}`,
            images: [{ url: "/og.png", width: 1456, height: 816, alt: page.headline }],
        },
        alternates: { canonical: `https://trytrackr.com/industries/${slug}` },
    };
}

export default async function IndustryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const page = INDUSTRY_PAGES.find((p) => p.slug === slug);
    if (!page) notFound();

    const industryDisplayName = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const relatedRolePages = ICP_PAGES.filter((p) =>
        page.relatedRoles.includes(p.role)
    );

    const otherIndustries = INDUSTRY_PAGES.filter((p) => p.slug !== slug);

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "FAQPage",
                mainEntity: page.faqs.map(({ q, a }) => ({
                    "@type": "Question",
                    name: q,
                    acceptedAnswer: { "@type": "Answer", text: a },
                })),
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                    { "@type": "ListItem", position: 2, name: "Industries", item: "https://trytrackr.com/industries" },
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: industryDisplayName,
                        item: `https://trytrackr.com/industries/${slug}`,
                    },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation />

                {/* ── Hero ── */}
                <section className="py-20 border-t border-black/10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1">
                                Industry
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                                {industryDisplayName}
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight">
                            {page.headline}
                        </h1>
                        <p className="font-mono text-base text-neutral-600 mb-8 max-w-xl leading-relaxed">
                            {page.subheadline}
                        </p>

                        {/* Stat */}
                        <div className="inline-flex items-center gap-4 border border-black px-6 py-4 mb-8 bg-[#F3F3EF]">
                            <TrendingUp className="w-4 h-4 flex-shrink-0" />
                            <div>
                                <div className="font-mono text-2xl font-bold">{page.stat.value}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                                    {page.stat.label}
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                            >
                                {page.ctaText} →
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 border border-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                            >
                                Browse Tool Library
                            </Link>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-400 mt-3">{page.ctaSubtext}</p>
                    </div>
                </section>

                {/* ── Pain Points ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                        The problem
                    </p>
                    <h2 className="font-serif text-2xl font-normal mb-8">
                        Why AI tool decisions break down in {industryDisplayName.toLowerCase()}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-black bg-black">
                        {page.painPoints.map((pp, i) => (
                            <div key={i} className="bg-white p-6">
                                <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                                    {String(i + 1).padStart(2, "0")}
                                </div>
                                <h3 className="font-serif text-lg mb-3">{pp.title}</h3>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                    {pp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Typical Tool Stack ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                        Common stack
                    </p>
                    <h2 className="font-serif text-2xl font-normal mb-6">
                        Typical AI tools used in {industryDisplayName.toLowerCase()}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {page.toolStack.map((tool) => (
                            <span
                                key={tool}
                                className="border border-black px-4 py-2 font-mono text-xs bg-white"
                            >
                                {tool}
                            </span>
                        ))}
                    </div>
                    <p className="font-mono text-[10px] text-neutral-400 mt-4">
                        Trackr has research reports for all of these tools and hundreds more. Start free
                        to access the full library.
                    </p>
                </section>

                {/* ── Compliance Needs ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                        Compliance context
                    </p>
                    <h2 className="font-serif text-2xl font-normal mb-6">
                        Frameworks that apply to your AI stack
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {page.complianceNeeds.map((framework) => (
                            <span
                                key={framework}
                                className="border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest bg-[#F3F3EF]"
                            >
                                {framework}
                            </span>
                        ))}
                    </div>
                    <p className="font-mono text-xs text-neutral-500 mt-4 max-w-lg leading-relaxed">
                        Every Trackr tool report surfaces compliance documentation relevant to your
                        regulatory environment — so your legal and security teams can evaluate vendors
                        without starting from scratch.
                    </p>
                </section>

                {/* ── Features ── */}
                <section className="py-14 border-t border-black/10">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                        How Trackr helps
                    </p>
                    <h2 className="font-serif text-2xl font-normal mb-8">
                        What Trackr does for {industryDisplayName.toLowerCase()} teams
                    </h2>
                    <div className="space-y-px border border-black">
                        {page.features.map((feat, i) => (
                            <div key={i} className="bg-white p-6 flex gap-5 items-start">
                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-mono text-sm font-bold mb-2">{feat.title}</h3>
                                    <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                                        {feat.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA Block ── */}
                <section className="py-14 border-t border-black/10">
                    <div className="border border-black bg-black text-white p-10 max-w-3xl">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                            Get started
                        </p>
                        <h2 className="font-serif text-3xl font-normal mb-4 text-white">
                            {page.headline}
                        </h2>
                        <p className="font-mono text-sm text-neutral-400 mb-8 max-w-lg leading-relaxed">
                            {page.subheadline}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                            >
                                {page.ctaText} →
                            </Link>
                            <Link
                                href="/research"
                                className="inline-flex items-center gap-2 border border-neutral-700 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-white transition-colors text-white"
                            >
                                Browse Library
                            </Link>
                        </div>
                        <p className="font-mono text-[10px] text-neutral-500 mt-4">{page.ctaSubtext}</p>
                    </div>
                </section>

                {/* ── FAQs ── */}
                <section className="py-14 border-t border-black/10">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="border border-black divide-y divide-neutral-100 max-w-3xl">
                        {page.faqs.map((faq, i) => (
                            <div key={i} className="p-5">
                                <h3 className="font-mono text-sm font-bold mb-2">{faq.q}</h3>
                                <p className="font-mono text-xs text-neutral-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Related Roles ── */}
                {relatedRolePages.length > 0 && (
                    <section className="py-8 border-t border-black/10">
                        <div className="flex items-center justify-between mb-5">
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                                Built for these roles
                            </p>
                            <Link
                                href="/for"
                                className="font-mono text-xs text-neutral-500 hover:text-black hover:underline"
                            >
                                See all roles →
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {relatedRolePages.map((p) => (
                                <Link
                                    key={p.role}
                                    href={`/for/${p.role}`}
                                    className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                                >
                                    {p.role.replace(/-/g, " ")} <ArrowRight className="w-3 h-3" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Other Industries ── */}
                <section className="py-8 border-t border-black/10 mb-16">
                    <div className="flex items-center justify-between mb-5">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                            Other industries
                        </p>
                        <Link
                            href="/industries"
                            className="font-mono text-xs text-neutral-500 hover:text-black hover:underline"
                        >
                            See all industries →
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {otherIndustries.slice(0, 12).map((p) => (
                            <Link
                                key={p.slug}
                                href={`/industries/${p.slug}`}
                                className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-[#F3F3EF] transition-colors"
                            >
                                {p.slug.replace(/-/g, " ")} <ArrowRight className="w-3 h-3" />
                            </Link>
                        ))}
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
