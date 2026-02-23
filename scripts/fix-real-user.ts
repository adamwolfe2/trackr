import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    const userId = "user_39rJDGLcZNp5LAy2nJKaGfOnhXD"; // actual adam@modern-amenities.com

    const members = await sql`
        SELECT wm.*, w.name, w.slug
        FROM workspace_members wm
        JOIN workspaces w ON w.id = wm.workspace_id
        WHERE wm.user_id = ${userId}
    `;
    console.log("Workspaces for this user:", JSON.stringify(members, null, 2));

    for (const m of members as Array<{ workspace_id: string; name: string }>) {
        const subs = await sql`SELECT * FROM subscriptions WHERE workspace_id = ${m.workspace_id}`;
        console.log(`\nSubscriptions for "${m.name}":`, JSON.stringify(subs, null, 2));
    }
}
main().catch(console.error);
