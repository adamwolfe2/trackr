import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPost } from "@/lib/posts";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Header } from "@/components/marketing/header";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const post = getPost(slug);

    if (!post) notFound();

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-emerald-500/30">
            <Header />

            <main className="pt-32 pb-16 container mx-auto px-4 max-w-3xl">
                <Link href="/blog" className="inline-flex items-center text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                </Link>

                <article className="prose prose-zinc dark:prose-invert lg:prose-xl">
                    <h1>{post.title}</h1>
                    <div className="text-sm text-zinc-500 mb-8">
                        {new Date(post.date).toLocaleDateString()}
                    </div>
                    {/* Note: In a real app, use a proper MDX renderer. For simplicity, we assume generic markdown rendering here or plain text for now if no lib installed */}
                    <div className="whitespace-pre-line">
                        {post.content}
                    </div>
                </article>
            </main>

            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-900 mt-24">
                <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
                    <p>&copy; 2024 Trackr Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
