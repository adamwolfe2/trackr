import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getNotifications } from "@/lib/actions/notifications";
import { rateLimit, getRateLimitHeaders } from "@/lib/middleware/rate-limit";

export async function GET() {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit(`notifications-get:${user.id}`, { limit: 60, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }

    const notifications = await getNotifications();
    return NextResponse.json({ notifications }, { headers: getRateLimitHeaders(rl) });
}
