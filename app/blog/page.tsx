import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog — Trackr",
    description: "Guides, insights, and tool recommendations for ops teams evaluating AI tools. From the Trackr team.",
    alternates: {
        canonical: "https://trytrackr.com/blog",
    },
    openGraph: {
        title: "Blog — Trackr",
        description: "Guides, insights, and tool recommendations for ops teams evaluating AI tools.",
        type: "website",
        url: "https://trytrackr.com/blog",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Trackr Blog" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog — Trackr",
        description: "Guides, insights, and tool recommendations for ops teams evaluating AI tools.",
        images: ["/og.png"],
    },
};

export default async function BlogIndex() {
    const user = await currentUser();
    const posts = getAllPosts();

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
            <MarketingNavigation isLoggedIn={!!user} />

            <section className="py-24 border-t border-black/10">
                <div className="mb-16">
                    <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">Blog</span>
                    <h1 className="text-3xl md:text-5xl font-serif font-normal mb-4">
                        Guides & insights.
                    </h1>
                    <p className="font-mono text-sm text-neutral-500 max-w-lg">
                        How ops teams evaluate tools, track spend, and stay current on AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group block border border-black bg-white p-6 transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                        >
                            <div className="flex items-center gap-3 font-mono text-xs text-neutral-400 mb-4">
                                <time dateTime={post.date}>
                                    {new Date(post.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </time>
                                <span className="text-neutral-300">|</span>
                                <span>{post.readingTime} min read</span>
                            </div>

                            <h2 className="text-lg md:text-xl font-serif font-normal mb-3 group-hover:underline underline-offset-2 leading-snug">
                                {post.title}
                            </h2>

                            <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-4 line-clamp-3">
                                {post.description}
                            </p>

                            {post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 border border-neutral-300 px-2 py-0.5"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors">
                                Read article →
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
