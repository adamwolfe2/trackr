/**
 * Mirrors exactly what the billing page does to determine the plan.
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    const userId = "user_39pOxRj82ZZep0dpOUaV1oHJAJe";

    // Step 1: getWorkspaceId
    const [member] = await sql`
        SELECT workspace_id FROM workspace_members WHERE user_id = ${userId} LIMIT 1
    `;
    console.log("workspaceId:", member?.workspace_id);

    if (!member) { console.log("NO WORKSPACE FOUND"); return; }

    // Step 2: findFirst subscription
    const [sub] = await sql`
        SELECT id, plan_id, status, current_period_end, credit_balance
        FROM subscriptions WHERE workspace_id = ${member.workspace_id}
    `;
    console.log("Subscription row:", sub);

    if (!sub) { console.log("NO SUBSCRIPTION → Free plan"); return; }

    // Step 3: getPlanLimits logic
    const isActive = sub.status === "active" || sub.status === "trialing";
    console.log("isActive:", isActive);

    if (!isActive) { console.log("Status not active → Free"); return; }

    const expired = sub.current_period_end && new Date(sub.current_period_end) < new Date();
    console.log("expired:", expired, "| currentPeriodEnd:", sub.current_period_end);

    if (expired) { console.log("Expired → Free"); return; }

    console.log("planId:", sub.plan_id);
    if (sub.plan_id === "enterprise") console.log("✅ RESULT: ENTERPRISE");
    else if (sub.plan_id === "startup") console.log("✅ RESULT: STARTUP");
    else if (sub.plan_id === "team") console.log("✅ RESULT: TEAM");
    else console.log("❓ Unknown planId — falls to TEAM as default");
}

main().catch(console.error);
