"use client";

import { useState, useTransition } from "react";
import { addNote } from "@/lib/actions/notes";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send } from "lucide-react";

export function NotesSection({ toolId, notes = [] }: { toolId: string, notes?: { id: string; content: string; noteType: string; createdAt: string; userName?: string }[] }) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            try {
                await addNote(toolId, content);
                setContent("");
            } catch {
                // Note addition failed — server action throws user-facing error
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="border border-black">
                <div className="border-b border-black px-4 py-3">
                    <span className="font-mono text-xs uppercase tracking-widest">Team Discussion</span>
                </div>

                {/* Notes list */}
                <div className="divide-y divide-neutral-100 max-h-[400px] overflow-y-auto">
                    {notes.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="font-mono text-xs text-neutral-400">No notes yet.</p>
                            <p className="font-mono text-xs text-neutral-400 mt-1">
                                Share insights, pricing updates, or test results.
                            </p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="p-4 flex gap-3">
                                <div className="w-7 h-7 border border-black bg-black text-white flex items-center justify-center font-mono text-xs shrink-0">
                                    {note.userName?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="font-mono text-xs font-semibold">
                                            {note.userName || "Team Member"}
                                        </span>
                                        <span className="font-mono text-xs text-neutral-400">
                                            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="font-mono text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <div className="border-t border-black">
                    <form onSubmit={handleSubmit} className="flex">
                        <textarea
                            placeholder="Add a note... (Enter to submit, Shift+Enter for new line)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={2}
                            maxLength={10000}
                            className="flex-1 px-4 py-3 font-mono text-xs bg-transparent focus:outline-none resize-none border-0"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isPending || !content.trim()}
                            className="border-l border-black px-4 hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
