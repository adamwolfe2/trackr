"use client";

import { useState } from "react";
import { Globe, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { publishReport } from "@/lib/actions/tools";

interface PublishButtonProps {
    reportId: string;
    isPublic: boolean;
    publicSlug: string | null;
}

export function PublishButton({ reportId, isPublic, publicSlug }: PublishButtonProps) {
    const [loading, setLoading] = useState(false);
    const [published, setPublished] = useState(isPublic);
    const [slug, setSlug] = useState(publicSlug);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const result = await publishReport(reportId);
            setPublished(result.published);
            setSlug(result.slug);
            if (result.published && result.slug) {
                toast.success(
                    <span>
                        Published to{" "}
                        <a
                            href={`/research/${result.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                        >
                            /research/{result.slug}
                        </a>
                    </span>
                );
            } else {
                toast.success("Report unpublished from library");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update publish status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={published && slug ? `Published at /research/${slug}` : "Publish to public tool library"}
            className={`flex items-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                published
                    ? "border-black bg-black text-white hover:bg-neutral-800"
                    : "border-black bg-white hover:bg-neutral-100"
            }`}
        >
            {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : published ? (
                <Globe className="h-3 w-3" />
            ) : (
                <Lock className="h-3 w-3" />
            )}
            {published ? "Published" : "Publish"}
        </button>
    );
}
