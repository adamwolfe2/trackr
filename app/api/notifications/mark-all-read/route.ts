import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getNotifications, markNotificationsRead } from "@/lib/actions/notifications";

export async function POST() {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await getNotifications();
    const ids = notifications.map(n => n.id);

    if (ids.length > 0) {
        await markNotificationsRead(ids);
    }

    return NextResponse.json({ success: true, marked: ids.length });
}
