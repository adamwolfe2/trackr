import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function main() {
    const workspaceId = "5ab9d73d-69d3-4def-b550-083a33fef4c2"; // adam@modern-amenities.com

    // Check if subscription exists
    const existing = await sql`SELECT * FROM subscriptions WHERE workspace_id = ${workspaceId}`;
    console.log("Existing subscriptions:", JSON.stringify(existing, null, 2));

    if (existing.length === 0) {
        // Insert new enterprise subscription
        const inserted = await sql`
            INSERT INTO subscriptions (workspace_id, plan_id, status, current_period_end, credit_balance)
            VALUES (${workspaceId}, 'enterprise', 'active', '2035-01-01', 999)
            RETURNING *
        `;
        console.log("✅ Inserted enterprise subscription:", JSON.stringify(inserted, null, 2));
    } else {
        // Update existing
        const updated = await sql`
            UPDATE subscriptions
            SET plan_id = 'enterprise', status = 'active', current_period_end = '2035-01-01', credit_balance = 999
            WHERE workspace_id = ${workspaceId}
            RETURNING *
        `;
        console.log("✅ Updated to enterprise:", JSON.stringify(updated, null, 2));
    }
}
main().catch(console.error);
