"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSlackSettings } from "@/lib/actions/workspace";

interface Channel {
    id: string;
    name: string;
}

export function SlackSection({
    currentChannelId,
    currentEnabled,
    isOwnerOrAdmin,
}: {
    currentChannelId: string | null;
    currentEnabled: boolean;
    isOwnerOrAdmin: boolean;
}) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [channelId, setChannelId] = useState<string | null>(currentChannelId);
    const [enabled, setEnabled] = useState(currentEnabled);

    useEffect(() => {
        fetch("/api/slack/channels")
            .then((r) => r.json())
            .then((data) => {
                setChannels(data.channels || []);
                if (data.error) toast.error(data.error);
            })
            .catch(() => toast.error("Failed to load Slack channels"))
            .finally(() => setLoading(false));
    }, []);

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

    return (
        <div className="border border-black">
            <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <h2 className="font-mono text-xs uppercase tracking-widest">Slack Integration</h2>
                </div>
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
            <div className="p-5 space-y-4">
                <p className="font-mono text-xs text-neutral-500 leading-relaxed">
                    Connect a Slack channel to receive notifications when research completes,
                    tools are added, and renewal alerts are due. Use <code className="text-black">/trackr</code> commands to trigger research directly from Slack.
                </p>

                {loading ? (
                    <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading channels...
                    </div>
                ) : channels.length === 0 ? (
                    <div className="border border-neutral-200 px-4 py-3">
                        <p className="font-mono text-xs text-neutral-500">
                            No channels found. Make sure the Trackr bot is installed in your Slack workspace
                            and has been invited to at least one channel.
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
