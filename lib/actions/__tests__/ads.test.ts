import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
    getWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            tools: { findFirst: vi.fn() },
        },
        insert: vi.fn(),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args), and: vi.fn((...args) => args) };
});

const { mockSessionCreate } = vi.hoisted(() => ({
    mockSessionCreate: vi.fn(),
}));

vi.mock("@/lib/services/stripe", () => ({
    stripe: {
        checkout: {
            sessions: { create: mockSessionCreate },
        },
    },
    assertStripeConfigured: vi.fn(),
}));

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { createAdCampaign } from "../ads";

const MOCK_USER = {
    id: "user_1",
    emailAddresses: [{ emailAddress: "user@example.com" }],
};
const MOCK_MEMBER = { id: "mem_1", userId: "user_1", workspaceId: "ws_1" };
const MOCK_TOOL = { id: "tool_1", workspaceId: "ws_1", name: "Linear" };

describe("createAdCampaign", () => {
    const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

    beforeEach(() => {
        vi.resetAllMocks();
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_TOOL);

        const returning = vi.fn().mockResolvedValue([{ id: "ad_1" }]);
        const insertValues = vi.fn().mockReturnValue({ returning });
        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });
        (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

        mockSessionCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_xyz" });
    });

    afterEach(() => {
        process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createAdCampaign("ws_1", "tool_1", 50)).rejects.toThrow("Unauthorized");
    });

    it("throws when no workspace found", async () => {
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createAdCampaign("ws_1", "tool_1", 50)).rejects.toThrow("No workspace found");
    });

    it("throws when member is not in workspace", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createAdCampaign("ws_1", "tool_1", 50)).rejects.toThrow("Unauthorized");
    });

    it("throws when tool is not found in workspace", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createAdCampaign("ws_1", "tool_1", 50)).rejects.toThrow("Tool not found");
    });

    it("throws for budget below $5", async () => {
        await expect(createAdCampaign("ws_1", "tool_1", 4)).rejects.toThrow("Budget must be between");
    });

    it("throws for budget above $100,000", async () => {
        await expect(createAdCampaign("ws_1", "tool_1", 100001)).rejects.toThrow("Budget must be between");
    });

    it("throws for NaN budget", async () => {
        await expect(createAdCampaign("ws_1", "tool_1", NaN)).rejects.toThrow("Budget must be between");
    });

    it("returns checkout URL for valid campaign", async () => {
        const result = await createAdCampaign("ws_1", "tool_1", 100);
        expect(result).toEqual({ url: "https://checkout.stripe.com/session_xyz" });
    });

    it("creates ad with draft status before Stripe session", async () => {
        await createAdCampaign("ws_1", "tool_1", 100);
        expect(db.insert).toHaveBeenCalledTimes(1);
        const insertedValues = (
            (db.insert as ReturnType<typeof vi.fn>).mock.results[0].value.values as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(insertedValues.status).toBe("draft");
        expect(insertedValues.budget).toBe(10000); // $100 * 100 cents
    });

    it("sets Stripe metadata with adId and workspaceId", async () => {
        await createAdCampaign("ws_1", "tool_1", 50);
        const session = mockSessionCreate.mock.calls[0][0];
        expect(session.metadata.type).toBe("ad_campaign");
        expect(session.metadata.workspaceId).toBe("ws_1");
        expect(session.metadata.adId).toBe("ad_1");
    });

    it("throws if Stripe session has no URL", async () => {
        mockSessionCreate.mockResolvedValue({ url: null });
        await expect(createAdCampaign("ws_1", "tool_1", 50)).rejects.toThrow("Failed to create checkout session");
    });

    it("accepts exact boundary value of $5", async () => {
        const result = await createAdCampaign("ws_1", "tool_1", 5);
        expect(result.url).toBeDefined();
    });

    it("accepts exact boundary value of $100,000", async () => {
        const result = await createAdCampaign("ws_1", "tool_1", 100000);
        expect(result.url).toBeDefined();
    });
});
