import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}));

vi.mock("next/server", () => ({
    after: vi.fn((fn: () => void) => fn()), // execute immediately for testability
}));

vi.mock("@/lib/db/queries", () => ({
    getWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/db/ensure-workspace", () => ({
    ensureWorkspace: vi.fn().mockResolvedValue({ workspaceId: "ws_1" }),
}));

vi.mock("@/lib/actions/research", () => ({
    performDeepResearch: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            tools: { findFirst: vi.fn() },
            reports: { findFirst: vi.fn() },
        },
        insert: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        transaction: vi.fn(),
        select: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args), and: vi.fn((...args) => args), count: vi.fn(() => "count") };
});

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { deleteTool, updateToolStatus, publishReport } from "../tools";

const MOCK_USER = { id: "user_1" };
const MOCK_TOOL = { id: "tool_1", workspaceId: "ws_1", name: "Linear", publicSlug: null };
const MOCK_REPORT = { id: "report_1", toolId: "tool_1" };

// Shared helper — referenced from both describe blocks
function setupDbChains() {
    // update chain
    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });

    // insert chain
    const insertValues = vi.fn().mockResolvedValue({});
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    // delete chain
    const deleteWhere = vi.fn().mockResolvedValue({});
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: deleteWhere });

    // transaction — run callback immediately
    (db.transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => {
        const tx = {
            delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue({}) }),
            update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue({}) }) }),
            insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue({}) }),
        };
        return fn(tx);
    });
}

describe("tools server actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_TOOL);
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_REPORT);
    });

    describe("deleteTool", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(deleteTool("tool_1")).rejects.toThrow("Unauthorized");
        });

        it("throws when no workspace found", async () => {
            (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(deleteTool("tool_1")).rejects.toThrow("No workspace found");
        });

        it("throws when tool is not found or belongs to another workspace", async () => {
            (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(deleteTool("tool_1")).rejects.toThrow("Tool not found or unauthorized");
        });

        it("runs deletion in a transaction and returns success", async () => {
            const result = await deleteTool("tool_1");
            expect(result).toEqual({ success: true });
            expect(db.transaction).toHaveBeenCalledTimes(1);
        });
    });

    describe("updateToolStatus", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(updateToolStatus("tool_1", "active")).rejects.toThrow("Unauthorized");
        });

        it("throws for invalid status value", async () => {
            await expect(updateToolStatus("tool_1", "deleted")).rejects.toThrow("Invalid status");
        });

        it("accepts all valid status values", async () => {
            const validStatuses = ["queued", "researching", "active", "failed", "paused", "archived"];
            for (const status of validStatuses) {
                vi.resetAllMocks();
                setupDbChains();
                (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
                (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
                const result = await updateToolStatus("tool_1", status);
                expect(result).toEqual({ success: true });
            }
        });

        it("returns success for valid status update", async () => {
            const result = await updateToolStatus("tool_1", "archived");
            expect(result).toEqual({ success: true });
        });
    });

    describe("publishReport", () => {
        it("throws Unauthorized when not logged in", async () => {
            (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(publishReport("report_1")).rejects.toThrow("Unauthorized");
        });

        it("throws when report is not found", async () => {
            (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(publishReport("report_1")).rejects.toThrow("Report not found");
        });

        it("throws when tool is not in the user's workspace", async () => {
            (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            await expect(publishReport("report_1")).rejects.toThrow("Tool not found or not in your workspace");
        });

        it("toggles off (unpublishes) when tool already has a publicSlug", async () => {
            (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                ...MOCK_TOOL,
                publicSlug: "linear",
            });
            const result = await publishReport("report_1");
            expect(result.published).toBe(false);
            expect(result.slug).toBeNull();
        });

        it("publishes the report and returns slug when tool has no publicSlug", async () => {
            // findFirst for slug uniqueness check returns null (slug is available)
            (db.query.tools.findFirst as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce(MOCK_TOOL)   // tool ownership check
                .mockResolvedValueOnce(null);         // slug uniqueness check (no collision)
            const result = await publishReport("report_1");
            expect(result.published).toBe(true);
            expect(typeof result.slug).toBe("string");
            expect(result.slug).toMatch(/^linear/); // slug derived from tool name
        });
    });
});

describe("slugify (via publishReport behavior)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        (db.query.reports.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_REPORT);
    });

    it("converts tool name to lowercase slug with dashes", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce({ ...MOCK_TOOL, name: "HubSpot CRM", publicSlug: null })
            .mockResolvedValueOnce(null); // slug available
        const result = await publishReport("report_1");
        expect(result.slug).toBe("hubspot-crm");
    });

    it("appends -2 when base slug is taken", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce({ ...MOCK_TOOL, name: "Notion", publicSlug: null })
            .mockResolvedValueOnce({ id: "other_tool" }) // "notion" is taken
            .mockResolvedValueOnce(null);                 // "notion-2" is available
        const result = await publishReport("report_1");
        expect(result.slug).toBe("notion-2");
    });
});

