import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
    getWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            subscriptions: { findFirst: vi.fn() },
        },
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args) };
});

vi.mock("@/lib/config/subscriptions", () => ({
    getPlanLimits: vi.fn(),
}));

const { mockSessionCreate } = vi.hoisted(() => ({
    mockSessionCreate: vi.fn(),
}));

vi.mock("@/lib/services/stripe", () => ({
    stripe: {
        checkout: {
            sessions: { create: mockSessionCreate },
        },
    },
}));

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/config/subscriptions";
import { purchaseExtraCredits } from "../credits";

const MOCK_USER = { id: "user_1" };
const MOCK_SUBSCRIPTION = {
    id: "sub_1",
    workspaceId: "ws_1",
    status: "active",
    stripeCustomerId: "cus_123",
};

describe("purchaseExtraCredits", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_SUBSCRIPTION);
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({ extraCreditPrice: 1.00 });
        mockSessionCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_abc" });
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(purchaseExtraCredits(5)).rejects.toThrow("Unauthorized");
    });

    it("throws when no workspace found", async () => {
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(purchaseExtraCredits(5)).rejects.toThrow("No workspace found");
    });

    it("throws for invalid credit pack (not 5, 10, or 25)", async () => {
        await expect(purchaseExtraCredits(7)).rejects.toThrow("Invalid credit pack");
    });

    it("throws for credit count of 0", async () => {
        await expect(purchaseExtraCredits(0)).rejects.toThrow("Invalid credit pack");
    });

    it("throws when no subscription exists", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(purchaseExtraCredits(5)).rejects.toThrow("Active subscription required");
    });

    it("throws when subscription status is 'canceled'", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_SUBSCRIPTION,
            status: "canceled",
        });
        await expect(purchaseExtraCredits(5)).rejects.toThrow("Active subscription required");
    });

    it("accepts 'trialing' subscription status", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_SUBSCRIPTION,
            status: "trialing",
        });
        const result = await purchaseExtraCredits(5);
        expect(result.url).toBeDefined();
    });

    it("throws when plan has no extraCreditPrice", async () => {
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({ extraCreditPrice: null });
        await expect(purchaseExtraCredits(5)).rejects.toThrow("Extra credits not available");
    });

    it("calls stripe.checkout.sessions.create for valid pack of 5", async () => {
        const result = await purchaseExtraCredits(5);
        expect(result).toEqual({ url: "https://checkout.stripe.com/session_abc" });
        expect(mockSessionCreate).toHaveBeenCalledTimes(1);
        const call = mockSessionCreate.mock.calls[0][0];
        expect(call.mode).toBe("payment");
        expect(call.metadata.creditCount).toBe("5");
        expect(call.metadata.type).toBe("extra_credits");
    });

    it("calls stripe with correct credit count for pack of 25", async () => {
        await purchaseExtraCredits(25);
        const call = mockSessionCreate.mock.calls[0][0];
        expect(call.metadata.creditCount).toBe("25");
    });

    it("passes stripeCustomerId when subscription has one", async () => {
        await purchaseExtraCredits(10);
        const call = mockSessionCreate.mock.calls[0][0];
        expect(call.customer).toBe("cus_123");
    });

    it("passes undefined customer when stripeCustomerId is null", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_SUBSCRIPTION,
            stripeCustomerId: null,
        });
        await purchaseExtraCredits(10);
        const call = mockSessionCreate.mock.calls[0][0];
        expect(call.customer).toBeUndefined();
    });
});
