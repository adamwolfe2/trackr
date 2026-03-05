import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/actions/public-profile";
import { StackWidget } from "@/components/public/stack-widget";
import Link from "next/link";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await getPublicProfile(slug);
    if (!data) {
        return { title: "Not Found" };
    }
    return {
        title: `${data.workspace.name} AI Stack | Trackr`,
        description:
            data.profile.headline ??
            `View ${data.workspace.name}'s AI tool stack, powered by Trackr.`,
        openGraph: {
            title: `${data.workspace.name} AI Stack`,
            description:
                data.profile.headline ??
                `AI tool stack for ${data.workspace.name}. ${data.tools.length} tools tracked.`,
            url: `https://trytrackr.com/stack/${slug}`,
            siteName: "Trackr",
            type: "website",
        },
        twitter: {
            card: "summary",
            title: `${data.workspace.name} AI Stack`,
            description: data.profile.headline ?? `AI tool stack powered by Trackr`,
        },
    };
}

export default async function PublicStackPage({ params }: Props) {
    const { slug } = await params;
    const data = await getPublicProfile(slug);

    if (!data) notFound();

    return (
        <div className="min-h-screen bg-[#F3F3EF] text-black">
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
                <StackWidget
                    companyName={data.workspace.name}
                    headline={data.profile.headline}
                    description={data.profile.description}
                    tools={data.tools}
                    aiNativeness={data.aiNativeness}
                    healthScore={data.healthScore}
                    spendSummary={data.spendSummary}
                    showScores={data.profile.showScores}
                    showHealth={data.profile.showHealth}
                    showSpend={data.profile.showSpend}
                />

                {/* Powered by Trackr CTA */}
                <div className="mt-16 border-t border-black pt-8 text-center">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">
                        Powered by
                    </p>
                    <Link
                        href="https://trytrackr.com"
                        className="font-serif text-xl hover:underline"
                    >
                        Trackr
                    </Link>
                    <p className="font-mono text-sm text-neutral-500 mt-2 mb-6">
                        AI Tool Intelligence for Ops Teams
                    </p>
                    <Link
                        href="/audit"
                        className="inline-block border border-black bg-black text-white px-8 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                        Get Your Free Stack Audit
                    </Link>
                </div>
            </div>
        </div>
    );
}
