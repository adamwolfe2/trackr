import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getNotifications } from "@/lib/actions/notifications";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";

export async function GET() {
    let user;
    try {
        user = await currentUser();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit(`notifications-get:${user.id}`, { limit: 60, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }

    try {
        const notifications = await getNotifications();
        return NextResponse.json({ notifications }, { headers: getRateLimitHeaders(rl) });
    } catch (err) {
        console.error("[api/notifications] Failed to fetch notifications:", err);
        return NextResponse.json({ notifications: [] }, { status: 200, headers: getRateLimitHeaders(rl) });
    }
}
