"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateArchitectCalendarUrl } from "@/lib/actions/architects";

export function CalendarUrlForm({
    architectId,
    initialUrl,
}: {
    architectId: string;
    initialUrl: string | null;
}) {
    const [url, setUrl] = useState(initialUrl ?? "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        try {
            await updateArchitectCalendarUrl(architectId, url);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block font-mono text-[10px] text-neutral-400 uppercase mb-1">
                    Calendar Link
                </label>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://cal.com/your-handle"
                    className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
                <p className="font-mono text-[10px] text-neutral-400 mt-1">
                    Clients will see this link to book directly with you.
                </p>
            </div>
            <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {saved ? "Saved" : saving ? "Saving..." : "Save Calendar Link"}
            </button>
        </div>
    );
}
