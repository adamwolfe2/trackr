/**
 * Server-side PostHog client for capturing events from server actions,
 * API routes, and webhooks. Uses posthog-node with immediate flush
 * so events don't get dropped in serverless environments.
 */

import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return null;
    if (!_client) {
        _client = new PostHog(key, {
            host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
            flushAt: 1,       // flush after every event
            flushInterval: 0, // no timer batching in serverless
        });
    }
    return _client;
}

/**
 * Capture a server-side event in PostHog and flush immediately.
 * Never throws — analytics must never break product functionality.
 *
 * @param distinctId - Clerk user ID or workspace ID
 * @param event - Event name (e.g. "tool_submitted")
 * @param properties - Additional properties to attach
 */
export async function captureEvent(
    distinctId: string,
    event: string,
    properties?: Record<string, unknown>
): Promise<void> {
    try {
        const client = getClient();
        if (!client || !distinctId) return;
        client.capture({ distinctId, event, properties });
        await client.flush();
    } catch {
        // Non-critical — never throw from analytics
    }
}
