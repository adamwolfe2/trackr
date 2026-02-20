import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Shared mutable verify fn, controlled per test ────────────────────────────
const mockVerify = vi.fn();

vi.mock("next/headers", () => ({
    headers: vi.fn(),
}));

vi.mock("svix", () => ({
    Webhook: function Webhook(_secret: string) {
        return { verify: mockVerify };
    },
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            webhookEvents: { findFirst: vi.fn() },
            pendingInvitations: { findFirst: vi.fn() },
            workspaceMembers: { findMany: vi.fn() },
            subscriptions: { findFirst: vi.fn() },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
            }),
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            }),
        }),
        delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
        }),
    },
}));

vi.mock("@/lib/db/ensure-workspace", () => ({
    ensureWorkspace: vi.fn().mockResolvedValue({ created: true }),
}));

vi.mock("@/lib/email/resend", () => ({
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    scheduleDripSequence: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/services/stripe", () => ({
    stripe: {
        subscriptions: { cancel: vi.fn().mockResolvedValue(undefined) },
    },
}));

// ── Imports (after mocks) ────────────────────────────────────────────────────

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { ensureWorkspace } from "@/lib/db/ensure-workspace";
import { sendWelcomeEmail, scheduleDripSequence } from "@/lib/email/resend";
import { POST } from "../route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSvixHeaders(overrides: Record<string, string | null> = {}) {
    const defaults: Record<string, string> = {
        "svix-id": "msg_test_123",
        "svix-timestamp": "1700000000",
        "svix-signature": "v1,valid_sig",
    };
    const map: Record<string, string | null> = { ...defaults, ...overrides };
    return { get: (key: string) => map[key] ?? null };
}

function makeRequest(body: Record<string, unknown>) {
    return { json: () => Promise.resolve(body) } as unknown as Request;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/clerk", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CLERK_WEBHOOK_SECRET = "whsec_test";

        // Reset mutable verify mock
        mockVerify.mockReset();
        mockVerify.mockReturnValue({ type: "user.created", data: {} });

        (db.query.webhookEvents.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        (headers as ReturnType<typeof vi.fn>).mockResolvedValue(makeSvixHeaders());

        // Re-wire insert chain (cleared by vi.clearAllMocks)
        const insertChain = {
            values: vi.fn().mockReturnValue({
                onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
            }),
        };
        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);
        const updateChain = {
            set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        };
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateChain);
        (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    });

    it("returns 400 when svix headers are missing", async () => {
        (headers as ReturnType<typeof vi.fn>).mockResolvedValue({ get: () => null });
        const res = await POST(makeRequest({}));
        expect(res.status).toBe(400);
    });

    it("returns 400 when signature verification fails", async () => {
        mockVerify.mockImplementation(() => { throw new Error("bad signature"); });
        const res = await POST(makeRequest({ type: "user.created", data: {} }));
        expect(res.status).toBe(400);
    });

    it("returns 200 (idempotent) for already-processed event", async () => {
        (db.query.webhookEvents.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "existing" });
        mockVerify.mockReturnValue({ type: "user.created", data: { id: "usr_1", email_addresses: [], username: "alice" } });

        const res = await POST(makeRequest({}));
        expect(res.status).toBe(200);
        expect(ensureWorkspace).not.toHaveBeenCalled();
    });

    it("creates workspace on user.created with no pending invitation", async () => {
        mockVerify.mockReturnValue({
            type: "user.created",
            data: {
                id: "usr_abc",
                email_addresses: [{ email_address: "new@example.com" }],
                username: "newuser",
                first_name: "New",
            },
        });

        const res = await POST(makeRequest({}));
        expect(res.status).toBe(200);
        expect(ensureWorkspace).toHaveBeenCalledWith("usr_abc", expect.objectContaining({ email: "new@example.com" }));
        expect(sendWelcomeEmail).toHaveBeenCalled();
        expect(scheduleDripSequence).toHaveBeenCalled();
    });

    it("joins existing workspace when pending invitation exists", async () => {
        (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "inv_1",
            workspaceId: "ws_xyz",
            email: "invited@example.com",
            expiresAt: new Date(Date.now() + 86400000),
            workspace: { id: "ws_xyz" },
        });

        mockVerify.mockReturnValue({
            type: "user.created",
            data: {
                id: "usr_invited",
                email_addresses: [{ email_address: "invited@example.com" }],
                username: "invited",
                first_name: "Invited",
            },
        });

        const res = await POST(makeRequest({}));
        expect(res.status).toBe(200);
        expect(ensureWorkspace).not.toHaveBeenCalled();
        expect(db.insert).toHaveBeenCalled();
    });

    it("calls ensureWorkspace on user.updated", async () => {
        mockVerify.mockReturnValue({
            type: "user.updated",
            data: {
                id: "usr_upd",
                email_addresses: [{ email_address: "updated@example.com" }],
                username: "updateduser",
                first_name: "Updated",
            },
        });

        const res = await POST(makeRequest({}));
        expect(res.status).toBe(200);
        expect(ensureWorkspace).toHaveBeenCalledWith("usr_upd", expect.any(Object));
    });

    it("removes workspace memberships on user.deleted (non-owner)", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "mem_1", userId: "usr_del", workspaceId: "ws_1", role: "member" },
        ]);

        mockVerify.mockReturnValue({
            type: "user.deleted",
            data: { id: "usr_del" },
        });

        const res = await POST(makeRequest({}));
        expect(res.status).toBe(200);
        expect(db.delete).toHaveBeenCalled();
    });

    it("cancels subscription when owner is deleted", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "mem_owner", userId: "usr_owner", workspaceId: "ws_2", role: "owner" },
        ]);
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "sub_1",
            stripeSubscriptionId: "sub_stripe_1",
            workspaceId: "ws_2",
            status: "active",
        });

        mockVerify.mockReturnValue({
            type: "user.deleted",
            data: { id: "usr_owner" },
        });

        const { stripe } = await import("@/lib/services/stripe");
        const res = await POST(makeRequest({}));
        expect(res.status).toBe(200);
        expect(stripe.subscriptions.cancel).toHaveBeenCalledWith("sub_stripe_1");
    });

    it("marks event as processed after success", async () => {
        mockVerify.mockReturnValue({
            type: "user.created",
            data: {
                id: "usr_mark",
                email_addresses: [{ email_address: "mark@example.com" }],
                username: "mark",
                first_name: "Mark",
            },
        });

        await POST(makeRequest({}));
        expect(db.insert).toHaveBeenCalled();
    });
});
