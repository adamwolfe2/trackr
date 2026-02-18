"use client";

import { useState, useTransition } from "react";
import { addPainPoint, deletePainPoint, togglePainPointActive } from "@/lib/actions/pain-points";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

type PainPoint = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    active: boolean;
    createdAt: Date;
};

export function PainPointsClient({ initialData = [] }: { initialData?: PainPoint[] }) {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [pointToDelete, setPointToDelete] = useState<string | null>(null);
    const router = useRouter();

    // We rely on server revalidation to update the list, but we can optimistically update
    // For now, let's keep it simple with router.refresh() after action

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Discovery & Pain Points</h1>
                    <p className="text-muted-foreground">
                        Document internal problems to trigger AI tool discovery.
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Add Pain Point
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Pain Point</DialogTitle>
                        </DialogHeader>
                        <form
                            action={async (formData) => {
                                setIsOpen(false);
                                toast.promise(addPainPoint(formData), {
                                    loading: "Adding pain point...",
                                    success: () => {
                                        router.refresh();
                                        return "Pain point added";
                                    },
                                    error: "Failed to add pain point",
                                });
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="title">Problem Statement</Label>
                                <Input id="title" name="title" placeholder="e.g. Video editing takes too long" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" placeholder="e.g. Marketing" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Context (Optional)</Label>
                                <Textarea id="description" name="description" placeholder="Describe the impact..." />
                            </div>
                            <Button type="submit" className="w-full">Save Pain Point</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {initialData.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-black font-mono">
                        No pain points recorded. Add one to guide your AI research.
                    </div>
                ) : (
                    initialData.map((point) => (
                        <Card key={point.id} className={point.active ? "" : "opacity-60 grayscale"}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <Badge variant="outline" className="mb-2">{point.category || "General"}</Badge>
                                    <Switch
                                        checked={point.active}
                                        onCheckedChange={(checked) => {
                                            startTransition(async () => {
                                                await togglePainPointActive(point.id, point.active);
                                                router.refresh();
                                            });
                                        }}
                                    />
                                </div>
                                <CardTitle className="text-lg leading-tight">{point.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                    {point.description || "No specific context provided."}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(point.createdAt), { addSuffix: true })}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setPointToDelete(point.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <AlertDialog open={!!pointToDelete} onOpenChange={(open) => !open && setPointToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Pain Point?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This pain point will be removed and will no longer influence AI tool discovery.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white border-red-600 hover:bg-red-700"
                            onClick={() => {
                                if (!pointToDelete) return;
                                const id = pointToDelete;
                                setPointToDelete(null);
                                startTransition(async () => {
                                    await deletePainPoint(id);
                                    router.refresh();
                                });
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
