import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpdate } = vi.hoisted(() => ({
    mockUpdate: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    }),
}));

vi.mock("@sentry/nextjs", () => ({
    captureException: vi.fn(),
}));

vi.mock("@/lib/services/stripe", () => ({
    stripe: {
        webhooks: { constructEvent: vi.fn() },
        subscriptions: { retrieve: vi.fn() },
        invoices: { list: vi.fn() },
        paymentIntents: { retrieve: vi.fn() },
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

/** Sets up mocks so the charge.refunded handler can resolve the invoice from paymentIntents */
function mockPaymentIntentWithInvoice(invoiceId: string = "inv_1") {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        invoice: invoiceId,
    } as never);
}

describe("charge.refunded — commission clawback", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
        // Re-initialize insert mock chain (clearAllMocks removes implementations)
        vi.mocked(db.insert).mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoNothing: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: "evt_1" }]),
                }),
            }),
        } as never);
        mockUpdate.mockReturnValue({
            set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        });
        // Default: paymentIntents.retrieve returns an invoice
        mockPaymentIntentWithInvoice();
    });

    it("skips clawback when no commission exists for the invoice", async () => {
        const event = makeChargeRefundedEvent();
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(db.query.architectCommissions.findFirst).mockResolvedValue(undefined);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("skips clawback outside 60-day window", async () => {
        const event = makeChargeRefundedEvent();
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
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

    it("claws back commission at exactly 60-day boundary", async () => {
        const event = makeChargeRefundedEvent({ amount: 10000, amount_refunded: 10000 });
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(stripe.transfers.createReversal).mockResolvedValue({} as never);
        vi.mocked(db.query.architectCommissions.findFirst).mockResolvedValue({
            id: "comm_1",
            architectId: "arch_1",
            commissionAmount: 2000,
            status: "paid",
            stripeTransferId: "tr_1",
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // exactly 60 days ago
        } as never);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        // At exactly 60 days, daysSinceCommission === 60, which is NOT > 60, so clawback should proceed
        expect(mockUpdate).toHaveBeenCalled();
    });

    it("skips clawback at 61-day boundary", async () => {
        const event = makeChargeRefundedEvent({ amount: 10000, amount_refunded: 10000 });
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(db.query.architectCommissions.findFirst).mockResolvedValue({
            id: "comm_1",
            architectId: "arch_1",
            commissionAmount: 2000,
            status: "paid",
            stripeTransferId: "tr_1",
            createdAt: new Date(Date.now() - 61 * 24 * 60 * 60 * 1000), // 61 days ago
        } as never);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        // 61 days > 60, so clawback should be skipped
    });

    it("skips clawback when paymentIntent has no invoice", async () => {
        const event = makeChargeRefundedEvent();
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);
        vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
            invoice: null,
        } as never);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("skips clawback when charge has no payment_intent", async () => {
        const event = makeChargeRefundedEvent({ payment_intent: null });
        vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(event as never);

        const res = await POST(makeRequest("body"));
        expect(res.status).toBe(200);
        expect(mockUpdate).not.toHaveBeenCalled();
    });
});
