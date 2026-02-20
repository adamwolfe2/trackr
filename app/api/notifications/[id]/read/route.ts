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

    const rl = rateLimit(`notifications-read:${user.id}`, { limit: 30, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: getRateLimitHeaders(rl) }
        );
    }

    const { id } = await params;
    if (!id || typeof id !== "string" || id.length > 200) {
        return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    await markNotificationsRead([id]);
    return NextResponse.json({ success: true });
}
