"use server";

import { stripe } from "@/lib/services/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaceMembers, ads, tools } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getWorkspaceId } from "@/lib/db/queries";

export async function createAdCampaign(_workspaceId: string, toolId: string, budget: number) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Budget validation
    if (typeof budget !== "number" || isNaN(budget) || budget < 5 || budget > 100000) {
        throw new Error("Budget must be between $5 and $100,000");
    }

    // Derive workspace from authenticated user instead of trusting client parameter
    const workspaceId = await getWorkspaceId(user.id);
    if (!workspaceId) throw new Error("No workspace found");

    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, user.id),
            eq(workspaceMembers.workspaceId, workspaceId)
        )
    });

    if (!member) throw new Error("Unauthorized");

    // Verify tool belongs to workspace
    const tool = await db.query.tools.findFirst({
        where: and(
            eq(tools.id, toolId),
            eq(tools.workspaceId, workspaceId)
        )
    });

    if (!tool) throw new Error("Tool not found in workspace");

    // Create Draft Ad
    const [newAd] = await db.insert(ads).values({
        workspaceId,
        toolId,
        budget: budget * 100, // Convert to cents
        status: 'draft',
        spent: 0,
        cpc: 50, // Fixed CPC for now
        impressions: 0,
        clicks: 0,
    }).returning();

    // Create Stripe Session — if this fails, roll back the orphaned draft ad
    let session;
    try {
        session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Ad Campaign for ${tool.name}`,
                            description: `Budget: $${budget}`,
                        },
                        unit_amount: budget * 100,
                    },
                    quantity: 1,
                },
            ],
            customer_email: user.emailAddresses[0].emailAddress,
            metadata: {
                adId: newAd.id,
                workspaceId: workspaceId,
                type: 'ad_campaign'
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/advertise?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/advertise/create?canceled=true`,
        });
    } catch (err) {
        // Clean up orphaned draft ad to prevent accumulation of dangling records
        await db.delete(ads).where(eq(ads.id, newAd.id)).catch(() => {});
        throw err;
    }

    if (!session.url) {
        await db.delete(ads).where(eq(ads.id, newAd.id)).catch(() => {});
        throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
}
