import Link from "next/link";
import { posts } from "@/lib/posts";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog — Trackr",
    description: "Guides, insights, and tool recommendations from the Trackr team.",
};

export default async function BlogIndex() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-6">
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

                <div className="border border-black divide-y divide-black">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                            <div className="p-8 hover:bg-black/[0.02] transition-colors">
                                <div className="font-mono text-xs text-neutral-400 mb-3">
                                    {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                </div>
                                <h2 className="text-xl md:text-2xl font-serif font-normal mb-3 group-hover:underline">
                                    {post.title}
                                </h2>
                                <p className="font-mono text-sm text-neutral-500 leading-relaxed max-w-2xl">
                                    {post.excerpt}
                                </p>
                                <div className="mt-4 font-mono text-xs uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors">
                                    Read article →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
