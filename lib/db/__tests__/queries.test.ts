import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
        },
    },
}));

import { db } from "@/lib/db";
import { getWorkspaceId } from "../queries";

describe("getWorkspaceId", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the workspaceId for a known user", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "mem_1",
            userId: "usr_1",
            workspaceId: "ws_1",
        });

        const result = await getWorkspaceId("usr_1");
        expect(result).toBe("ws_1");
    });

    it("returns undefined when user has no workspace membership", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        const result = await getWorkspaceId("usr_unknown");
        expect(result).toBeUndefined();
    });

    it("queries by the provided userId", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "mem_2",
            userId: "usr_2",
            workspaceId: "ws_2",
        });

        const result = await getWorkspaceId("usr_2");
        expect(db.query.workspaceMembers.findFirst).toHaveBeenCalledTimes(1);
        expect(result).toBe("ws_2");
    });
});
