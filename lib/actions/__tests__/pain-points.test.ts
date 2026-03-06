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
import { addPainPoint, deletePainPoint, batchAddPainPoints, updatePainPoint, togglePainPointActive } from "../pain-points";

const MOCK_USER = { id: "user_1" };

function setupDbChains() {
    const insertValues = vi.fn().mockResolvedValue({});
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    const deleteWhere = vi.fn().mockResolvedValue({});
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: deleteWhere });

    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
}

describe("addPainPoint", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(addPainPoint(new FormData())).rejects.toThrow("Unauthorized");
    });

    it("throws when no workspace found", async () => {
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(addPainPoint(new FormData())).rejects.toThrow("No workspace found");
    });

    it("throws when title is empty", async () => {
        const fd = new FormData();
        fd.set("title", "");
        await expect(addPainPoint(fd)).rejects.toThrow("Title is required");
    });

    it("throws when title exceeds 200 characters", async () => {
        const fd = new FormData();
        fd.set("title", "x".repeat(201));
        await expect(addPainPoint(fd)).rejects.toThrow("Title too long");
    });

    it("succeeds with valid title", async () => {
        const fd = new FormData();
        fd.set("title", "Slow onboarding process");
        fd.set("description", "");
        fd.set("category", "");
        const result = await addPainPoint(fd);
        expect(result).toEqual({ success: true });
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it("defaults category to 'General' when not provided", async () => {
        const fd = new FormData();
        fd.set("title", "Some pain point");
        fd.set("description", "");
        fd.set("category", ""); // empty → action defaults to "General"
        await addPainPoint(fd);
        const insertedValues = (
            (db.insert as ReturnType<typeof vi.fn>).mock.results[0].value.values as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(insertedValues.category).toBe("General");
    });

    it("uses provided category when valid", async () => {
        const fd = new FormData();
        fd.set("title", "Issue");
        fd.set("description", "");
        fd.set("category", "Engineering");
        await addPainPoint(fd);
        const insertedValues = (
            (db.insert as ReturnType<typeof vi.fn>).mock.results[0].value.values as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(insertedValues.category).toBe("Engineering");
    });
});

describe("deletePainPoint", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(deletePainPoint("550e8400-e29b-41d4-a716-446655440001")).rejects.toThrow("Unauthorized");
    });

    it("throws when no workspace found", async () => {
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(deletePainPoint("550e8400-e29b-41d4-a716-446655440001")).rejects.toThrow("No workspace found");
    });

    it("throws for invalid (non-UUID) id", async () => {
        await expect(deletePainPoint("pp_1")).rejects.toThrow("Invalid pain point ID");
    });

    it("calls db.delete for valid request", async () => {
        await deletePainPoint("550e8400-e29b-41d4-a716-446655440001");
        expect(db.delete).toHaveBeenCalledTimes(1);
    });
});

describe("batchAddPainPoints", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(batchAddPainPoints([{ title: "A" }])).rejects.toThrow("Unauthorized");
    });

    it("throws when batch exceeds 100 items", async () => {
        const items = Array.from({ length: 101 }, (_, i) => ({ title: `Pain ${i}` }));
        await expect(batchAddPainPoints(items)).rejects.toThrow("Batch size limit exceeded");
    });

    it("throws when no valid titles", async () => {
        await expect(batchAddPainPoints([{ title: "" }, { title: "  " }])).rejects.toThrow("No valid pain points");
    });

    it("returns count of inserted items", async () => {
        const result = await batchAddPainPoints([{ title: "A" }, { title: "B" }]);
        expect(result).toEqual({ success: true, count: 2 });
    });

    it("filters out blank titles in a mixed batch", async () => {
        const result = await batchAddPainPoints([
            { title: "Valid" },
            { title: "" },
            { title: "Also Valid" },
        ]);
        expect(result.count).toBe(2);
    });
});

describe("updatePainPoint", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(updatePainPoint("00000000-0000-0000-0000-000000000001", { title: "Updated" })).rejects.toThrow("Unauthorized");
    });

    it("throws when title is empty", async () => {
        await expect(updatePainPoint("00000000-0000-0000-0000-000000000001", { title: "" })).rejects.toThrow("Title is required");
    });

    it("returns success for valid update", async () => {
        const result = await updatePainPoint("00000000-0000-0000-0000-000000000001", { title: "Better title" });
        expect(result).toEqual({ success: true });
        expect(db.update).toHaveBeenCalledTimes(1);
    });
});

describe("togglePainPointActive", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(togglePainPointActive("pp_1", true)).rejects.toThrow("Unauthorized");
    });

    it("calls db.update when toggling", async () => {
        await togglePainPointActive("pp_1", true);
        expect(db.update).toHaveBeenCalledTimes(1);
    });
});
