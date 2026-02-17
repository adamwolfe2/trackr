

export const dynamic = "force-dynamic";

import { submitTool } from "@/lib/actions/tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SubmitPage() {
    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <Card>
                <CardHeader>
                    <CardTitle>Submit New Tool</CardTitle>
                    <CardDescription>
                        Add a tool to the database for AI research and scoring.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={submitTool} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tool Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Linear" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website_url">Website URL</Label>
                            <Input id="website_url" name="website_url" type="url" placeholder="https://linear.app" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description or Notes (Optional)</Label>
                            <Textarea id="description" name="description" placeholder="Why are we tracking this? Any specific pain points?" />
                        </div>

                        <div className="pt-2">
                            <Button type="submit" className="w-full">Submit for Research</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
