import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock deps before imports ─────────────────────────────────────────────────

vi.mock("@/lib/services/stripe", () => ({
    stripe: {
        webhooks: {
            constructEvent: vi.fn(),
        },
        subscriptions: {
            retrieve: vi.fn(),
            cancel: vi.fn().mockResolvedValue(undefined),
        },
    },
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            webhookEvents: { findFirst: vi.fn() },
            subscriptions: { findFirst: vi.fn() },
            workspaceMembers: { findFirst: vi.fn() },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoNothing: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: "evt_1" }]),
                }),
                onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
            }),
        }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
    },
}));

vi.mock("@clerk/nextjs/server", () => ({
    clerkClient: vi.fn().mockResolvedValue({
        users: {
            getUser: vi.fn().mockResolvedValue({
                emailAddresses: [{ emailAddress: "owner@example.com" }],
            }),
        },
    }),
}));

vi.mock("@/lib/email/resend", () => ({
    sendTrialEndingEmail: vi.fn().mockResolvedValue(undefined),
    cancelDripForUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/config/subscriptions", () => ({
    getPlanLimits: vi.fn().mockReturnValue({ name: "Pro" }),
}));

// ── Imports ──────────────────────────────────────────────────────────────────

import { stripe } from "@/lib/services/stripe";
import { db } from "@/lib/db";
import { POST } from "../route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeStripeRequest(body = "{}") {
    return {
        text: () => Promise.resolve(body),
        headers: {
            get: (key: string) => key === "stripe-signature" ? "t=123,v1=abc" : null,
        },
    } as unknown as import("next/server").NextRequest;
}

function mockStripeEvent(type: string, data: Record<string, unknown>, id = `evt_${type}`) {
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue({
        id,
        type,
        data: { object: data },
    });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/stripe/webhook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

        // Default: not already processed
        (db.query.webhookEvents.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        // Default: no subscription found
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        // Re-wire insert/update chains after clearAllMocks
        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoNothing: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: "evt_1" }]),
                }),
                onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
            }),
        });
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
            set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        });
    });

    it("returns 400 when stripe-signature header is missing", async () => {
        const req = {
            text: () => Promise.resolve("{}"),
            headers: { get: () => null },
        } as unknown as import("next/server").NextRequest;
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("returns 400 when signature verification fails", async () => {
        (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockImplementation(() => {
            throw new Error("invalid signature");
        });
        const res = await POST(makeStripeRequest());
        expect(res.status).toBe(400);
    });

    it("returns 200 (idempotent) for already-processed event", async () => {
        // Simulate the atomic insert returning empty — event was already claimed
        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoNothing: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([]),
                }),
                onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
            }),
        });
        mockStripeEvent("checkout.session.completed", {}, "evt_dup");

        const res = await POST(makeStripeRequest());
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.received).toBe(true);
        // Should NOT have updated anything (early return after duplicate detected)
        expect(db.update).not.toHaveBeenCalled();
    });

    it("handles checkout.session.completed for subscription", async () => {
        (stripe.subscriptions.retrieve as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "sub_123",
            status: "active",
            customer: "cus_123",
            items: { data: [{ price: { id: "price_pro" }, current_period_end: 1700000000 }] },
        });

        mockStripeEvent("checkout.session.completed", {
            subscription: "sub_123",
            metadata: { workspaceId: "ws_123" },
        });

        const res = await POST(makeStripeRequest());
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.received).toBe(true);
    });

    it("handles checkout.session.completed for extra credits", async () => {
        mockStripeEvent("checkout.session.completed", {
            metadata: { type: "extra_credits", workspaceId: "ws_456", creditCount: "5" },
        });

        const res = await POST(makeStripeRequest());
        expect(res.status).toBe(200);
    });

    it("handles customer.subscription.updated", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "dbsub_1",
            stripeSubscriptionId: "sub_upd",
            workspaceId: "ws_1",
            status: "trialing",
        });

        mockStripeEvent("customer.subscription.updated", {
            id: "sub_upd",
            status: "active",
            customer: "cus_1",
            items: { data: [{ price: { id: "price_pro" }, current_period_end: 1800000000 }] },
        });

        const res = await POST(makeStripeRequest());
        expect(res.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
    });

    it("handles customer.subscription.deleted", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "dbsub_del",
            stripeSubscriptionId: "sub_del",
            workspaceId: "ws_del",
            status: "active",
        });

        mockStripeEvent("customer.subscription.deleted", {
            id: "sub_del",
            status: "canceled",
            customer: "cus_del",
            items: { data: [] },
        });

        const res = await POST(makeStripeRequest());
        expect(res.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
    });

    it("handles invoice.payment_failed → sets past_due", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "dbsub_2",
            stripeSubscriptionId: "sub_pf",
            workspaceId: "ws_2",
            status: "active",
        });

        mockStripeEvent("invoice.payment_failed", {
            parent: { subscription_details: { subscription: "sub_pf" } },
        });

        const res = await POST(makeStripeRequest());
        expect(res.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
    });

    it("handles invoice.payment_succeeded → restores active if was past_due", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "dbsub_3",
            stripeSubscriptionId: "sub_ps",
            workspaceId: "ws_3",
            status: "past_due",
        });

        mockStripeEvent("invoice.payment_succeeded", {
            parent: { subscription_details: { subscription: "sub_ps" } },
        });

        const res = await POST(makeStripeRequest());
        expect(res.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
    });

    it("handles invoice.payment_succeeded → restores active if was incomplete", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "dbsub_inc",
            stripeSubscriptionId: "sub_inc",
            workspaceId: "ws_inc",
            status: "incomplete",
        });

        mockStripeEvent("invoice.payment_succeeded", {
            parent: { subscription_details: { subscription: "sub_inc" } },
        });

        const res = await POST(makeStripeRequest());
        expect(res.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
    });

    it("handles customer.subscription.trial_will_end", async () => {
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "dbsub_trial",
            stripeSubscriptionId: "sub_trial",
            workspaceId: "ws_trial",
            status: "trialing",
        });
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "mem_owner",
            userId: "usr_owner",
            workspaceId: "ws_trial",
            role: "owner",
        });

        mockStripeEvent("customer.subscription.trial_will_end", {
            id: "sub_trial",
            trial_end: Math.floor(Date.now() / 1000) + 3 * 86400,
            customer: "cus_trial",
            items: { data: [] },
        });

        const res = await POST(makeStripeRequest());
        expect(res.status).toBe(200);
    });

    it("records audit log entry for processed events", async () => {
        mockStripeEvent("customer.subscription.deleted", {
            id: "sub_audit",
            status: "canceled",
            customer: "cus_audit",
            items: { data: [] },
        });

        await POST(makeStripeRequest());
        // insert should be called for the webhookEvents audit log
        expect(db.insert).toHaveBeenCalled();
    });
});
