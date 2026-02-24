import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getNotifications, markNotificationsRead } from "@/lib/actions/notifications";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";

export async function POST() {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit(`notifications-mark-all:${user.id}`, { limit: 10, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }

    const notifications = await getNotifications();
    const ids = notifications.map(n => n.id);

    if (ids.length > 0) {
        await markNotificationsRead(ids);
    }

    return NextResponse.json({ success: true, marked: ids.length });
}
