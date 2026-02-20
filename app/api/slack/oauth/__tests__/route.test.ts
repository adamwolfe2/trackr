import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
    getWorkspaceId: vi.fn(),
}));

import { currentUser } from "@clerk/nextjs/server";
import { getWorkspaceId } from "@/lib/db/queries";
import { GET } from "../route";

const MOCK_USER = { id: "user_1" };

describe("GET /api/slack/oauth", () => {
    const originalClientId = process.env.SLACK_CLIENT_ID;
    const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const originalSecret = process.env.SLACK_CLIENT_SECRET;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SLACK_CLIENT_ID = "test_slack_client_id";
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
        process.env.SLACK_CLIENT_SECRET = "test_slack_secret";
    });

    afterEach(() => {
        process.env.SLACK_CLIENT_ID = originalClientId;
        process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
        process.env.SLACK_CLIENT_SECRET = originalSecret;
    });

    it("returns 401 when not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET();
        expect(res.status).toBe(401);
    });

    it("returns 400 when no workspace found", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await GET();
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("No workspace found");
    });

    it("returns 500 when Slack OAuth env vars are not configured", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_1");
        delete process.env.SLACK_CLIENT_ID;

        const res = await GET();
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Slack OAuth not configured");
    });

    it("redirects to Slack authorize URL with correct parameters", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_abc");

        const res = await GET();
        // NextResponse.redirect returns 307 by default
        expect(res.status).toBe(307);
        const location = res.headers.get("location");
        expect(location).toContain("slack.com/oauth/v2/authorize");
        expect(location).toContain("client_id=test_slack_client_id");
        expect(location).toContain("scope=channels%3Aread%2Cchat%3Awrite%2Ccommands");
        expect(location).toContain("redirect_uri=https%3A%2F%2Ftrytrackr.com%2Fapi%2Fslack%2Fcallback");
    });

    it("embeds workspaceId in the state parameter", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (getWorkspaceId as ReturnType<typeof vi.fn>).mockResolvedValue("ws_abc");

        const res = await GET();
        const location = res.headers.get("location");
        const url = new URL(location!);
        const state = url.searchParams.get("state");
        // State format is: workspaceId.signature
        expect(state).toMatch(/^ws_abc\.[a-f0-9]{32}$/);
    });
});
