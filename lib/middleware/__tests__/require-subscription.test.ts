import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            subscriptions: { findFirst: vi.fn() },
        },
    },
}));

import { db } from "@/lib/db";
import { checkFeatureAccess, getWorkspacePlan } from "../require-subscription";

const FREE_SUB = undefined; // No subscription = free plan

const TEAM_SUB = {
    id: "sub_1",
    workspaceId: "ws_1",
    status: "active",
    planId: "price_team",
    creditBalance: 0,
};

const STARTUP_SUB = {
    id: "sub_2",
    workspaceId: "ws_2",
    status: "active",
    planId: "startup", // matches exact planId check in getPlanLimits
    creditBalance: 0,
};

describe("checkFeatureAccess", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns null for free plan when feature requires paid plan", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(FREE_SUB);
        const result = await checkFeatureAccess("ws_free", "slackIntegration");
        expect(result).toBeNull();
    });

    it("returns null for free plan checking askAI feature", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(FREE_SUB);
        const result = await checkFeatureAccess("ws_free", "askAI");
        expect(result).toBeNull();
    });

    it("returns plan for team subscription with slackIntegration feature", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(TEAM_SUB);
        const result = await checkFeatureAccess("ws_1", "slackIntegration");
        expect(result).not.toBeNull();
        expect(result?.slug).toBe("team");
    });

    it("returns null for team plan checking askAI (Startup+ only)", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(TEAM_SUB);
        const result = await checkFeatureAccess("ws_1", "askAI");
        expect(result).toBeNull();
    });

    it("returns plan for startup subscription with askAI feature", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(STARTUP_SUB);
        const result = await checkFeatureAccess("ws_2", "askAI");
        expect(result).not.toBeNull();
        expect(result?.slug).toBe("startup");
    });
});

describe("getWorkspacePlan", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns free plan when no subscription exists", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await getWorkspacePlan("ws_free");
        expect(result.plan.slug).toBe("free");
        expect(result.subscription).toBeNull();
        expect(result.isActive).toBe(false);
    });

    it("returns active status for active subscription", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(TEAM_SUB);
        const result = await getWorkspacePlan("ws_1");
        expect(result.isActive).toBe(true);
        expect(result.subscription).toBeTruthy();
    });

    it("returns active status for trialing subscription", async () => {
        const trialSub = { ...TEAM_SUB, status: "trialing" };
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(trialSub);
        const result = await getWorkspacePlan("ws_1");
        expect(result.isActive).toBe(true);
    });

    it("returns inactive status for canceled subscription", async () => {
        const canceledSub = { ...TEAM_SUB, status: "canceled" };
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(canceledSub);
        const result = await getWorkspacePlan("ws_1");
        expect(result.isActive).toBe(false);
    });
});
