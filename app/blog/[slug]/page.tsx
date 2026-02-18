import Link from "next/link";
import { getPost, posts } from "@/lib/posts";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) return {};
    return {
        title: `${post.title} — Trackr Blog`,
        description: post.excerpt,
    };
}

export function generateStaticParams() {
    return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPost(slug);

    if (!post) notFound();

    const user = await currentUser();

    // Convert simple markdown headings and bold to basic HTML
    const renderContent = (content: string) => {
        return content
            .split("\n")
            .map((line, i) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("## ")) {
                    return <h2 key={i} className="text-2xl font-serif font-normal mt-10 mb-4">{trimmed.slice(3)}</h2>;
                }
                if (trimmed.startsWith("### ")) {
                    return <h3 key={i} className="text-lg font-serif font-normal mt-6 mb-2">{trimmed.slice(4)}</h3>;
                }
                if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                    return <p key={i} className="font-mono text-sm font-semibold text-black mt-4 mb-1">{trimmed.slice(2, -2)}</p>;
                }
                if (trimmed === "") {
                    return <div key={i} className="h-2" />;
                }
                // Handle inline bold
                const parts = trimmed.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={i} className="font-mono text-sm text-neutral-700 leading-relaxed mb-0">
                        {parts.map((part, j) =>
                            j % 2 === 1 ? <strong key={j} className="text-black">{part}</strong> : part
                        )}
                    </p>
                );
            });
    };

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-6">
            <MarketingNavigation isLoggedIn={!!user} />

            <section className="py-24 border-t border-black/10">
                <div className="max-w-2xl">
                    <Link href="/blog" className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-black transition-colors mb-8">
                        <ArrowLeft className="w-3 h-3" /> Back to Blog
                    </Link>

                    <div className="font-mono text-xs text-neutral-400 mb-4">
                        {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-normal mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-12 border-b border-black/10 pb-8">
                        {post.excerpt}
                    </p>

                    <article className="space-y-1">
                        {renderContent(post.content)}
                    </article>

                    <div className="mt-16 pt-8 border-t border-black/10">
                        <div className="border border-black p-6">
                            <p className="font-mono text-xs text-neutral-500 mb-3">Want to evaluate AI tools faster?</p>
                            <h3 className="text-xl font-serif font-normal mb-3">Try Trackr free — no credit card required.</h3>
                            <Link
                                href="/sign-up"
                                className="inline-block border border-black bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                            >
                                Get started →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
