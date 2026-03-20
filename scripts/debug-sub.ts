import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    const userId = process.argv[2];
    if (!userId) {
        console.error("Usage: npx tsx scripts/debug-sub.ts <clerk-user-id>");
        process.exit(1);
    }

    const members = await sql`
        SELECT wm.*, w.name, w.slug
        FROM workspace_members wm
        JOIN workspaces w ON w.id = wm.workspace_id
        WHERE wm.user_id = ${userId}
    `;
    console.log("Member rows:", JSON.stringify(members, null, 2));

    for (const m of members as Array<{ workspace_id: string; name: string }>) {
        const subs = await sql`
            SELECT * FROM subscriptions WHERE workspace_id = ${m.workspace_id}
        `;
        console.log(`\nSubscriptions for workspace "${m.name}" (${m.workspace_id}):`, JSON.stringify(subs, null, 2));
    }
}

main().catch(console.error);
