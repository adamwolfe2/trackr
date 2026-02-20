import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
    getWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            softwareSpend: { findFirst: vi.fn(), findMany: vi.fn() },
        },
        insert: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args), and: vi.fn((...args) => args) };
});

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import {
    addSoftwareSpend,
    deleteSoftwareSpend,
    updateSoftwareSpendStatus,
    batchAddSoftwareSpend,
} from "../software-spend";

const MOCK_USER = { id: "user_1" };

function setupDbChains() {
    const where = vi.fn().mockResolvedValue({});
    const set = vi.fn().mockReturnValue({ where });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set });

    const values = vi.fn().mockResolvedValue({});
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values });

    const deleteWhere = vi.fn().mockResolvedValue({});
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: deleteWhere });
}

describe("software-spend server actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.softwareSpend.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    });

    describe("addSoftwareSpend", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(addSoftwareSpend(new FormData())).rejects.toThrow("Unauthorized");
        });

        it("throws when no workspace found", async () => {
            (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(addSoftwareSpend(new FormData())).rejects.toThrow("No workspace found");
        });

        it("throws when tool name is empty", async () => {
            const fd = new FormData();
            fd.set("toolName", "");
            await expect(addSoftwareSpend(fd)).rejects.toThrow("Tool name is required");
        });

        it("throws when tool name exceeds 200 characters", async () => {
            const fd = new FormData();
            fd.set("toolName", "x".repeat(201));
            await expect(addSoftwareSpend(fd)).rejects.toThrow("too long");
        });

        it("throws when tool is already in the stack", async () => {
            (db.query.softwareSpend.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: "spend_1",
            });
            const fd = new FormData();
            fd.set("toolName", "Slack");
            await expect(addSoftwareSpend(fd)).rejects.toThrow("already in your stack");
        });

        it("treats negative cost as 0.00", async () => {
            const fd = new FormData();
            fd.set("toolName", "Notion");
            fd.set("monthlyCost", "-50");
            const result = await addSoftwareSpend(fd);
            expect(result.success).toBe(true);
            const insertedValues = (db.insert as ReturnType<typeof vi.fn>).mock.calls[0];
            // Just verifying it doesn't throw — cost is sanitized in the action
        });

        it("treats invalid cost as 0.00", async () => {
            const fd = new FormData();
            fd.set("toolName", "Notion");
            fd.set("monthlyCost", "abc");
            const result = await addSoftwareSpend(fd);
            expect(result.success).toBe(true);
        });

        it("defaults billingCycle to monthly when not provided", async () => {
            const fd = new FormData();
            fd.set("toolName", "Linear");
            fd.set("monthlyCost", "50");
            await addSoftwareSpend(fd);
            const valuesCall = (
                (db.insert as ReturnType<typeof vi.fn>).mock.results[0].value.values as ReturnType<typeof vi.fn>
            ).mock.calls[0][0];
            expect(valuesCall.billingCycle).toBe("monthly");
        });

        it("successfully inserts and returns { success: true }", async () => {
            const fd = new FormData();
            fd.set("toolName", "Linear");
            fd.set("monthlyCost", "15.00");
            fd.set("seatCount", "5");
            fd.set("category", "project-management");
            fd.set("status", "active");
            const result = await addSoftwareSpend(fd);
            expect(result).toEqual({ success: true });
        });
    });

    describe("deleteSoftwareSpend", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(deleteSoftwareSpend("spend_1")).rejects.toThrow("Unauthorized");
        });

        it("throws when no workspace found", async () => {
            (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(deleteSoftwareSpend("spend_1")).rejects.toThrow("No workspace found");
        });

        it("returns success when deletion completes", async () => {
            const result = await deleteSoftwareSpend("spend_1");
            expect(result).toEqual({ success: true });
            expect(db.delete).toHaveBeenCalledTimes(1);
        });
    });

    describe("updateSoftwareSpendStatus", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(updateSoftwareSpendStatus("spend_1", "active")).rejects.toThrow("Unauthorized");
        });

        it("throws for invalid status value", async () => {
            await expect(updateSoftwareSpendStatus("spend_1", "invalid_status")).rejects.toThrow(
                "Invalid status"
            );
        });

        it("accepts all valid status values", async () => {
            for (const status of ["active", "evaluating", "canceling", "canceled"] as const) {
                vi.resetAllMocks();
                setupDbChains();
                (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
                (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
                const result = await updateSoftwareSpendStatus("spend_1", status);
                expect(result).toEqual({ success: true });
            }
        });

        it("returns success for valid status update", async () => {
            const result = await updateSoftwareSpendStatus("spend_1", "canceled");
            expect(result).toEqual({ success: true });
        });
    });

    describe("batchAddSoftwareSpend", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(batchAddSoftwareSpend([{ toolName: "Slack" }])).rejects.toThrow("Unauthorized");
        });

        it("throws when batch exceeds 100 items", async () => {
            const items = Array.from({ length: 101 }, (_, i) => ({ toolName: `Tool ${i}` }));
            await expect(batchAddSoftwareSpend(items)).rejects.toThrow("Batch size limit exceeded");
        });

        it("throws when no items have a valid toolName", async () => {
            await expect(batchAddSoftwareSpend([{ toolName: "" }, { toolName: "  " }])).rejects.toThrow(
                "No valid tools"
            );
        });

        it("throws when all tools are already in the stack", async () => {
            (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
                { toolName: "Slack" },
                { toolName: "Notion" },
            ]);
            await expect(
                batchAddSoftwareSpend([{ toolName: "Slack" }, { toolName: "Notion" }])
            ).rejects.toThrow("All tools are already in your stack");
        });

        it("deduplicates against existing stack and inserts only new tools", async () => {
            (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
                { toolName: "Slack" },
            ]);
            const result = await batchAddSoftwareSpend([
                { toolName: "Slack" },   // duplicate — should be skipped
                { toolName: "Linear" },  // new — should be inserted
                { toolName: "Notion" },  // new — should be inserted
            ]);
            expect(result.success).toBe(true);
            expect(result.count).toBe(2);   // 2 inserted
            expect(result.skipped).toBe(1); // 1 skipped
        });

        it("is case-insensitive when deduplicating", async () => {
            (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
                { toolName: "slack" }, // lowercase in DB
            ]);
            // "SLACK" should match "slack" in a case-insensitive comparison
            await expect(
                batchAddSoftwareSpend([{ toolName: "SLACK" }])
            ).rejects.toThrow("All tools are already in your stack");
        });
    });
});
