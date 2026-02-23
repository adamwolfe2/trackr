import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function main() {
    // All workspaces created recently
    const workspaces = await sql`
        SELECT id, name, slug, created_at FROM workspaces
        ORDER BY created_at DESC LIMIT 10
    `;
    console.log("Recent workspaces:\n", JSON.stringify(workspaces, null, 2));

    // All workspace_members created recently
    const members = await sql`
        SELECT wm.*, w.name, w.slug
        FROM workspace_members wm
        JOIN workspaces w ON w.id = wm.workspace_id
        ORDER BY wm.joined_at DESC LIMIT 10
    `;
    console.log("\nRecent members:\n", JSON.stringify(members, null, 2));
}
main().catch(console.error);
