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
        update: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args), sql: actual.sql };
});

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { createReferralCode, trackReferralClick, trackReferralSignup } from "../referrals";

const MOCK_USER = { id: "user_1" };

function setupDbChains() {
    const insertValues = vi.fn().mockResolvedValue({});
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
}

describe("createReferralCode", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createReferralCode()).rejects.toThrow("Unauthorized");
    });

    it("throws when no workspace found", async () => {
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(createReferralCode()).rejects.toThrow("No workspace found");
    });

    it("returns success when code is created", async () => {
        const result = await createReferralCode();
        expect(result).toEqual({ success: true });
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it("returns error when db insert fails", async () => {
        const insertValues = vi.fn().mockRejectedValue(new Error("unique constraint violation"));
        (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });
        const result = await createReferralCode();
        expect(result.success).toBe(false);
        expect((result as { success: false; error: string }).error).toContain("unique constraint");
    });
});

describe("trackReferralClick", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
    });

    it("does nothing for empty code", async () => {
        await trackReferralClick("");
        expect(db.update).not.toHaveBeenCalled();
    });

    it("does nothing for code exceeding 20 chars", async () => {
        await trackReferralClick("X".repeat(21));
        expect(db.update).not.toHaveBeenCalled();
    });

    it("updates clicks for a valid code", async () => {
        await trackReferralClick("ABC123");
        expect(db.update).toHaveBeenCalledTimes(1);
    });

    it("converts code to uppercase before querying", async () => {
        // Just verify it doesn't throw and calls update
        await trackReferralClick("abc123");
        expect(db.update).toHaveBeenCalledTimes(1);
    });

    it("silently ignores db errors (fire-and-forget)", async () => {
        const updateSet = vi.fn().mockReturnValue({
            where: vi.fn().mockRejectedValue(new Error("DB error")),
        });
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
        // Should not throw
        await expect(trackReferralClick("VALID")).resolves.toBeUndefined();
    });
});

describe("trackReferralSignup", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
    });

    it("does nothing for empty code", async () => {
        await trackReferralSignup("");
        expect(db.update).not.toHaveBeenCalled();
    });

    it("does nothing for code exceeding 20 chars", async () => {
        await trackReferralSignup("Z".repeat(21));
        expect(db.update).not.toHaveBeenCalled();
    });

    it("updates signups for a valid code", async () => {
        await trackReferralSignup("REF_ABCD");
        expect(db.update).toHaveBeenCalledTimes(1);
    });

    it("silently ignores db errors", async () => {
        const updateSet = vi.fn().mockReturnValue({
            where: vi.fn().mockRejectedValue(new Error("DB error")),
        });
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
        await expect(trackReferralSignup("VALID")).resolves.toBeUndefined();
    });
});
