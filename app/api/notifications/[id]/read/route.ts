import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { markNotificationsRead } from "@/lib/actions/notifications";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";

export async function PATCH(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit(`notifications-read:${user.id}`, { limit: 30, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }

    const { id } = await params;
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== "string" || !UUID_RE.test(id)) {
        return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    try {
        await markNotificationsRead([id]);
        return NextResponse.json({ success: true }, { headers: getRateLimitHeaders(rl) });
    } catch {
        return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
    }
}
