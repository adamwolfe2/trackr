export const dynamic = "force-dynamic";

import { UpgradeButton } from "@/components/billing/upgrade-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { subscriptions, workspaceMembers } from "@/lib/db/schema";
import { getWorkspaceId } from "@/lib/actions/tools";
import { currentUser } from "@clerk/nextjs/server";
import { Check } from "lucide-react";
import { eq } from "drizzle-orm";

export default async function BillingPage() {
    const user = await currentUser();
    if (!user) return null;

    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) return <div>No workspace found</div>;

    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.workspaceId, workspaceId),
    });

    const isPro = subscription?.status === 'active';

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-muted-foreground">Manage your workspace subscription and payment methods.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <Card className={`relative ${!isPro ? 'border-primary shadow-md' : 'opacity-80'}`}>
                    {!isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Current Plan</div>}
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>Perfect for exploring and creating small stacks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex gap-2"><Check className="h-4 w-4" /> 5 Tools Limit</li>
                            <li className="flex gap-2"><Check className="h-4 w-4" /> Basic Research (No Deep Dives)</li>
                            <li className="flex gap-2"><Check className="h-4 w-4" /> Community Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Badge variant="outline" className="w-full justify-center py-1.5 cursor-not-allowed">Included</Badge>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className={`relative ${isPro ? 'border-primary shadow-md' : ''}`}>
                    {isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Current Plan</div>}
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Pro Workspace
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Recommended</Badge>
                        </CardTitle>
                        <CardDescription>For teams that need serious procurement power.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited Tools</li>
                            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Deep Research (Firecrawl + Perplexity)</li>
                            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> "Ask Trackr" AI Assistant</li>
                            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> CSV Exports & API Access</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {isPro ? (
                            <form action={async () => {
                                "use server";
                                const { createCustomerPortalSession } = await import("@/lib/actions/stripe");
                                const { url } = await createCustomerPortalSession(workspaceId);
                                if (url) {
                                    const { redirect } = await import("next/navigation");
                                    redirect(url);
                                }
                            }}>
                                <Button variant="outline" className="w-full">Manage Subscription</Button>
                            </form>
                        ) : (
                            <UpgradeButton workspaceId={workspaceId} />
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
