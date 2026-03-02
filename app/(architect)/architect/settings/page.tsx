export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { architects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ExternalLink, Copy } from "lucide-react";
import { ARCHITECT_ROLES } from "@/lib/config/architect-roles";

function getRoleTitle(slug: string): string {
    return ARCHITECT_ROLES.find((r) => r.slug === slug)?.title ?? slug;
}

export default async function ArchitectSettingsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const architect = await db.query.architects.findFirst({
        where: eq(architects.userId, user.id),
    });
    if (!architect) redirect("/apply");

    const referralUrl = `https://trytrackr.com/audit?arc=${architect.arcCode}`;

    return (
        <div className="space-y-8">
            <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Settings</p>
                <h1 className="font-serif text-3xl font-normal">Account Settings</h1>
            </div>

            {/* Profile */}
            <div className="border border-black">
                <div className="border-b border-black p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Profile</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase">Name</p>
                            <p className="font-mono text-sm">{architect.firstName} {architect.lastName}</p>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase">Email</p>
                            <p className="font-mono text-sm">{architect.email}</p>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase">Role</p>
                            <p className="font-mono text-sm">{getRoleTitle(architect.role)}</p>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase">Status</p>
                            <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${
                                architect.status === "active" ? "text-green-700 border-green-200" : "text-neutral-500 border-neutral-200"
                            }`}>
                                {architect.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referral Code */}
            <div className="border border-black p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Referral Code</p>
                <div className="flex items-center gap-3 mb-3">
                    <div className="border border-black bg-black text-white px-4 py-2 font-mono text-lg tracking-widest">
                        {architect.arcCode}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <code className="flex-1 font-mono text-xs bg-[#F3F3EF] border border-neutral-200 px-3 py-2 truncate">
                        {referralUrl}
                    </code>
                    <button
                        className="flex items-center gap-1.5 border border-black px-3 py-2 font-mono text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                        title="Copy link"
                    >
                        <Copy className="w-3 h-3" />
                        Copy
                    </button>
                </div>
            </div>

            {/* Stripe Connect */}
            <div className="border border-black p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">Stripe Connect</p>
                {architect.stripeOnboardingComplete ? (
                    <div>
                        <p className="font-mono text-sm text-green-700 mb-3">Connected and active</p>
                        <Link
                            href="https://connect.stripe.com/express_login"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 border border-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Manage Stripe Account
                        </Link>
                    </div>
                ) : (
                    <div>
                        <p className="font-mono text-sm text-neutral-700 mb-3">
                            Complete Stripe setup to receive commission payouts.
                        </p>
                        <Link
                            href="/api/architect/stripe-connect"
                            className="inline-flex items-center gap-2 border border-black bg-black text-white px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Complete Stripe Setup
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
