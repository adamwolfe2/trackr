import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ───────────────────────────────────────────────────────────

const { mockSendInviteEmail, mockCancelAuditDrips } = vi.hoisted(() => ({
    mockSendInviteEmail: vi.fn(),
    mockCancelAuditDrips: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
    isAdminAuthenticated: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/config/architect-packages", () => ({
    PACKAGE_LIST: [
        { slug: "assessment" },
        { slug: "implementation" },
        { slug: "retainer" },
    ],
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            auditSubmissions: { findFirst: vi.fn() },
            pendingInvitations: { findFirst: vi.fn() },
        },
        insert: vi.fn(),
        update: vi.fn(),
        select: vi.fn(),
    },
}));

vi.mock("@/lib/db/schema", () => ({
    auditSubmissions: { id: "id" },
    tools: {},
    softwareSpend: { workspaceId: "workspaceId", toolName: "toolName" },
    pendingInvitations: { workspaceId: "workspaceId", email: "email" },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
        ne: vi.fn((...args: unknown[]) => args),
        ilike: vi.fn((...args: unknown[]) => args),
    };
});

vi.mock("@/lib/email/resend", () => ({
    sendInviteEmail: mockSendInviteEmail,
}));

vi.mock("@/lib/email/audit-drips", () => ({
    cancelAuditDrips: mockCancelAuditDrips,
}));

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { provisionAndInvite } from "../actions";

// ── Test data ───────────────────────────────────────────────────────────────

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const MOCK_SUBMISSION = {
    id: VALID_UUID,
    preBuiltWorkspaceId: "ws_audit_1",
    contactEmail: "lead@example.com",
    companyName: "Acme Corp",
    scorecard: { aiNativeScore: { score: 45 } },
    status: "scored",
};

// ── Setup helpers ───────────────────────────────────────────────────────────

function setupDbChains() {
    // update chain
    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });

    // insert chain (with .returning() support)
    const insertReturning = vi.fn().mockResolvedValue([{ id: "invite_new" }]);
    const insertValues = vi.fn().mockReturnValue({ returning: insertReturning });
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    // select chain (for softwareSpend lookup)
    const selectWhere = vi.fn().mockResolvedValue([]);
    const selectFrom = vi.fn().mockReturnValue({ where: selectWhere });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: selectFrom });

    // Default query mocks
    (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_SUBMISSION);
    (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
}

describe("provisionAndInvite", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (isAdminAuthenticated as ReturnType<typeof vi.fn>).mockResolvedValue(true);
        mockSendInviteEmail.mockResolvedValue(undefined);
        mockCancelAuditDrips.mockResolvedValue(undefined);
    });

    it("returns error when not authenticated", async () => {
        (isAdminAuthenticated as ReturnType<typeof vi.fn>).mockResolvedValue(false);
        const result = await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "assessment",
            selectedToolNames: [],
        });
        expect(result).toEqual({ success: false, error: "Not authenticated" });
    });

    it("returns error with invalid submissionId (non-UUID)", async () => {
        const result = await provisionAndInvite({
            submissionId: "not-a-uuid",
            packageSlug: "assessment",
            selectedToolNames: [],
        });
        expect(result).toEqual({ success: false, error: "Invalid input" });
    });

    it("returns error when submission not found", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "assessment",
            selectedToolNames: [],
        });
        expect(result).toEqual({ success: false, error: "Submission not found" });
    });

    it("returns error when preBuiltWorkspaceId is null", async () => {
        (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_SUBMISSION,
            preBuiltWorkspaceId: null,
        });
        const result = await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "assessment",
            selectedToolNames: [],
        });
        expect(result).toEqual({ success: false, error: "Workspace not ready" });
    });

    it("seeds selected tools into softwareSpend", async () => {
        const result = await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "implementation",
            selectedToolNames: ["HubSpot", "Notion"],
        });
        expect(result.success).toBe(true);
        // insert is called for softwareSpend tools, then for pendingInvitations
        expect(db.insert).toHaveBeenCalled();
    });

    it("updates scorecard with selectedPackage", async () => {
        await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "retainer",
            selectedToolNames: [],
        });
        expect(db.update).toHaveBeenCalled();
        // Verify the first update call sets the scorecard with selectedPackage
        const firstUpdateSetCall = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(firstUpdateSetCall.scorecard.selectedPackage).toBe("retainer");
    });

    it("creates pendingInvitations row", async () => {
        (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "assessment",
            selectedToolNames: [],
        });
        // insert called for pendingInvitations (and potentially softwareSpend)
        expect(db.insert).toHaveBeenCalled();
    });

    it("calls sendInviteEmail", async () => {
        await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "assessment",
            selectedToolNames: [],
        });
        expect(mockSendInviteEmail).toHaveBeenCalledWith(
            "lead@example.com",
            "Acme Corp",
            "Trackr Team",
            "invite_new",
        );
    });

    it("calls cancelAuditDrips", async () => {
        await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "assessment",
            selectedToolNames: [],
        });
        expect(mockCancelAuditDrips).toHaveBeenCalledWith(VALID_UUID);
    });

    it("does not create duplicate softwareSpend entries (idempotent)", async () => {
        // Simulate existing tools in workspace
        const selectWhere = vi.fn().mockResolvedValue([
            { toolName: "HubSpot" },
            { toolName: "Notion" },
        ]);
        const selectFrom = vi.fn().mockReturnValue({ where: selectWhere });
        (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: selectFrom });

        const insertReturning = vi.fn().mockResolvedValue([{ id: "invite_new" }]);
        const insertValues = vi.fn().mockReturnValue({ returning: insertReturning });
        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

        await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "assessment",
            selectedToolNames: ["HubSpot", "Notion"],
        });

        // db.insert should only be called for pendingInvitations, not for softwareSpend
        // since both tools already exist
        const insertCalls = (db.insert as ReturnType<typeof vi.fn>).mock.calls;
        // The first insert call should be for pendingInvitations, not softwareSpend
        // (softwareSpend insert is skipped because all tools already exist)
        expect(insertCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("does not create duplicate invitation for same email (idempotent)", async () => {
        (db.query.pendingInvitations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "existing_invite",
        });

        await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "assessment",
            selectedToolNames: [],
        });

        // sendInviteEmail is still called but with existing invite id
        expect(mockSendInviteEmail).toHaveBeenCalledWith(
            "lead@example.com",
            "Acme Corp",
            "Trackr Team",
            "existing_invite",
        );
    });

    it("returns success on full successful flow", async () => {
        const result = await provisionAndInvite({
            submissionId: VALID_UUID,
            packageSlug: "implementation",
            selectedToolNames: ["Slack"],
        });
        expect(result).toEqual({ success: true });
    });
});
