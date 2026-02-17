"use client";

import { useState } from "react";
import { addNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

type Note = {
    id: string;
    content: string;
    createdAt: Date;
    // user props joined
    user?: {
        name?: string | null;
        avatarUrl?: string | null;
    }
};

export function NotesSection({ toolId, notes = [] }: { toolId: string, notes?: Note[] }) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await addNote(toolId, content);
            setContent("");
        } catch (error) {
            console.error("Failed to add note:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader><CardTitle>Discussion & Notes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {notes.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                                No notes yet. Be the first to share your thoughts!
                            </div>
                        ) : (
                            notes.map((note) => (
                                <div key={note.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={note.user?.avatarUrl || ""} />
                                        <AvatarFallback>{note.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{note.user?.name || "Team Member"}</span>
                                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                                        </div>
                                        <div className="text-sm bg-muted/50 p-3 rounded-lg rounded-tl-none">
                                            {note.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-2 pt-4 border-t">
                        <Textarea
                            placeholder="Add a note, observation, or test result..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[80px]"
                        />
                        <div className="flex justify-end">
                            <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                Post Note
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
