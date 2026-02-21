import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import { markdownToHtml } from "@/lib/blog";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
    title: "Changelog — Trackr",
    description: "See what's new in Trackr — feature releases, improvements, and bug fixes.",
    openGraph: {
        title: "Changelog — Trackr",
        description: "See what's new in Trackr — feature releases, improvements, and bug fixes.",
        type: "website",
        url: "https://trytrackr.com/changelog",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Changelog" }],
    },
    alternates: {
        canonical: "https://trytrackr.com/changelog",
    },
};

export default async function ChangelogPage() {
    const user = await currentUser();
    const raw = fs.readFileSync(path.join(process.cwd(), "content/changelog.md"), "utf-8");
    const html = markdownToHtml(raw);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Trackr Changelog",
        description: "Feature releases, improvements, and bug fixes for Trackr.",
        url: "https://trytrackr.com/changelog",
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={!!user} />

                <section className="py-20 border-t border-black/10">
                    <div className="max-w-2xl">
                        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">Product Updates</p>
                        <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4">Changelog</h1>
                        <p className="font-mono text-sm text-neutral-600 mb-12">
                            New features, improvements, and fixes — in order of release.
                        </p>
                    </div>

                    <article
                        className="blog-content max-w-2xl"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
