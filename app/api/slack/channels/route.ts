import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { listChannels } from "@/lib/services/slack";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const channels = await listChannels();
        return NextResponse.json({ channels });
    } catch (error) {
        console.error("Failed to list Slack channels:", error);
        return NextResponse.json({ channels: [], error: "Failed to connect to Slack" });
    }
}
