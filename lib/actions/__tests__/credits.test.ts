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
        insert: vi.fn(() => ({ values: vi.fn() })),
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args) };
});

vi.mock("@/lib/config/subscriptions", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/config/subscriptions")>();
    return {
        ...actual,
        getPlanLimits: vi.fn(),
    };
});

const { mockSessionCreate, mockCustomerCreate } = vi.hoisted(() => ({
    mockSessionCreate: vi.fn(),
    mockCustomerCreate: vi.fn(),
}));

vi.mock("@/lib/services/stripe", () => ({
    stripe: {
        checkout: {
            sessions: { create: mockSessionCreate },
        },
        customers: { create: mockCustomerCreate },
    },
    assertStripeConfigured: vi.fn(),
}));

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/config/subscriptions";
import { purchaseCredits } from "../credits";

const MOCK_USER = { id: "user_1", emailAddresses: [{ emailAddress: "test@example.com" }] };
const MOCK_SUBSCRIPTION = {
    id: "sub_1",
    workspaceId: "ws_1",
    status: "active",
    stripeCustomerId: "cus_123",
};

describe("purchaseCredits", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_SUBSCRIPTION);
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({ slug: "team" });
        mockSessionCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_abc" });
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(purchaseCredits(25)).rejects.toThrow("Unauthorized");
    });

    it("throws when no workspace found", async () => {
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(purchaseCredits(25)).rejects.toThrow("No workspace found");
    });

    it("throws for invalid credit pack size", async () => {
        await expect(purchaseCredits(7 as any)).rejects.toThrow("Invalid credit pack size");
    });

    it("calls stripe.checkout.sessions.create for valid pack of 25", async () => {
        const result = await purchaseCredits(25);
        expect(result).toEqual({ url: "https://checkout.stripe.com/session_abc" });
        expect(mockSessionCreate).toHaveBeenCalledTimes(1);
        const call = mockSessionCreate.mock.calls[0][0];
        expect(call.mode).toBe("payment");
        expect(call.metadata.creditCount).toBe("25");
        expect(call.metadata.type).toBe("extra_credits");
    });

    it("calls stripe with correct credit count for pack of 100", async () => {
        await purchaseCredits(100);
        const call = mockSessionCreate.mock.calls[0][0];
        expect(call.metadata.creditCount).toBe("100");
    });

    it("passes stripeCustomerId when subscription has one", async () => {
        await purchaseCredits(50);
        const call = mockSessionCreate.mock.calls[0][0];
        expect(call.customer).toBe("cus_123");
    });

    it("accepts purchase for free plan users with no subscription", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({ slug: "free" });
        mockCustomerCreate.mockResolvedValue({ id: "cus_new" });

        const result = await purchaseCredits(25);
        expect(result.url).toBeDefined();
        expect(mockCustomerCreate).toHaveBeenCalledTimes(1);
    });
});
