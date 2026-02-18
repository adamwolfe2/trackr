import Link from "next/link";
import { Button } from "@/components/ui/button";
import { posts } from "@/lib/posts";
import { formatDistanceToNow } from "date-fns";

import { Header } from "@/components/marketing/header";

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-emerald-500/30">
            <Header />

            <main className="pt-32 pb-16 container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Latest Updates
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">
                        News, guides, and insights from the Trackr team.
                    </p>
                </div>

                <div className="grid gap-8">
                    {posts.map(post => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                            <article className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="text-sm text-zinc-500 mb-2">
                                    {new Date(post.date).toLocaleDateString()}
                                </div>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {post.excerpt}
                                </p>
                            </article>
                        </Link>
                    ))}
                </div>
            </main>

            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-900 mt-24">
                <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
                    <p>&copy; 2024 Trackr Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
