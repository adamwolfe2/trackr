"use client";

import { useState, useTransition } from "react";
import { addNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";

type Note = {
    id: string;
    content: string;
    createdAt: Date;
    workspaceMember?: {
        userId: string;
    } | null;
    // We will join user data in the parent component or fetch it
    userName?: string;
    userAvatar?: string;
};

export function NotesSection({ toolId, notes = [] }: { toolId: string, notes?: any[] }) {
    const { user } = useUser();
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            try {
                await addNote(toolId, content);
                setContent("");
            } catch (error) {
                console.error("Failed to add note:", error);
            }
        });
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Team Discussion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {notes.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                <p>No notes yet.</p>
                                <p className="text-xs mt-1">Share insights, pricing updates, or test results.</p>
                            </div>
                        ) : (
                            notes.map((note) => (
                                <div key={note.id} className="flex gap-3 group">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarImage src={note.userAvatar} />
                                        <AvatarFallback>{note.userName?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">{note.userName || "Team Member"}</span>
                                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                                        </div>
                                        <div className="text-sm bg-muted/50 p-3 rounded-lg rounded-tl-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                            {note.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="relative">
                        <Textarea
                            placeholder="Add a note..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[80px] pr-12 resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isPending || !content.trim()}
                            className="absolute bottom-2 right-2 h-8 w-8"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
