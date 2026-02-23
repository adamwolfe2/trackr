"use client";

import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface VoteButtonsProps {
    slug: string;
    initialUp?: number;
    initialDown?: number;
}

type VoteType = "up" | "down" | null;

const STORAGE_KEY = (slug: string) => `trackr_vote_${slug}`;

export function VoteButtons({ slug, initialUp = 0, initialDown = 0 }: VoteButtonsProps) {
    const [up, setUp] = useState(initialUp);
    const [down, setDown] = useState(initialDown);
    const [userVote, setUserVote] = useState<VoteType>(null);
    const [pending, setPending] = useState(false);

    // Restore vote from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY(slug));
            if (stored) {
                const parsed = JSON.parse(stored) as { type: VoteType };
                setUserVote(parsed.type);
            }
        } catch {
            // ignore
        }
    }, [slug]);

    const handleVote = useCallback(
        async (type: "up" | "down") => {
            if (pending) return;

            const prevVote = userVote;

            // Clicking the same vote type cancels (remove vote)
            if (prevVote === type) {
                // Optimistic update
                if (type === "up") setUp((v) => Math.max(0, v - 1));
                else setDown((v) => Math.max(0, v - 1));
                setUserVote(null);
                localStorage.removeItem(STORAGE_KEY(slug));

                setPending(true);
                try {
                    // Send as opposite undo: prevType = type, no new type
                    await fetch("/api/votes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ slug, type: type === "up" ? "down" : "up", prevType: type }),
                    });
                    // re-fetch to sync
                    const r = await fetch(`/api/votes?slug=${encodeURIComponent(slug)}`);
                    const d = await r.json();
                    setUp(d.up);
                    setDown(d.down);
                } catch { /* keep optimistic state */ } finally {
                    setPending(false);
                }
                return;
            }

            // New vote or changing vote
            const newUp = type === "up"
                ? up + 1
                : (prevVote === "up" ? Math.max(0, up - 1) : up);
            const newDown = type === "down"
                ? down + 1
                : (prevVote === "down" ? Math.max(0, down - 1) : down);

            // Optimistic update
            setUp(newUp);
            setDown(newDown);
            setUserVote(type);
            try {
                localStorage.setItem(STORAGE_KEY(slug), JSON.stringify({ type }));
            } catch { /* storage full */ }

            setPending(true);
            try {
                const r = await fetch("/api/votes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slug, type, prevType: prevVote ?? undefined }),
                });
                const d = await r.json();
                setUp(d.up);
                setDown(d.down);
            } catch { /* keep optimistic state */ } finally {
                setPending(false);
            }
        },
        [slug, up, down, userVote, pending]
    );

    const total = up + down;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleVote("up")}
                disabled={pending}
                className={`flex items-center gap-1 px-2 py-1 font-mono text-[10px] border transition-all disabled:opacity-50 ${
                    userVote === "up"
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                }`}
                title="Helpful"
            >
                <ThumbsUp className="w-3 h-3" />
                <span>{up}</span>
            </button>

            <button
                onClick={() => handleVote("down")}
                disabled={pending}
                className={`flex items-center gap-1 px-2 py-1 font-mono text-[10px] border transition-all disabled:opacity-50 ${
                    userVote === "down"
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
                }`}
                title="Not helpful"
            >
                <ThumbsDown className="w-3 h-3" />
                <span>{down}</span>
            </button>

            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">
                {total >= 1000
                    ? `${(total / 1000).toFixed(1)}k votes`
                    : `${total} votes`}
            </span>
        </div>
    );
}
