"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createAdCampaign } from "@/lib/actions/ads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateAdFormProps {
    tools: any[];
    workspaceId: string;
}

export function CreateAdForm({ tools, workspaceId }: CreateAdFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string>("");
    const [budget, setBudget] = useState<number>(50); // Default $50
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTool) return toast.error("Please select a tool");
        if (budget < 10) return toast.error("Minimum budget is $10");

        setIsLoading(true);
        try {
            const { url } = await createAdCampaign(workspaceId, selectedTool, budget);
            if (url) {
                window.location.href = url;
            } else {
                toast.error("Failed to create checkout session");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="tool">Select Tool</Label>
                <Select value={selectedTool} onValueChange={setSelectedTool}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a tool to promote..." />
                    </SelectTrigger>
                    <SelectContent>
                        {tools.map((tool) => (
                            <SelectItem key={tool.id} value={tool.id}>
                                {tool.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="budget">Campaign Budget ($)</Label>
                <Input
                    id="budget"
                    type="number"
                    min="10"
                    step="5"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                    Estimated {(budget / 0.5).toFixed(0)} clicks at $0.50 CPC.
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Checkout with Stripe
            </Button>
        </form>
    );
}
