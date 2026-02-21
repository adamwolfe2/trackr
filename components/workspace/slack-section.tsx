"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Check, Loader2, Unplug, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { updateSlackSettings, disconnectSlackWorkspace } from "@/lib/actions/workspace";
import { useSearchParams } from "next/navigation";

interface Channel {
    id: string;
    name: string;
}

export function SlackSection({
    currentChannelId,
    currentEnabled,
    isOwnerOrAdmin,
    slackTeamName,
    isConnected,
}: {
    currentChannelId: string | null;
    currentEnabled: boolean;
    isOwnerOrAdmin: boolean;
    slackTeamName: string | null;
    isConnected: boolean;
}) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [channelId, setChannelId] = useState<string | null>(currentChannelId);
    const [enabled, setEnabled] = useState(currentEnabled);
    const searchParams = useSearchParams();

    // Show toast based on OAuth callback status
    useEffect(() => {
        const slackStatus = searchParams.get("slack");
        if (slackStatus === "connected") {
            toast.success("Slack workspace connected successfully");
        } else if (slackStatus === "denied") {
            toast.error("Slack connection was denied");
        } else if (slackStatus === "error") {
            toast.error("Failed to connect Slack workspace");
        }
    }, [searchParams]);

    const fetchChannels = useCallback(async () => {
        if (!isConnected) return;
        setLoading(true);
        setFetchError(false);
        try {
            const r = await fetch("/api/slack/channels");
            const data = await r.json();
            if (data.error) {
                setFetchError(true);
                toast.error(data.error);
            } else {
                setChannels(data.channels || []);
            }
        } catch {
            setFetchError(true);
            toast.error("Failed to load Slack channels");
        } finally {
            setLoading(false);
        }
    }, [isConnected]);

    // Only fetch channels if connected
    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSlackSettings(channelId, enabled);
            toast.success("Slack settings saved");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async () => {
        const next = !enabled;
        setEnabled(next);
        setSaving(true);
        try {
            await updateSlackSettings(channelId, next);
            toast.success(next ? "Slack notifications enabled" : "Slack notifications disabled");
        } catch (err: unknown) {
            setEnabled(!next);
            const message = err instanceof Error ? err.message : "Failed to update";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Disconnect Slack? This will remove the bot token and stop all notifications.")) return;
        setDisconnecting(true);
        try {
            await disconnectSlackWorkspace();
            toast.success("Slack disconnected");
            // Force reload to reflect new state
            window.location.href = "/workspace";
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to disconnect";
            toast.error(message);
            setDisconnecting(false);
        }
    };

    // Not connected — show "Connect to Slack" button
    if (!isConnected) {
        return (
            <div className="border border-black">
                <div className="border-b border-black px-5 py-3 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <h2 className="font-mono text-xs uppercase tracking-widest">Slack Integration</h2>
                </div>
                <div className="p-5 space-y-4">
                    <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                        Connect your Slack workspace to receive notifications when research completes,
                        tools are added, and renewal alerts are due. Use <code className="text-black">/trackr</code> commands to trigger research directly from Slack.
                    </p>

                    {isOwnerOrAdmin ? (
                        <a
                            href="/api/slack/oauth"
                            className="inline-flex items-center gap-2 border border-black px-5 py-2.5 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Connect to Slack
                        </a>
                    ) : (
                        <div className="border border-neutral-200 px-4 py-3">
                            <p className="font-mono text-xs text-neutral-500">
                                Ask a workspace owner or admin to connect Slack.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Connected — show team name, channel selector, disconnect button
    return (
        <div className="border border-black">
            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <h2 className="font-mono text-xs uppercase tracking-widest">Slack Integration</h2>
                </div>
                <div className="flex items-center gap-3">
                    {channelId && isOwnerOrAdmin && (
                        <button
                            onClick={handleToggle}
                            disabled={saving}
                            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1 border transition-colors ${
                                enabled
                                    ? "border-black bg-black text-white"
                                    : "border-neutral-300 text-neutral-400 hover:border-black hover:text-black"
                            }`}
                        >
                            {enabled ? "Enabled" : "Disabled"}
                        </button>
                    )}
                </div>
            </div>
            <div className="p-5 space-y-4">
                {/* Connected status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-black" />
                        <span className="font-mono text-xs">
                            Connected to <span className="font-bold">{slackTeamName || "Slack workspace"}</span>
                        </span>
                    </div>
                    {isOwnerOrAdmin && (
                        <button
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 disabled:opacity-40"
                        >
                            {disconnecting ? (
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            ) : (
                                <Unplug className="h-2.5 w-2.5" />
                            )}
                            Disconnect
                        </button>
                    )}
                </div>

                <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                    Choose a channel for notifications when research completes,
                    tools are added, and renewal alerts are due. Use <code className="text-black">/trackr</code> commands to trigger research directly from Slack.
                </p>

                {loading ? (
                    <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading channels...
                    </div>
                ) : fetchError ? (
                    <div className="border border-neutral-200 px-4 py-3 flex items-center justify-between gap-4">
                        <p className="font-mono text-xs text-neutral-500">
                            Failed to load channels. Check your connection and try again.
                        </p>
                        <button
                            onClick={fetchChannels}
                            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-neutral-100 shrink-0"
                        >
                            <RefreshCw className="h-2.5 w-2.5" />
                            Retry
                        </button>
                    </div>
                ) : channels.length === 0 ? (
                    <div className="border border-neutral-200 px-4 py-3">
                        <p className="font-mono text-xs text-neutral-500">
                            No channels found. Make sure the Trackr bot has been invited to at least one channel
                            in your Slack workspace.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <label className="font-mono text-xs uppercase tracking-widest block">
                            Notification Channel
                        </label>
                        <div className="flex gap-0">
                            <select
                                value={channelId || ""}
                                onChange={(e) => setChannelId(e.target.value || null)}
                                disabled={!isOwnerOrAdmin}
                                className="flex-1 border border-black px-4 py-2.5 font-mono text-sm bg-white focus:outline-none disabled:opacity-40 appearance-none"
                            >
                                <option value="">Select a channel...</option>
                                {channels.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        #{c.name}
                                    </option>
                                ))}
                            </select>
                            {isOwnerOrAdmin && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !channelId}
                                    className="border border-l-0 border-black px-5 py-2.5 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Check className="h-3 w-3" />
                                    )}
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="border border-neutral-200 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                        Slash Commands
                    </p>
                    <div className="font-mono text-xs text-neutral-600 space-y-1.5 leading-relaxed">
                        <p><code className="text-black">/trackr research &lt;url&gt;</code> — Research a tool from Slack</p>
                        <p><code className="text-black">/trackr status</code> — View workspace stats</p>
                        <p><code className="text-black">/trackr help</code> — Show available commands</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
