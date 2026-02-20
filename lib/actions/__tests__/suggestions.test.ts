import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
        },
        update: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args), and: vi.fn((...args) => args) };
});

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { dismissSuggestion } from "../suggestions";

const MOCK_USER = { id: "user_1" };
const MOCK_MEMBER = { id: "mem_1", userId: "user_1", workspaceId: "ws_1" };

function setupDbChains() {
    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
}

describe("dismissSuggestion", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(dismissSuggestion("sug_1")).rejects.toThrow("Unauthorized");
    });

    it("throws when no workspace member found", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(dismissSuggestion("sug_1")).rejects.toThrow("No workspace");
    });

    it("calls db.update to set status to dismissed", async () => {
        await dismissSuggestion("sug_1");
        expect(db.update).toHaveBeenCalledTimes(1);
        const setCall = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setCall).toEqual({ status: "dismissed" });
    });
});
