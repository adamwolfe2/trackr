import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { ensureWorkspace } from '@/lib/db/ensure-workspace'
import { sendWelcomeEmail, scheduleDripSequence } from '@/lib/email/resend'
import { db } from '@/lib/db'
import { pendingInvitations, workspaceMembers, workspaces, subscriptions, webhookEvents } from '@/lib/db/schema'
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
        return new Response('Error occurred -- invalid signature', { status: 400 })
    }

    const eventType = evt.type;
    const eventId = svix_id;

    // Idempotency: atomically claim the event — only one concurrent request can succeed
    const claimed = await db.insert(webhookEvents)
        .values({ source: 'clerk', eventId, eventType, error: null })
        .onConflictDoNothing()
        .returning({ id: webhookEvents.id });

    if (claimed.length === 0) {
        // Another request already claimed this event — skip silently
        return new Response('', { status: 200 });
    }

    try {
        if (eventType === 'user.created') {
            await handleUserCreated(evt);
        } else if (eventType === 'user.updated') {
            await handleUserUpdated(evt);
        } else if (eventType === 'user.deleted') {
            await handleUserDeleted(evt);
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Update the already-inserted record with the error
        await db.update(webhookEvents)
            .set({ error: message })
            .where(and(eq(webhookEvents.source, 'clerk'), eq(webhookEvents.eventId, eventId)));
        console.error(`Clerk webhook error [${eventType}]:`, message);
        return new Response('Webhook handler error', { status: 500 });
    }

    return new Response('', { status: 200 })
}

async function handleUserCreated(evt: WebhookEvent) {
    if (evt.type !== 'user.created') return;
    const { id, email_addresses, username, first_name } = evt.data;

    const primaryEmail = email_addresses[0]?.email_address;
    const displayName = username || primaryEmail?.split('@')[0] || "User";
    const firstName = first_name || displayName;

    // Check for a pending workspace invitation for this email.
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
            await db
                .insert(workspaceMembers)
                .values({
                    userId: id,
                    workspaceId: pendingInvite.workspaceId,
                    role: 'member',
                })
                .onConflictDoNothing();

            await db
                .delete(pendingInvitations)
                .where(eq(pendingInvitations.id, pendingInvite.id));

            if (process.env.RESEND_API_KEY) {
                sendWelcomeEmail(primaryEmail, firstName).catch(() => {});
            }
            return;
        }
    }

    // No pending invitation — create a fresh workspace
    const { created } = await ensureWorkspace(id, { displayName, email: primaryEmail });

    if (created && primaryEmail) {
        sendWelcomeEmail(primaryEmail, firstName).catch(() => {});
        scheduleDripSequence(primaryEmail, firstName).catch(() => {});
    }
}

async function handleUserUpdated(evt: WebhookEvent) {
    if (evt.type !== 'user.updated') return;
    // We don't store user profile data locally (it lives in Clerk).
    // Ensure workspace exists in case it was somehow missed.
    const { id, email_addresses, username, first_name } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;
    const displayName = username || primaryEmail?.split('@')[0] || "User";
    await ensureWorkspace(id, { displayName, email: primaryEmail });
}

async function handleUserDeleted(evt: WebhookEvent) {
    if (evt.type !== 'user.deleted') return;
    const { id } = evt.data;
    if (!id) return;

    // Find all workspace memberships for this user
    const memberships = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.userId, id),
    });

    for (const membership of memberships) {
        if (membership.role === 'owner') {
            // Cancel any active Stripe subscription for this workspace
            const sub = await db.query.subscriptions.findFirst({
                where: eq(subscriptions.workspaceId, membership.workspaceId),
            });

            if (sub?.stripeSubscriptionId && sub.status !== 'canceled') {
                try {
                    const { stripe } = await import('@/lib/services/stripe');
                    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
                } catch {
                    // Non-critical — Stripe cancel failure shouldn't block cleanup
                }
                await db.update(subscriptions)
                    .set({ status: 'canceled', updatedAt: new Date() })
                    .where(eq(subscriptions.workspaceId, membership.workspaceId));
            }
        }
    }

    // Remove user from all workspaces
    await db.delete(workspaceMembers).where(eq(workspaceMembers.userId, id));
}
