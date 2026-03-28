"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    createPublicProfile,
    updatePublicProfile,
    publishProfile,
    unpublishProfile,
} from "@/lib/actions/public-profile";
import { EmbedCodeGenerator } from "@/components/public/embed-code-generator";
import { Globe, Eye, EyeOff, ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";

type ProfileData = {
    id: string;
    slug: string;
    headline: string | null;
    description: string | null;
    showScores: boolean;
    showSpend: boolean;
    showHealth: boolean;
    isPublished: boolean;
};

type PublicProfileClientProps = {
    workspaceId: string;
    existingProfile: ProfileData | null;
    canEmbed: boolean;
};

export function PublicProfileClient({
    workspaceId,
    existingProfile,
    canEmbed,
}: PublicProfileClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [slug, setSlug] = useState(existingProfile?.slug ?? "");
    const [headline, setHeadline] = useState(existingProfile?.headline ?? "");
    const [description, setDescription] = useState(existingProfile?.description ?? "");
    const [showScores, setShowScores] = useState(existingProfile?.showScores ?? true);
    const [showSpend, setShowSpend] = useState(existingProfile?.showSpend ?? false);
    const [showHealth, setShowHealth] = useState(existingProfile?.showHealth ?? true);

    const isPublished = existingProfile?.isPublished ?? false;
    const hasProfile = existingProfile !== null;

    function handleSave() {
        if (!slug.trim()) {
            toast.error("URL slug is required");
            return;
        }

        startTransition(async () => {
            try {
                if (hasProfile) {
                    await updatePublicProfile(workspaceId, {
                        slug: slug.trim(),
                        headline: headline.trim() || undefined,
                        description: description.trim() || undefined,
                        showScores,
                        showSpend,
                        showHealth,
                    });
                    toast.success("Profile updated");
                } else {
                    await createPublicProfile(workspaceId, {
                        slug: slug.trim(),
                        headline: headline.trim() || undefined,
                        description: description.trim() || undefined,
                    });
                    toast.success("Profile created");
                }
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to save profile");
            }
        });
    }

    function handleTogglePublish() {
        startTransition(async () => {
            try {
                if (isPublished) {
                    await unpublishProfile(workspaceId);
                    toast.success("Profile unpublished");
                } else {
                    await publishProfile(workspaceId);
                    toast.success("Profile published");
                }
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to update publish status");
            }
        });
    }

    const profileUrl = slug ? `https://trytrackr.com/stack/${slug}` : null;

    return (
        <div className="space-y-8 max-w-2xl animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-normal">Public Stack Profile</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">
                    Share your AI tool stack publicly or embed it on your website
                </p>
            </div>

            {/* Profile Form */}
            <div className="border border-black bg-white p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-neutral-500" />
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                        Profile Settings
                    </h2>
                </div>

                {/* Slug */}
                <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                        URL Slug
                    </label>
                    <div className="flex items-center gap-0 border border-black">
                        <span className="bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-400 border-r border-black shrink-0">
                            trytrackr.com/stack/
                        </span>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) =>
                                setSlug(
                                    e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]/g, "-")
                                        .replace(/-+/g, "-")
                                )
                            }
                            className="flex-1 px-3 py-2 font-mono text-sm bg-white focus:outline-none"
                            placeholder="your-company"
                        />
                    </div>
                </div>

                {/* Headline */}
                <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                        Headline (optional)
                    </label>
                    <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder="e.g., Building the future with AI-first tools"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                        Description (optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none h-20"
                        placeholder="Brief description of your company's AI strategy"
                    />
                </div>

                {/* Visibility Toggles */}
                <div className="space-y-3">
                    <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block">
                        Visibility
                    </span>

                    <label className="flex items-center justify-between border border-neutral-200 p-3 cursor-pointer hover:bg-neutral-50 transition-colors">
                        <div>
                            <span className="font-mono text-sm">Show Tool Scores</span>
                            <p className="font-mono text-[10px] text-neutral-400">
                                Display overall scores next to each tool
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={showScores}
                            onChange={(e) => setShowScores(e.target.checked)}
                            className="w-4 h-4 accent-black"
                        />
                    </label>

                    <label className="flex items-center justify-between border border-neutral-200 p-3 cursor-pointer hover:bg-neutral-50 transition-colors">
                        <div>
                            <span className="font-mono text-sm">Show Health Score</span>
                            <p className="font-mono text-[10px] text-neutral-400">
                                Display your stack health score
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={showHealth}
                            onChange={(e) => setShowHealth(e.target.checked)}
                            className="w-4 h-4 accent-black"
                        />
                    </label>

                    <label className="flex items-center justify-between border border-neutral-200 p-3 cursor-pointer hover:bg-neutral-50 transition-colors">
                        <div>
                            <span className="font-mono text-sm">Show Spend Summary</span>
                            <p className="font-mono text-[10px] text-neutral-400">
                                Display monthly spend totals (typically hidden)
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={showSpend}
                            onChange={(e) => setShowSpend(e.target.checked)}
                            className="w-4 h-4 accent-black"
                        />
                    </label>
                </div>

                {/* Save */}
                <button
                    onClick={handleSave}
                    disabled={isPending || !slug.trim()}
                    className="flex items-center gap-2 border border-black bg-black text-white px-6 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {hasProfile ? "Update Profile" : "Create Profile"}
                </button>
            </div>

            {/* Publish Controls */}
            {hasProfile && (
                <div className="border border-black bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                                Publish Status
                            </h3>
                            <p className="font-serif text-lg">
                                {isPublished ? "Published" : "Unpublished"}
                            </p>
                        </div>
                        <button
                            onClick={handleTogglePublish}
                            disabled={isPending}
                            className={`flex items-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50 ${
                                isPublished
                                    ? "border-black bg-white text-black hover:bg-neutral-100"
                                    : "border-black bg-black text-white hover:bg-white hover:text-black"
                            }`}
                        >
                            {isPublished ? (
                                <>
                                    <EyeOff className="w-4 h-4" />
                                    Unpublish
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4" />
                                    Publish
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview Link */}
                    {profileUrl && (
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-neutral-400">URL:</span>
                            <a
                                href={`/stack/${slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs underline flex items-center gap-1 hover:text-neutral-600"
                            >
                                {profileUrl}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Embed Widget */}
            {hasProfile && canEmbed && <EmbedCodeGenerator slug={slug} />}

            {/* Embed Upgrade Prompt */}
            {hasProfile && !canEmbed && (
                <div className="border border-neutral-200 bg-neutral-50 p-6 text-center">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Embed Widget
                    </h3>
                    <p className="font-mono text-sm text-neutral-500 mb-4">
                        Upgrade to Startup plan to embed your stack widget on external websites.
                    </p>
                    <a
                        href="/settings/billing"
                        className="inline-block border border-black bg-black text-white px-6 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                        View Plans
                    </a>
                </div>
            )}
        </div>
    );
}
