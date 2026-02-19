import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { workspaceMembers, subscriptions, workspaces } from "@/lib/db/schema";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
    const allWorkspaces = await db.select().from(workspaces);
    console.log("Workspaces:", allWorkspaces.map(w => `${w.id} — ${w.name}`));

    const target = allWorkspaces.find(w => w.name === "Modern Amenities");
    if (!target) { console.log("Not found"); return; }

    const workspaceId = target.id;
    const existing = await db.query.subscriptions.findFirst({ where: eq(subscriptions.workspaceId, workspaceId) });

    if (existing) {
        await db.update(subscriptions).set({ planId: "enterprise", status: "active" }).where(eq(subscriptions.workspaceId, workspaceId));
        console.log("✓ Updated to Agency:", workspaceId);
    } else {
        await db.insert(subscriptions).values({ workspaceId, planId: "enterprise", status: "active" });
        console.log("✓ Inserted Agency:", workspaceId);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
