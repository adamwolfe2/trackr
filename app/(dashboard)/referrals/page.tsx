export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { referrals, workspaceMembers } from "@/lib/db/schema";

export const metadata: Metadata = {
    title: "Referrals — Trackr",
    description: "Invite others to Trackr and earn rewards.",
};
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createReferralCode } from "@/lib/actions/referrals";
import { CopyLinkButton } from "@/components/referrals/copy-link-button";

export default async function ReferralsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) redirect("/onboarding");

    const myReferral = await db.query.referrals.findFirst({
        where: eq(referrals.referrerWorkspaceId, member.workspaceId),
        orderBy: [desc(referrals.createdAt)],
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-3xl font-normal">Refer a Friend</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">Invite others to Trackr and earn 5 research credits per signup.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                {/* Referral Link */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Your Referral Link</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {myReferral ? (
                            <CopyLinkButton referralUrl={`${process.env.NEXT_PUBLIC_APP_URL || "https://trytrackr.com"}/sign-up?ref=${myReferral.code}`} />
                        ) : (
                            <form action={async () => {
                                "use server";
                                await createReferralCode();
                            }}>
                                <button type="submit" className="w-full border border-black px-5 py-3 font-mono text-xs uppercase tracking-widest bg-black text-white hover:bg-neutral-800">
                                    Generate Referral Link
                                </button>
                            </form>
                        )}
                        <p className="font-mono text-[10px] text-neutral-400 leading-relaxed">
                            You earn 5 research credits for every new workspace that signs up using your link. Credits are added to your account automatically.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <h2 className="font-mono text-xs uppercase tracking-widest">Your Stats</h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-black p-4 text-center">
                                <div className="font-mono text-3xl font-bold">{myReferral?.clicks || 0}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Clicks</div>
                            </div>
                            <div className="border border-black p-4 text-center">
                                <div className="font-mono text-3xl font-bold">{myReferral?.signups || 0}</div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Signups</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
