import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { referrals, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { createReferralCode } from "@/lib/actions/referrals";
import { CopyLinkButton } from "@/components/referrals/copy-link-button";

export default async function ReferralsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) return <div>No workspace found</div>;

    const myReferral = await db.query.referrals.findFirst({
        where: eq(referrals.referrerWorkspaceId, member.workspaceId)
    });

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Refer a Friend</h1>
                <p className="text-muted-foreground">Invite others to Trackr and earn credits.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Referral Link</CardTitle>
                        <CardDescription>Share this link to track signups.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {myReferral ? (
                            <CopyLinkButton referralUrl={`${process.env.NEXT_PUBLIC_APP_URL}/sign-up?ref=${myReferral.code}`} />
                        ) : (
                            <form action={async () => {
                                "use server";
                                await createReferralCode(member.workspaceId);
                            }}>
                                <Button type="submit" className="w-full">Generate Referral Link</Button>
                            </form>
                        )}
                        <p className="text-xs text-muted-foreground">
                            You get $10 in ad credits for every workspace that upgrades to Pro.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Stats</CardTitle>
                        <CardDescription>Track your impact.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <div className="text-2xl font-bold">{myReferral?.clicks || 0}</div>
                                <div className="text-xs text-muted-foreground uppercase font-bold mt-1">Clicks</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <div className="text-2xl font-bold">{myReferral?.signups || 0}</div>
                                <div className="text-xs text-muted-foreground uppercase font-bold mt-1">Signups</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
