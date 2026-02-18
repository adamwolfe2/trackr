import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { workspaces, workspaceMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
            status: 400
        })
    }

    // Handle the event
    const eventType = evt.type

    if (eventType === 'user.created') {
        const { id, email_addresses, username } = evt.data;

        const primaryEmail = email_addresses[0]?.email_address;
        const displayName = username || primaryEmail?.split('@')[0] || "User";

        // Check if user already has a workspace (idempotency)
        const existingMember = await db.query.workspaceMembers.findFirst({
            where: eq(workspaceMembers.userId, id)
        });

        if (!existingMember) {
            // Create Personal Workspace
            const [newWorkspace] = await db.insert(workspaces).values({
                name: `${displayName}'s Workspace`,
                slug: `ws-${id.slice(0, 8).toLowerCase()}`,
                companyContext: `Personal workspace for ${primaryEmail}`
            }).returning();

            // Add user as admin
            await db.insert(workspaceMembers).values({
                userId: id,
                workspaceId: newWorkspace.id,
                role: 'owner'
            });

            console.log(`Created workspace for user ${id}`);
        }
    }

    return new Response('', { status: 200 })
}
