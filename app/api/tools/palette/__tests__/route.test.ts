import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findFirst: vi.fn() },
            tools: { findMany: vi.fn() },
        },
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args), and: vi.fn((...args) => args), ne: vi.fn((...args) => args), sql: vi.fn((...args) => args) };
});

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GET } from "../route";

const MOCK_MEMBER = { id: "mem_1", workspaceId: "ws_1", userId: "usr_1" };

const MOCK_TOOLS = [
    { id: "t1", name: "Notion", overallScore: "9.2", status: "active", websiteUrl: "https://notion.so" },
    { id: "t2", name: "Linear", overallScore: "8.8", status: "active", websiteUrl: "https://linear.app" },
    { id: "t3", name: "Figma", overallScore: null, status: "queued", websiteUrl: "https://figma.com" },
];

describe("GET /api/tools/palette", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "usr_1" });
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_TOOLS);
    });

    it("returns 401 when user is not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET();
        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toBe("Unauthorized");
    });

    it("returns 403 when user has no workspace", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET();
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toBe("No workspace found");
    });

    it("returns 200 with tools array for authenticated user", async () => {
        const res = await GET();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty("tools");
        expect(Array.isArray(body.tools)).toBe(true);
    });

    it("returns correct tool shape with name, score, status, and websiteUrl", async () => {
        const res = await GET();
        const body = await res.json();
        const tool = body.tools[0];
        expect(tool).toHaveProperty("id");
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("overallScore");
        expect(tool).toHaveProperty("status");
        expect(tool).toHaveProperty("websiteUrl");
    });

    it("returns all tools from the mock (up to limit)", async () => {
        const res = await GET();
        const body = await res.json();
        expect(body.tools).toHaveLength(3);
    });

    it("includes tools with null overallScore", async () => {
        const res = await GET();
        const body = await res.json();
        const unscored = body.tools.find((t: { name: string }) => t.name === "Figma");
        expect(unscored).toBeDefined();
        expect(unscored.overallScore).toBeNull();
    });

    it("handles empty workspace gracefully", async () => {
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const res = await GET();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.tools).toHaveLength(0);
    });
});
