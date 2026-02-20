import Link from "next/link";
import { getPostBySlug, getAllSlugs, markdownToHtml } from "@/lib/blog";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};

    return {
        title: `${post.title} — Trackr Blog`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: post.date,
            authors: [post.author],
            url: `https://trytrackr.com/blog/${slug}`,
            images: [
                {
                    url: post.image,
                    width: 1456,
                    height: 816,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
            images: [post.image],
        },
    };
}

export function generateStaticParams() {
    return getAllSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) notFound();

    const user = await currentUser();
    const htmlContent = markdownToHtml(post.content);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        author: {
            "@type": "Organization",
            name: post.author,
        },
        publisher: {
            "@type": "Organization",
            name: "Trackr",
            url: "https://trytrackr.com",
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://trytrackr.com/blog/${slug}`,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6">
                <MarketingNavigation isLoggedIn={!!user} />

                <section className="py-24 border-t border-black/10">
                    <div className="max-w-2xl">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-black transition-colors mb-8"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to Blog
                        </Link>

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
                            <span className="text-neutral-300">|</span>
                            <span>{post.author}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif font-normal mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-12 border-b border-black/10 pb-8">
                            {post.description}
                        </p>

                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 border border-neutral-300 px-2 py-0.5"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <article
                            className="blog-content"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />

                        {/* CTA Banner */}
                        <div className="mt-16 pt-8 border-t border-black/10">
                            <div className="border border-black bg-black text-white p-8 md:p-10">
                                <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-3">
                                    Stop researching manually
                                </p>
                                <h3 className="text-xl md:text-2xl font-serif font-normal mb-4 text-white">
                                    Research any AI tool in under 2 minutes.
                                </h3>
                                <p className="font-mono text-sm text-neutral-400 mb-6 max-w-md">
                                    Submit a tool URL. Get a scored report with features, pricing, reviews, and competitive analysis.
                                </p>
                                <Link
                                    href="/sign-up"
                                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    Get Started Free <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <MarketingFooter />
            </main>
        </>
    );
}
