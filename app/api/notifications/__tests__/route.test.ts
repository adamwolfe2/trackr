import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/actions/notifications", () => ({
    getNotifications: vi.fn(),
    markNotificationsRead: vi.fn(),
}));

vi.mock("@/lib/middleware/rate-limit", () => ({
    rateLimit: vi.fn(),
    getRateLimitHeaders: vi.fn().mockReturnValue({}),
}));

import { currentUser } from "@clerk/nextjs/server";
import { getNotifications, markNotificationsRead } from "@/lib/actions/notifications";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { GET } from "../route";

const MOCK_USER = { id: "user_1" };

const RATE_LIMIT_OK = { success: true, limit: 60, remaining: 59, resetAt: Date.now() + 60000 };
const RATE_LIMIT_EXCEEDED = { success: false, limit: 60, remaining: 0, resetAt: Date.now() + 60000 };

const MOCK_NOTIFICATIONS = [
    {
        id: "job_1",
        type: "job_complete" as const,
        title: "Research Complete",
        message: "Linear analysis finished.",
        createdAt: new Date("2026-02-20"),
        read: false,
        link: "/tools/tool_1",
    },
    {
        id: "job_2",
        type: "job_failed" as const,
        title: "Research Failed",
        message: "HubSpot analysis failed.",
        createdAt: new Date("2026-02-19"),
        read: true,
        link: "/tools/tool_2",
    },
];

describe("GET /api/notifications", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue(RATE_LIMIT_OK);
    });

    it("returns 401 when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET();
        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toBe("Unauthorized");
    });

    it("returns 429 when rate limit exceeded", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue(RATE_LIMIT_EXCEEDED);
        const res = await GET();
        expect(res.status).toBe(429);
        const body = await res.json();
        expect(body.error).toBe("Too many requests");
    });

    it("returns 200 with notifications array for authenticated user", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getNotifications as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_NOTIFICATIONS);

        const res = await GET();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.notifications).toHaveLength(2);
        expect(body.notifications[0].type).toBe("job_complete");
    });

    it("returns empty notifications array when no notifications exist", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getNotifications as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const res = await GET();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.notifications).toEqual([]);
    });

    it("returns notification with correct shape (id, type, title, message, read, link)", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getNotifications as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_NOTIFICATIONS[0]]);

        const res = await GET();
        const body = await res.json();
        const n = body.notifications[0];
        expect(n).toMatchObject({
            id: "job_1",
            type: "job_complete",
            title: "Research Complete",
            read: false,
            link: "/tools/tool_1",
        });
    });
});

describe("POST /api/notifications/mark-all-read", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue(RATE_LIMIT_OK);
    });

    it("returns 401 when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const { POST } = await import("../mark-all-read/route");
        const res = await POST();
        expect(res.status).toBe(401);
    });

    it("returns 429 when rate limit exceeded", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue(RATE_LIMIT_EXCEEDED);
        const { POST } = await import("../mark-all-read/route");
        const res = await POST();
        expect(res.status).toBe(429);
        const body = await res.json();
        expect(body.error).toBe("Too many requests");
    });

    it("marks all unread notifications and returns count", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getNotifications as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_NOTIFICATIONS);
        (markNotificationsRead as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

        const { POST } = await import("../mark-all-read/route");
        const res = await POST();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.marked).toBe(2);
        expect(markNotificationsRead).toHaveBeenCalledWith(["job_1", "job_2"]);
    });

    it("returns marked: 0 and does not call markNotificationsRead when no notifications", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getNotifications as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const { POST } = await import("../mark-all-read/route");
        const res = await POST();
        const body = await res.json();
        expect(body.marked).toBe(0);
        expect(markNotificationsRead).not.toHaveBeenCalled();
    });
});

describe("PATCH /api/notifications/[id]/read", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue(RATE_LIMIT_OK);
    });

    it("returns 401 when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const { PATCH } = await import("../[id]/read/route");
        const res = await PATCH(new Request("http://localhost"), {
            params: Promise.resolve({ id: "job_1" }),
        });
        expect(res.status).toBe(401);
    });

    it("returns 429 when rate limit exceeded", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (rateLimit as ReturnType<typeof vi.fn>).mockReturnValue(RATE_LIMIT_EXCEEDED);
        const { PATCH } = await import("../[id]/read/route");
        const res = await PATCH(new Request("http://localhost"), {
            params: Promise.resolve({ id: "job_1" }),
        });
        expect(res.status).toBe(429);
        const body = await res.json();
        expect(body.error).toBe("Too many requests");
    });

    it("returns 400 for empty notification ID", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        const { PATCH } = await import("../[id]/read/route");
        const res = await PATCH(new Request("http://localhost"), {
            params: Promise.resolve({ id: "" }),
        });
        expect(res.status).toBe(400);
    });

    it("returns 400 for notification ID exceeding max length", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        const { PATCH } = await import("../[id]/read/route");
        const res = await PATCH(new Request("http://localhost"), {
            params: Promise.resolve({ id: "a".repeat(201) }),
        });
        expect(res.status).toBe(400);
    });

    it("marks notification read and returns success", async () => {
        const validId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (markNotificationsRead as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
        const { PATCH } = await import("../[id]/read/route");
        const res = await PATCH(new Request("http://localhost"), {
            params: Promise.resolve({ id: validId }),
        });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(markNotificationsRead).toHaveBeenCalledWith([validId]);
    });
});
