export async function triggerResearchAgent(toolId: string, url: string) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn("N8N_WEBHOOK_URL not set. Skipping agent trigger.");
        return false;
    }

    try {
        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tool_id: toolId,
                url: url,
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n`
            }),
        });

        if (!res.ok) {
            throw new Error(`n8n webhook failed: ${res.statusText}`);
        }
        return true;
    } catch (error) {
        console.error("Failed to trigger research agent:", error);
        return false;
    }
}
