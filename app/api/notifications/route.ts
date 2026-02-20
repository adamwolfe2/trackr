import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getNotifications } from "@/lib/actions/notifications";

export async function GET() {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await getNotifications();
    return NextResponse.json({ notifications });
}
