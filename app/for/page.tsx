import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import { ICP_PAGES } from "@/data/icp-pages.seed";

export const revalidate = false;

export const metadata: Metadata = {
    title: "Trackr for Your Team — Role-Specific AI Tool Intelligence | Trackr",
    description: "Trackr for ops teams, RevOps, founders, engineering, marketing, finance, chiefs of staff, and IT leaders. See how AI tool research works for your specific role.",
    openGraph: {
        title: "Trackr for Your Team",
        description: "Role-specific AI tool intelligence for every buyer persona — from ops teams and RevOps to founders and IT leaders.",
        url: "https://trytrackr.com/for",
    },
    alternates: { canonical: "https://trytrackr.com/for" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trackr", item: "https://trytrackr.com" },
        { "@type": "ListItem", position: 2, name: "For Teams", item: "https://trytrackr.com/for" },
    ],
};

export default async function ForHubPage() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MarketingNavigation isLoggedIn={!!user} />

            <section className="pt-20 pb-12 border-t border-black/10">
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                    Built for your team
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4 max-w-2xl">
                    Trackr for Every Team
                </h1>
                <p className="font-mono text-sm text-neutral-600 max-w-xl leading-relaxed">
                    AI tool research looks different depending on who you are and what you need.
                    See how Trackr solves the specific problems your role faces.
                </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ICP_PAGES.map((page) => (
                    <Link
                        key={page.role}
                        href={`/for/${page.role}`}
                        className="group border border-black p-6 bg-white hover:bg-[#F3F3EF] transition-colors block"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
                                    For {page.role.replace(/-/g, " ")}
                                </p>
                                <h2 className="font-serif text-xl font-normal">
                                    {page.headline}
                                </h2>
                            </div>
                            <ArrowRight className="w-4 h-4 mt-1 text-neutral-400 group-hover:text-black transition-colors flex-shrink-0" />
                        </div>
                        <p className="font-mono text-xs text-neutral-500 leading-relaxed line-clamp-2">
                            {page.subheadline}
                        </p>
                    </Link>
                ))}
            </section>

            <section className="mt-16 border border-black p-8 bg-white">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
                    Not sure which fits best?
                </p>
                <h2 className="font-serif text-2xl font-normal mb-4">
                    Start with the free tier
                </h2>
                <p className="font-mono text-sm text-neutral-600 mb-6 leading-relaxed max-w-lg">
                    Every plan starts free — 3 research reports per month, no credit card required.
                    Most teams find their use case in the first session.
                </p>
                <Link
                    href="/sign-up"
                    className="font-mono text-sm bg-black text-white border border-black px-6 py-3 inline-block hover:bg-neutral-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                    Start free
                </Link>
            </section>

            <MarketingFooter />
        </main>
    );
}
