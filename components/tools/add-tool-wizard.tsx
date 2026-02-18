"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight, CheckCircle2, Globe, Sparkles } from "lucide-react";
import { previewTool } from "@/lib/actions/preview";
import { submitTool } from "@/lib/actions/tools";
import { toast } from "sonner";
import Image from "next/image";

export function AddToolWizard() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [url, setUrl] = useState("");
    const [isPreviewing, startPreview] = useTransition();
    const [metadata, setMetadata] = useState<{ title: string; description: string; image: string } | null>(null);

    const handlePreview = () => {
        if (!url) return;
        startPreview(async () => {
            const data = await previewTool(url);
            if (data.error) {
                toast.error(data.error);
            } else {
                setMetadata({
                    title: data.title || "",
                    description: data.description || "",
                    image: data.image || ""
                });
                setStep(2);
            }
        });
    };

    return (
        <Card className="max-w-2xl mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
                <CardTitle className="text-2xl">
                    {step === 1 && "Add a New Tool"}
                    {step === 2 && "Review Details"}
                    {step === 3 && "Submission Complete"}
                </CardTitle>
                <CardDescription>
                    {step === 1 && "Enter the URL of the AI tool you want to track."}
                    {step === 2 && "We found some information. Please verify before adding."}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">Website URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="url"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handlePreview()}
                                    autoFocus
                                />
                                <Button onClick={handlePreview} disabled={isPreviewing || !url}>
                                    {isPreviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                We'll automatically fetch the tool's name and description.
                            </p>
                        </div>
                    </div>
                )}

                {step === 2 && metadata && (
                    <form action={submitTool} className="space-y-6 animate-fade-in">
                        <input type="hidden" name="website_url" value={url} />

                        <div className="grid gap-6 md:grid-cols-[1fr_200px]">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tool Name</Label>
                                    <Input id="name" name="name" defaultValue={metadata.title} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        defaultValue={metadata.description}
                                        className="h-32"
                                    />
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="hidden md:block space-y-2">
                                <Label>Preview</Label>
                                <div className="border rounded-lg overflow-hidden bg-background shadow-sm">
                                    <div className="aspect-video bg-muted relative flex items-center justify-center">
                                        {metadata.image ? (
                                            <img
                                                src={metadata.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Globe className="w-8 h-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <div className="text-xs font-semibold truncate">{metadata.title || "No Title"}</div>
                                        <div className="text-[10px] text-muted-foreground truncate mt-1">
                                            {url.replace(/^https?:\/\//, '')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button type="submit" className="gap-2 w-full md:w-auto">
                                <Sparkles className="w-4 h-4" />
                                Confirm & Start Research
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
