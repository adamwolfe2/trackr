import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            subscriptions: { findFirst: vi.fn() },
        },
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args) };
});

vi.mock("next/server", () => ({
    after: vi.fn((fn: () => void) => fn()),
}));

const { mockCheckoutCreate, mockPortalCreate } = vi.hoisted(() => ({
    mockCheckoutCreate: vi.fn(),
    mockPortalCreate: vi.fn(),
}));

vi.mock("@/lib/services/stripe", () => ({
    stripe: {
        checkout: { sessions: { create: mockCheckoutCreate } },
        billingPortal: { sessions: { create: mockPortalCreate } },
    },
}));

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { createCheckoutSession, createCustomerPortalSession } from "../stripe";

const MOCK_USER = {
    id: "user_1",
    emailAddresses: [{ emailAddress: "owner@acme.com" }],
};
const MOCK_OWNER_MEMBER = { id: "mem_1", userId: "user_1", workspaceId: "ws_1", role: "owner" };
const MOCK_ADMIN_MEMBER = { id: "mem_3", userId: "user_1", workspaceId: "ws_1", role: "admin" };
const MOCK_VIEWER_MEMBER = { id: "mem_2", userId: "user_1", workspaceId: "ws_1", role: "viewer" };

describe("createCheckoutSession", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_OWNER_MEMBER);
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        mockCheckoutCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session_abc" });
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
        process.env.STRIPE_TEAM_MONTHLY_PRICE_ID = "price_team_monthly";
        process.env.STRIPE_TEAM_ANNUAL_PRICE_ID = "price_team_annual";
        process.env.STRIPE_STARTUP_MONTHLY_PRICE_ID = "price_startup_monthly";
    });

    afterEach(() => {
        process.env.NEXT_PUBLIC_APP_URL = originalEnv.NEXT_PUBLIC_APP_URL;
        process.env.STRIPE_TEAM_MONTHLY_PRICE_ID = originalEnv.STRIPE_TEAM_MONTHLY_PRICE_ID;
        process.env.STRIPE_TEAM_ANNUAL_PRICE_ID = originalEnv.STRIPE_TEAM_ANNUAL_PRICE_ID;
        process.env.STRIPE_STARTUP_MONTHLY_PRICE_ID = originalEnv.STRIPE_STARTUP_MONTHLY_PRICE_ID;
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createCheckoutSession("ws_1")).rejects.toThrow("Unauthorized");
    });

    it("throws when user is a viewer (not owner or admin)", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_VIEWER_MEMBER);
        await expect(createCheckoutSession("ws_1")).rejects.toThrow("Unauthorized");
    });

    it("allows admin role to create checkout session", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_MEMBER);
        const result = await createCheckoutSession("ws_1", "team", "monthly");
        expect(result).toEqual({ url: "https://checkout.stripe.com/session_abc" });
    });

    it("throws when user is not in the requested workspace (DB returns null with scoped query)", async () => {
        // Query is now scoped to workspaceId, so DB returns null when user isn't in that workspace
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createCheckoutSession("ws_DIFFERENT")).rejects.toThrow("Unauthorized");
    });

    it("throws when no member found at all", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createCheckoutSession("ws_1")).rejects.toThrow("Unauthorized");
    });

    it("throws when price env var is not configured", async () => {
        delete process.env.STRIPE_TEAM_MONTHLY_PRICE_ID;
        await expect(createCheckoutSession("ws_1", "team", "monthly")).rejects.toThrow("not configured");
    });

    it("creates checkout session and returns URL", async () => {
        const result = await createCheckoutSession("ws_1", "team", "monthly");
        expect(result).toEqual({ url: "https://checkout.stripe.com/session_abc" });
        expect(mockCheckoutCreate).toHaveBeenCalledTimes(1);
    });

    it("uses customer email when no existing subscription", async () => {
        await createCheckoutSession("ws_1", "team", "monthly");
        const call = mockCheckoutCreate.mock.calls[0][0];
        expect(call.customer_email).toBe("owner@acme.com");
        expect(call.customer).toBeUndefined();
    });

    it("reuses existing Stripe customer ID when subscription exists", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            stripeCustomerId: "cus_existing123",
        });
        await createCheckoutSession("ws_1", "team", "monthly");
        const call = mockCheckoutCreate.mock.calls[0][0];
        expect(call.customer).toBe("cus_existing123");
        expect(call.customer_email).toBeUndefined();
    });

    it("uses annual price ID for annual interval", async () => {
        await createCheckoutSession("ws_1", "team", "annual");
        const call = mockCheckoutCreate.mock.calls[0][0];
        expect(call.line_items[0].price).toBe("price_team_annual");
    });

    it("uses startup price ID for startup plan", async () => {
        await createCheckoutSession("ws_1", "startup", "monthly");
        const call = mockCheckoutCreate.mock.calls[0][0];
        expect(call.line_items[0].price).toBe("price_startup_monthly");
    });

    it("sets 14-day trial period", async () => {
        await createCheckoutSession("ws_1", "team", "monthly");
        const call = mockCheckoutCreate.mock.calls[0][0];
        expect(call.subscription_data.trial_period_days).toBe(14);
    });

    it("throws when Stripe session has no URL", async () => {
        mockCheckoutCreate.mockResolvedValue({ url: null });
        await expect(createCheckoutSession("ws_1")).rejects.toThrow("Failed to create checkout session");
    });
});

describe("createCustomerPortalSession", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_OWNER_MEMBER);
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            stripeCustomerId: "cus_123",
        });
        mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/session_abc" });
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createCustomerPortalSession("ws_1")).rejects.toThrow("Unauthorized");
    });

    it("throws when user is a viewer (not owner or admin)", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_VIEWER_MEMBER);
        await expect(createCustomerPortalSession("ws_1")).rejects.toThrow("Unauthorized");
    });

    it("allows admin role to open customer portal", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ADMIN_MEMBER);
        const result = await createCustomerPortalSession("ws_1");
        expect(result).toEqual({ url: "https://billing.stripe.com/session_abc" });
    });

    it("throws when no subscription found", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createCustomerPortalSession("ws_1")).rejects.toThrow("No subscription found");
    });

    it("throws when subscription has no stripeCustomerId", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            stripeCustomerId: null,
        });
        await expect(createCustomerPortalSession("ws_1")).rejects.toThrow("No subscription found");
    });

    it("creates portal session and returns URL", async () => {
        const result = await createCustomerPortalSession("ws_1");
        expect(result).toEqual({ url: "https://billing.stripe.com/session_abc" });
        expect(mockPortalCreate).toHaveBeenCalledWith({
            customer: "cus_123",
            return_url: "https://trytrackr.com/settings/billing",
        });
    });
});
