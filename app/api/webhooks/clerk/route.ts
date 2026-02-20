import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { ensureWorkspace } from '@/lib/db/ensure-workspace'
import { sendWelcomeEmail, scheduleDripSequence } from '@/lib/email/resend'
import { db } from '@/lib/db'
import { pendingInvitations, workspaceMembers, workspaces } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occurred -- no svix headers', { status: 400 })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch {
        return new Response('Error occurred', { status: 400 })
    }

    const eventType = evt.type

    if (eventType === 'user.created') {
        const { id, email_addresses, username, first_name } = evt.data;

        const primaryEmail = email_addresses[0]?.email_address;
        const displayName = username || primaryEmail?.split('@')[0] || "User";
        const firstName = first_name || displayName;

        // Check for a pending workspace invitation for this email.
        // If found, add user to that workspace instead of creating a new one.
        if (primaryEmail) {
            const now = new Date();
            const pendingInvite = await db.query.pendingInvitations.findFirst({
                where: and(
                    eq(pendingInvitations.email, primaryEmail),
                    gt(pendingInvitations.expiresAt, now),
                ),
                with: { workspace: true },
            });

            if (pendingInvite) {
                // Add user to the inviting workspace as a member
                await db
                    .insert(workspaceMembers)
                    .values({
                        userId: id,
                        workspaceId: pendingInvite.workspaceId,
                        role: 'member',
                    })
                    .onConflictDoNothing(); // Safe if somehow already a member

                // Delete the consumed invitation
                await db
                    .delete(pendingInvitations)
                    .where(eq(pendingInvitations.id, pendingInvite.id));

                // Send welcome email mentioning the workspace
                if (process.env.RESEND_API_KEY) {
                    sendWelcomeEmail(primaryEmail, firstName).catch(() => {});
                }

                return new Response('', { status: 200 })
            }
        }

        // No pending invitation — create a fresh workspace for this user
        const { created } = await ensureWorkspace(id, { displayName, email: primaryEmail });

        // Send welcome email + schedule drip sequence only on first workspace creation
        if (created && primaryEmail) {
            sendWelcomeEmail(primaryEmail, firstName).catch(() => {});
            scheduleDripSequence(primaryEmail, firstName).catch(() => {});
        }
    }

    return new Response('', { status: 200 })
}
