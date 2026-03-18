import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/admin-auth", () => ({
    isAdminAuthenticated: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/email/resend", () => ({
    sendArchitectApproved: vi.fn().mockResolvedValue(undefined),
    sendArchitectRejected: vi.fn().mockResolvedValue(undefined),
}));

const { mockInsert, mockUpdate } = vi.hoisted(() => ({
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            architectApplications: { findFirst: vi.fn() },
        },
        insert: mockInsert.mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{
                    id: "arch_1",
                    email: "test@example.com",
                    firstName: "Jane",
                    lastName: "Doe",
                    role: "enterprise-growth-architect",
                    arcCode: "ABCD1234",
                }]),
            }),
        }),
        update: mockUpdate.mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            }),
        }),
    },
}));

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendArchitectApproved, sendArchitectRejected } from "@/lib/email/resend";
import { db } from "@/lib/db";
import {
    approveApplication,
    rejectApplication,
    pauseArchitect,
    terminateArchitect,
} from "../architects";

const MOCK_APPLICATION = {
    id: "app_1",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    roleSlug: "enterprise-growth-architect",
    status: "pending",
};

describe("approveApplication", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws when not admin authenticated", async () => {
        vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(false);
        await expect(approveApplication("app_1")).rejects.toThrow("Unauthorized");
    });

    it("throws when application not found", async () => {
        vi.mocked(db.query.architectApplications.findFirst).mockResolvedValueOnce(undefined);
        await expect(approveApplication("app_nonexistent")).rejects.toThrow("Application not found");
    });

    it("throws when application already reviewed", async () => {
        vi.mocked(db.query.architectApplications.findFirst).mockResolvedValueOnce({
            ...MOCK_APPLICATION,
            status: "approved",
        } as never);
        await expect(approveApplication("app_1")).rejects.toThrow("Application already reviewed");
    });

    it("throws when application was rejected", async () => {
        vi.mocked(db.query.architectApplications.findFirst).mockResolvedValueOnce({
            ...MOCK_APPLICATION,
            status: "rejected",
        } as never);
        await expect(approveApplication("app_1")).rejects.toThrow("Application already reviewed");
    });

    it("approves pending application, creates architect record, and sends email", async () => {
        vi.mocked(db.query.architectApplications.findFirst).mockResolvedValueOnce(MOCK_APPLICATION as never);

        const result = await approveApplication("app_1");

        expect(result).toBeDefined();
        expect(result.id).toBe("arch_1");
        expect(mockUpdate).toHaveBeenCalled();
        expect(mockInsert).toHaveBeenCalled();
        expect(sendArchitectApproved).toHaveBeenCalledWith(
            "jane@example.com",
            "Jane",
            expect.any(String), // arcCode
            expect.stringContaining("/architect/dashboard"),
        );
    });
});

describe("rejectApplication", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws when not admin authenticated", async () => {
        vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(false);
        await expect(rejectApplication("app_1")).rejects.toThrow("Unauthorized");
    });

    it("throws when application not found", async () => {
        vi.mocked(db.query.architectApplications.findFirst).mockResolvedValueOnce(undefined);
        await expect(rejectApplication("app_nonexistent")).rejects.toThrow("Application not found");
    });

    it("throws when application already reviewed", async () => {
        vi.mocked(db.query.architectApplications.findFirst).mockResolvedValueOnce({
            ...MOCK_APPLICATION,
            status: "approved",
        } as never);
        await expect(rejectApplication("app_1")).rejects.toThrow("Application already reviewed");
    });

    it("rejects pending application and sends rejection email", async () => {
        vi.mocked(db.query.architectApplications.findFirst).mockResolvedValueOnce(MOCK_APPLICATION as never);

        await rejectApplication("app_1", "Not a good fit");

        expect(mockUpdate).toHaveBeenCalled();
        expect(sendArchitectRejected).toHaveBeenCalledWith("jane@example.com", "Jane");
    });

    it("rejects without notes when none provided", async () => {
        vi.mocked(db.query.architectApplications.findFirst).mockResolvedValueOnce(MOCK_APPLICATION as never);

        await rejectApplication("app_1");

        expect(mockUpdate).toHaveBeenCalled();
        expect(sendArchitectRejected).toHaveBeenCalled();
    });
});

describe("pauseArchitect", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws when not admin authenticated", async () => {
        vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(false);
        await expect(pauseArchitect("arch_1")).rejects.toThrow("Unauthorized");
    });

    it("sets architect status to paused", async () => {
        await pauseArchitect("arch_1");
        expect(mockUpdate).toHaveBeenCalled();
    });
});

describe("terminateArchitect", () => {
    beforeEach(() => vi.clearAllMocks());

    it("throws when not admin authenticated", async () => {
        vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(false);
        await expect(terminateArchitect("arch_1")).rejects.toThrow("Unauthorized");
    });

    it("terminates architect and voids pending commissions", async () => {
        await terminateArchitect("arch_1");
        // Should call update twice: once for architect status, once for commissions
        expect(mockUpdate).toHaveBeenCalledTimes(2);
    });
});
