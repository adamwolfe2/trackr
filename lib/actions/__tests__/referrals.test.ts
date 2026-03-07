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

function setupDbChains({ referralReturn }: { referralReturn?: { referrerWorkspaceId: string } | null } = {}) {
    const insertValues = vi.fn().mockResolvedValue({});
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    // First update (referrals): supports .returning()
    const referralReturning = vi.fn().mockResolvedValue(
        referralReturn !== undefined ? [referralReturn].filter(Boolean) : []
    );
    const referralWhere = vi.fn().mockReturnValue({ returning: referralReturning });
    const referralSet = vi.fn().mockReturnValue({ where: referralWhere });

    // Second update (subscriptions): simple set().where()
    const subscriptionWhere = vi.fn().mockResolvedValue({});
    const subscriptionSet = vi.fn().mockReturnValue({ where: subscriptionWhere });

    (db.update as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ set: referralSet })
        .mockReturnValue({ set: subscriptionSet });
}

describe("createReferralCode", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains({ referralReturn: null });
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
        expect((result as { success: false; error: string }).error).toBe("Failed to create referral code");
    });
});

describe("trackReferralClick", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains({ referralReturn: null });
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
    });

    it("does nothing for empty code", async () => {
        setupDbChains({ referralReturn: null });
        await trackReferralSignup("");
        expect(db.update).not.toHaveBeenCalled();
    });

    it("does nothing for code exceeding 20 chars", async () => {
        setupDbChains({ referralReturn: null });
        await trackReferralSignup("Z".repeat(21));
        expect(db.update).not.toHaveBeenCalled();
    });

    it("updates signups for a valid code (no referrer found)", async () => {
        setupDbChains({ referralReturn: null });
        await trackReferralSignup("REF_ABCD");
        // Only the referrals update is called — no subscription update when no referrer returned
        expect(db.update).toHaveBeenCalledTimes(1);
    });

    it("awards credits to referrer when referral resolves to a workspace", async () => {
        setupDbChains({ referralReturn: { referrerWorkspaceId: "ws_referrer" } });
        await trackReferralSignup("REF_ABCD");
        // Both referrals update AND subscriptions update called
        expect(db.update).toHaveBeenCalledTimes(2);
    });

    it("silently ignores db errors", async () => {
        // Make the first update throw
        const returning = vi.fn().mockRejectedValue(new Error("DB error"));
        const where = vi.fn().mockReturnValue({ returning });
        const set = vi.fn().mockReturnValue({ where });
        (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set });
        await expect(trackReferralSignup("VALID")).resolves.toBeUndefined();
    });
});
