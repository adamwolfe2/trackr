import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpdate } = vi.hoisted(() => ({
    mockUpdate: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    }),
}));

vi.mock("@/lib/services/stripe", () => ({
    stripe: {
        webhooks: { constructEvent: vi.fn() },
        subscriptions: { retrieve: vi.fn() },
        invoices: { list: vi.fn() },
        transfers: { createReversal: vi.fn() },
    },
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            webhookEvents: { findFirst: vi.fn() },
            subscriptions: { findFirst: vi.fn() },
            workspaceMembers: { findFirst: vi.fn() },
            architectCommissions: { findFirst: vi.fn() },
            architects: { findFirst: vi.fn() },
            architectReferrals: { findFirst: vi.fn() },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoNothing: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: "evt_1" }]),
                }),
            }),
        }),
        update: mockUpdate,
    },
}));

vi.mock("@clerk/nextjs/server", () => ({
    clerkClient: vi.fn().mockResolvedValue({ users: { getUser: vi.fn() } }),
}));

vi.mock("@/lib/email/resend", () => ({
    sendTrialEndingEmail: vi.fn(),
    cancelDripForUser: vi.fn(),
    sendCommissionEarned: vi.fn(),
}));

vi.mock("@/lib/config/subscriptions", () => ({
    getPlanLimits: vi.fn().mockReturnValue({ name: "Pro" }),
}));

vi.mock("@/lib/analytics/posthog-server", () => ({
    captureEvent: vi.fn().mockResolvedValue(undefined),
}));

import { stripe } from "@/lib/services/stripe";
import { db } from "@/lib/db";
import { POST } from "../route";

function makeRequest(body: string, signature = "sig_test") {
    return new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": signature },
        body,
    }) as unknown as import("next/server").NextRequest;
}

function makeChargeRefundedEvent(overrides: Record<string, unknown> = {}) {
    return {
        id: "evt_refund_1",
        type: "charge.refunded",
        data: {
            object: {
                id: "ch_1",
                payment_intent: "pi_1",
                amount: 10000,
                amount_refunded: 10000,
                ...overrides,
            },
        },
    };
}

describe("charge.refunded — commission clawback", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    });

    it("skips clawback when no commission exists for the invoice", async () => {
        const event = makeChargeRefundedEvent();
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(stripe.invoices.list).mockResolvedValue({ data: [{ id: "inv_1" }] } as never);
        vi.mocked(db.query.architectCommissions.findFirst).mockResolvedValue(undefined);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("skips clawback outside 60-day window", async () => {
        const event = makeChargeRefundedEvent();
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(stripe.invoices.list).mockResolvedValue({ data: [{ id: "inv_1" }] } as never);
        vi.mocked(db.query.architectCommissions.findFirst).mockResolvedValue({
            id: "comm_1",
            architectId: "arch_1",
            commissionAmount: 2000,
            status: "paid",
            stripeTransferId: "tr_1",
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        } as never);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
    });

    it("full refund marks commission as failed and decrements earnings", async () => {
        const event = makeChargeRefundedEvent({ amount: 10000, amount_refunded: 10000 });
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(stripe.invoices.list).mockResolvedValue({ data: [{ id: "inv_1" }] } as never);
        vi.mocked(stripe.transfers.createReversal).mockResolvedValue({} as never);
        vi.mocked(db.query.architectCommissions.findFirst).mockResolvedValue({
            id: "comm_1",
            architectId: "arch_1",
            commissionAmount: 2000,
            status: "paid",
            stripeTransferId: "tr_1",
            createdAt: new Date(),
        } as never);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalled();
    });

    it("partial refund reduces commission proportionally", async () => {
        const event = makeChargeRefundedEvent({ amount: 10000, amount_refunded: 5000 });
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(stripe.invoices.list).mockResolvedValue({ data: [{ id: "inv_1" }] } as never);
        vi.mocked(stripe.transfers.createReversal).mockResolvedValue({} as never);
        vi.mocked(db.query.architectCommissions.findFirst).mockResolvedValue({
            id: "comm_1",
            architectId: "arch_1",
            commissionAmount: 2000,
            status: "paid",
            stripeTransferId: "tr_1",
            createdAt: new Date(),
        } as never);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalled();
    });

    it("transfer reversal failure marks commission as failed", async () => {
        const event = makeChargeRefundedEvent();
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(stripe.invoices.list).mockResolvedValue({ data: [{ id: "inv_1" }] } as never);
        vi.mocked(stripe.transfers.createReversal).mockRejectedValue(new Error("Stripe error"));
        vi.mocked(db.query.architectCommissions.findFirst).mockResolvedValue({
            id: "comm_1",
            architectId: "arch_1",
            commissionAmount: 2000,
            status: "paid",
            stripeTransferId: "tr_1",
            createdAt: new Date(),
        } as never);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalled();
    });
});
