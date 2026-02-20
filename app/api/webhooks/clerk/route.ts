import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { ensureWorkspace } from '@/lib/db/ensure-workspace'
import { sendWelcomeEmail } from '@/lib/email/resend'

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

        // Create workspace (idempotent — safe if onboarding already created one)
        const { created } = await ensureWorkspace(id, { displayName, email: primaryEmail });

        // Send welcome email only on first workspace creation
        if (created && primaryEmail) {
            const firstName = evt.data.first_name || displayName;
            sendWelcomeEmail(primaryEmail, firstName).catch(() => {});
        }
    }

    return new Response('', { status: 200 })
}
