"use client";

import { useState, useEffect } from "react";
import { Users, X } from "lucide-react";
import Link from "next/link";

const DISMISSED_KEY = "invite-nudge-dismissed";

export function InviteTeamNudge({ role }: { role: string }) {
    const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

    useEffect(() => {
        setDismissed(localStorage.getItem(DISMISSED_KEY) === "true"); // eslint-disable-line react-hooks/set-state-in-effect -- hydration-safe localStorage read
    }, []);

    if (role !== "owner" || dismissed) return null;

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, "true");
        setDismissed(true);
    };

    return (
        <div className="border border-black bg-[#F3F3EF] p-4 flex items-center gap-4">
            <Users className="h-5 w-5 shrink-0 text-neutral-500" />
            <div className="flex-1 min-w-0">
                <span className="font-mono text-sm font-semibold">Better with your team</span>
                <p className="font-mono text-xs text-neutral-500 mt-0.5">
                    Invite teammates to share research, compare tools, and track your stack together.
                </p>
            </div>
            <Link
                href="/workspace"
                className="font-mono text-xs border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
                Invite Teammates →
            </Link>
            <button
                onClick={handleDismiss}
                className="shrink-0 p-1 hover:bg-neutral-200 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-3.5 w-3.5 text-neutral-400" />
            </button>
        </div>
    );
}
