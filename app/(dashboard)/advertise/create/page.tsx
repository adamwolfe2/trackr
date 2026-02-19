export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { tools, workspaceMembers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateAdForm } from "@/components/advertise/create-ad-form";

export default async function CreateAdPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!member) return <div>No workspace found</div>;

    const myTools = await db.query.tools.findMany({
        where: eq(tools.workspaceId, member.workspaceId),
        orderBy: [desc(tools.submittedAt)]
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Advertise</p>
                <h1 className="font-serif text-3xl font-normal">New Ad Campaign</h1>
                <p className="font-mono text-sm text-neutral-500 mt-1">Boost your tool&apos;s visibility with a sponsored placement.</p>
            </div>

            <div className="border border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="border-b border-black px-6 py-4">
                    <h2 className="font-mono text-xs uppercase tracking-widest">Campaign Details</h2>
                    <p className="font-mono text-xs text-neutral-500 mt-1">Select a tool and set your budget.</p>
                </div>
                <div className="p-6">
                    <CreateAdForm tools={myTools} workspaceId={member.workspaceId} />
                </div>
            </div>
        </div>
    );
}
