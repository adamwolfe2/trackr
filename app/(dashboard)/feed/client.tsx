"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Bookmark, BookmarkCheck, CheckCheck, ExternalLink,
    PlusCircle, Rss, Search, Settings, Sparkles, Trash2, X, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import {
    createFeedChannel, updateFeedChannel, deleteFeedChannel,
    markFeedItemRead, toggleFeedItemSaved, markAllRead,
    type ChannelConfig,
} from "@/lib/actions/feed";
import { dismissSuggestion } from "@/lib/actions/suggestions";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type Channel = {
    id: string;
    name: string;
    type: string;
    config: unknown;
    enabled: boolean;
    lastFetchedAt: Date | null;
    createdAt: Date;
};

type FeedItem = {
    id: string;
    channelId: string | null;
    title: string;
    url: string;
    source: string | null;
    publishedAt: Date | null;
    summary: string | null;
    relevanceScore: string | null;
    categories: string[] | null;
    isRead: boolean;
    isSaved: boolean;
    createdAt: Date;
    channel: Channel | null;
};

type Suggestion = {
    id: string;
    toolName: string;
    websiteUrl: string | null;
    reason: string;
    confidence: string;
    status: string;
    matchedPainPoint: { id: string; title: string } | null;
    createdAt: Date;
};

type FilterMode = "all" | "unread" | "saved";

export function FeedClient({ channels, items, suggestions = [] }: { channels: Channel[]; items: FeedItem[]; suggestions?: Suggestion[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [activeChannel, setActiveChannel] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddChannel, setShowAddChannel] = useState(false);

    // Filter items
    let filteredItems = items;
    if (filterMode === "unread") filteredItems = filteredItems.filter(i => !i.isRead);
    if (filterMode === "saved") filteredItems = filteredItems.filter(i => i.isSaved);
    if (activeChannel) filteredItems = filteredItems.filter(i => i.channelId === activeChannel);

    // Sort: saved first, then by relevance, then by date
    filteredItems = [...filteredItems].sort((a, b) => {
        if (a.isSaved !== b.isSaved) return a.isSaved ? -1 : 1;
        const ra = parseFloat(a.relevanceScore || "0");
        const rb = parseFloat(b.relevanceScore || "0");
        if (Math.abs(ra - rb) > 0.2) return rb - ra;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const unreadCount = items.filter(i => !i.isRead).length;

    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllRead(activeChannel || undefined);
            router.refresh();
            toast.success("Marked all as read");
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Intelligence Feed</p>
                    <h1 className="font-serif text-2xl font-normal">Your Feed</h1>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                        AI-curated articles from your channels, ranked by relevance.
                        {unreadCount > 0 && <span className="ml-2 font-semibold">{unreadCount} unread</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            disabled={isPending}
                            className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs hover:bg-neutral-100 disabled:opacity-40"
                        >
                            <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
                        </button>
                    )}
                    <button
                        onClick={() => { setShowSettings(s => !s); setShowAddChannel(false); }}
                        className="flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs hover:bg-neutral-100"
                    >
                        <Settings className="h-3.5 w-3.5" /> Channels
                    </button>
                </div>
            </div>

            {/* Channel Settings Panel */}
            {showSettings && (
                <ChannelSettingsPanel
                    channels={channels}
                    showAddChannel={showAddChannel}
                    setShowAddChannel={setShowAddChannel}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {/* Filter bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex border border-black">
                    {(["all", "unread", "saved"] as FilterMode[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setFilterMode(mode)}
                            className={`px-3 py-1.5 font-mono text-xs capitalize ${
                                filterMode === mode ? "bg-black text-white" : "hover:bg-neutral-100"
                            } ${mode !== "all" ? "border-l border-black" : ""}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => setActiveChannel(null)}
                        className={`px-2.5 py-1 font-mono text-[10px] border transition-all ${
                            !activeChannel ? "bg-black text-white border-black" : "border-neutral-200 text-neutral-500 hover:border-black"
                        }`}
                    >
                        All Channels
                    </button>
                    {channels.map(ch => (
                        <button
                            key={ch.id}
                            onClick={() => setActiveChannel(activeChannel === ch.id ? null : ch.id)}
                            className={`px-2.5 py-1 font-mono text-[10px] border transition-all ${
                                activeChannel === ch.id ? "bg-black text-white border-black" : "border-neutral-200 text-neutral-500 hover:border-black"
                            }`}
                        >
                            {ch.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Suggested Tools (from proactive agent) */}
            {suggestions.length > 0 && (
                <SuggestionsPanel suggestions={suggestions} />
            )}

            {/* Empty states */}
            {channels.length === 0 ? (
                <div className="border border-dashed border-black/30 py-16 text-center">
                    <Rss className="w-6 h-6 text-neutral-400 mx-auto mb-3" />
                    <p className="font-serif text-lg text-neutral-600 mb-1">No channels configured yet.</p>
                    <p className="font-mono text-xs text-neutral-500 mb-4">Add topic searches or RSS feeds to start building your intelligence feed.</p>
                    <button
                        onClick={() => { setShowSettings(true); setShowAddChannel(true); }}
                        className="inline-flex items-center gap-2 border border-black px-4 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                    >
                        <PlusCircle className="h-3.5 w-3.5" /> Add Your First Channel
                    </button>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="border border-dashed border-black/30 py-16 text-center">
                    <p className="font-serif text-lg text-neutral-600 mb-1">
                        {filterMode === "saved" ? "No saved articles yet." : filterMode === "unread" ? "All caught up!" : "No articles yet."}
                    </p>
                    <p className="font-mono text-xs text-neutral-500">
                        {filterMode === "all"
                            ? "Articles will appear here after the next feed refresh."
                            : "Try switching filters to see more."}
                    </p>
                </div>
            ) : (
                /* Feed list */
                <div className="space-y-0 border border-black divide-y divide-neutral-100">
                    {filteredItems.map(item => (
                        <FeedItemRow key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Feed Item Row ───────────────────────────────────────────────────────────

function FeedItemRow({ item }: { item: FeedItem }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const relevance = parseFloat(item.relevanceScore || "0");
    const relevanceLabel = relevance >= 0.7 ? "High" : relevance >= 0.4 ? "Med" : "Low";
    const relevanceColor = relevance >= 0.7
        ? "border-black text-black"
        : relevance >= 0.4
        ? "border-neutral-300 text-neutral-500"
        : "border-neutral-200 text-neutral-400";

    const handleRead = () => {
        startTransition(async () => {
            await markFeedItemRead(item.id);
            router.refresh();
        });
    };

    const handleSave = () => {
        startTransition(async () => {
            await toggleFeedItemSaved(item.id);
            router.refresh();
        });
    };

    return (
        <div className={`px-5 py-4 ${item.isRead ? "bg-white" : "bg-[#F3F3EF]"}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {!item.isRead && <span className="w-2 h-2 bg-black shrink-0" />}
                        {item.source && (
                            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">{item.source}</span>
                        )}
                        {item.channel && (
                            <span className="font-mono text-[10px] text-neutral-300">· {item.channel.name}</span>
                        )}
                        {item.publishedAt && (
                            <span className="font-mono text-[10px] text-neutral-300">
                                · {formatDistanceToNow(item.publishedAt, { addSuffix: true })}
                            </span>
                        )}
                    </div>

                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-serif text-base hover:underline leading-snug block"
                        onClick={handleRead}
                    >
                        {item.title}
                    </a>

                    {item.summary && (
                        <p className="font-mono text-xs text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">{item.summary}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {item.relevanceScore && (
                            <span className={`font-mono text-[10px] border px-1.5 py-0.5 ${relevanceColor}`}>
                                {relevanceLabel} Relevance
                            </span>
                        )}
                        {item.categories?.map(cat => (
                            <span key={cat} className="font-mono text-[10px] border border-neutral-200 px-1.5 py-0.5 text-neutral-400">
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="border border-neutral-200 p-1.5 hover:border-black text-neutral-400 hover:text-black transition-colors disabled:opacity-40"
                        title={item.isSaved ? "Unsave" : "Save"}
                    >
                        {item.isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </button>
                    <Link
                        href={`/submit?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(item.title.slice(0, 50))}`}
                        className="border border-neutral-200 p-1.5 hover:border-black text-neutral-400 hover:text-black transition-colors"
                        title="Research this tool"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                    </Link>
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleRead}
                        className="border border-neutral-200 p-1.5 hover:border-black text-neutral-400 hover:text-black transition-colors"
                        title="Open article"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}

// ── Channel Settings Panel ──────────────────────────────────────────────────

function ChannelSettingsPanel({
    channels,
    showAddChannel,
    setShowAddChannel,
    onClose,
}: {
    channels: Channel[];
    showAddChannel: boolean;
    setShowAddChannel: (v: boolean) => void;
    onClose: () => void;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Add channel form state
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<"topic" | "rss">("topic");
    const [newKeywords, setNewKeywords] = useState("");
    const [newDomains, setNewDomains] = useState("");
    const [newFeedUrl, setNewFeedUrl] = useState("");

    const handleAdd = () => {
        startTransition(async () => {
            try {
                const config: ChannelConfig = newType === "topic"
                    ? {
                        keywords: newKeywords.split(",").map(k => k.trim()).filter(Boolean),
                        domains: newDomains ? newDomains.split(",").map(d => d.trim()).filter(Boolean) : undefined,
                    }
                    : { feedUrl: newFeedUrl };

                await createFeedChannel({ name: newName.trim(), type: newType, config });
                toast.success("Channel created");
                setNewName("");
                setNewKeywords("");
                setNewDomains("");
                setNewFeedUrl("");
                setShowAddChannel(false);
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to create channel");
            }
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteFeedChannel(id);
            router.refresh();
            toast.success("Channel deleted");
        });
    };

    const handleToggle = (id: string, enabled: boolean) => {
        startTransition(async () => {
            await updateFeedChannel(id, { enabled: !enabled });
            router.refresh();
        });
    };

    return (
        <div className="border border-black bg-white">
            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest">Feed Channels</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddChannel(!showAddChannel)}
                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs hover:bg-neutral-100"
                    >
                        <PlusCircle className="h-3 w-3" /> Add Channel
                    </button>
                    <button onClick={onClose} className="text-neutral-400 hover:text-black">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Add channel form */}
            {showAddChannel && (
                <div className="border-b border-black p-5 space-y-3 bg-[#F3F3EF]">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setNewType("topic")}
                            className={`px-3 py-1.5 font-mono text-xs border ${newType === "topic" ? "bg-black text-white border-black" : "border-neutral-200 hover:border-black"}`}
                        >
                            <Search className="h-3 w-3 inline mr-1.5" />Topic Search
                        </button>
                        <button
                            onClick={() => setNewType("rss")}
                            className={`px-3 py-1.5 font-mono text-xs border ${newType === "rss" ? "bg-black text-white border-black" : "border-neutral-200 hover:border-black"}`}
                        >
                            <Rss className="h-3 w-3 inline mr-1.5" />RSS Feed
                        </button>
                    </div>
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Channel name (e.g. AI Dev Tools)"
                        className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                    />
                    {newType === "topic" ? (
                        <>
                            <input
                                type="text"
                                value={newKeywords}
                                onChange={e => setNewKeywords(e.target.value)}
                                placeholder="Keywords, comma-separated (e.g. AI tools, developer productivity)"
                                className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            />
                            <input
                                type="text"
                                value={newDomains}
                                onChange={e => setNewDomains(e.target.value)}
                                placeholder="Limit to domains (optional, e.g. techcrunch.com, theverge.com)"
                                className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            />
                        </>
                    ) : (
                        <input
                            type="text"
                            value={newFeedUrl}
                            onChange={e => setNewFeedUrl(e.target.value)}
                            placeholder="RSS feed URL (e.g. https://example.com/feed.xml)"
                            className="w-full border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none"
                        />
                    )}
                    <button
                        onClick={handleAdd}
                        disabled={isPending || !newName.trim() || (newType === "topic" ? !newKeywords.trim() : !newFeedUrl.trim())}
                        className="flex items-center gap-2 border border-black px-5 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <PlusCircle className="h-3.5 w-3.5" /> Create Channel
                    </button>
                </div>
            )}

            {/* Channel list */}
            {channels.length === 0 ? (
                <div className="p-5 text-center">
                    <p className="font-mono text-xs text-neutral-400">No channels yet. Add one to start receiving articles.</p>
                </div>
            ) : (
                <div className="divide-y divide-neutral-100">
                    {channels.map(ch => {
                        const config = ch.config as ChannelConfig;
                        return (
                            <div key={ch.id} className="px-5 py-3 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        {ch.type === "rss" ? <Rss className="h-3 w-3 text-neutral-400" /> : <Search className="h-3 w-3 text-neutral-400" />}
                                        <span className="font-mono text-sm font-medium">{ch.name}</span>
                                        {!ch.enabled && (
                                            <span className="font-mono text-[9px] border border-neutral-200 px-1.5 py-0.5 text-neutral-400">PAUSED</span>
                                        )}
                                    </div>
                                    <p className="font-mono text-[10px] text-neutral-400 mt-0.5 truncate">
                                        {ch.type === "topic"
                                            ? config.keywords?.join(", ")
                                            : config.feedUrl}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleToggle(ch.id, ch.enabled)}
                                        disabled={isPending}
                                        className="border border-neutral-200 p-1.5 hover:border-black text-neutral-400 hover:text-black transition-colors"
                                        title={ch.enabled ? "Pause" : "Enable"}
                                    >
                                        {ch.enabled ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ch.id)}
                                        disabled={isPending}
                                        className="border border-neutral-200 p-1.5 hover:border-black text-neutral-400 hover:text-black transition-colors"
                                        title="Delete channel"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Suggestions Panel ──────────────────────────────────────────────────────

function SuggestionsPanel({ suggestions }: { suggestions: Suggestion[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDismiss = (id: string) => {
        startTransition(async () => {
            await dismissSuggestion(id);
            router.refresh();
            toast.success("Suggestion dismissed");
        });
    };

    return (
        <div className="border border-black bg-white">
            <div className="border-b border-black px-5 py-3 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-mono text-xs uppercase tracking-widest">Suggested Tools</span>
                <span className="font-mono text-[10px] text-neutral-400 ml-1">
                    Discovered from your feed
                </span>
            </div>
            <div className="divide-y divide-neutral-100">
                {suggestions.map(s => {
                    const confidence = parseFloat(s.confidence || "0");
                    const confLabel = confidence >= 0.8 ? "High" : confidence >= 0.6 ? "Med" : "Low";
                    const confColor = confidence >= 0.8
                        ? "border-black text-black"
                        : confidence >= 0.6
                        ? "border-neutral-300 text-neutral-500"
                        : "border-neutral-200 text-neutral-400";

                    return (
                        <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-sm font-medium">{s.toolName}</span>
                                    <span className={`font-mono text-[10px] border px-1.5 py-0.5 ${confColor}`}>
                                        {confLabel} Match
                                    </span>
                                    {s.matchedPainPoint && (
                                        <span className="font-mono text-[10px] border border-neutral-200 px-1.5 py-0.5 text-neutral-400">
                                            Matches: {s.matchedPainPoint.title}
                                        </span>
                                    )}
                                </div>
                                <p className="font-mono text-xs text-neutral-500 mt-0.5 line-clamp-1">
                                    {s.reason}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Link
                                    href={`/submit?url=${encodeURIComponent(s.websiteUrl || "")}&name=${encodeURIComponent(s.toolName)}`}
                                    className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs hover:bg-neutral-100"
                                >
                                    <Search className="h-3 w-3" /> Research
                                </Link>
                                <button
                                    onClick={() => handleDismiss(s.id)}
                                    disabled={isPending}
                                    className="border border-neutral-200 p-1.5 hover:border-black text-neutral-400 hover:text-black transition-colors disabled:opacity-40"
                                    title="Dismiss suggestion"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
