import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";

vi.mock("@/lib/db", () => ({
    db: {
        update: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args) };
});

import { db } from "@/lib/db";
import { GET } from "../route";

const APP_URL = "https://trytrackr.com";
const CLIENT_ID = "slack_client_id";
const CLIENT_SECRET = "slack_client_secret_abc";
const WORKSPACE_ID = "ws_abc";

/** Generate a valid signed state parameter for the test workspace */
function makeValidState(workspaceId: string = WORKSPACE_ID, secret: string = CLIENT_SECRET): string {
    const sig = createHmac("sha256", secret).update(workspaceId).digest("hex").slice(0, 32);
    return `${workspaceId}.${sig}`;
}

function makeRequest(params: Record<string, string> = {}): Request {
    const url = new URL("https://trytrackr.com/api/slack/callback");
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
    }
    return new Request(url.toString());
}

function setupDbUpdate() {
    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });
}

describe("GET /api/slack/callback", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        vi.resetAllMocks();
        setupDbUpdate();
        process.env.NEXT_PUBLIC_APP_URL = APP_URL;
        process.env.SLACK_CLIENT_ID = CLIENT_ID;
        process.env.SLACK_CLIENT_SECRET = CLIENT_SECRET;
    });

    afterEach(() => {
        process.env.NEXT_PUBLIC_APP_URL = originalEnv.NEXT_PUBLIC_APP_URL;
        process.env.SLACK_CLIENT_ID = originalEnv.SLACK_CLIENT_ID;
        process.env.SLACK_CLIENT_SECRET = originalEnv.SLACK_CLIENT_SECRET;
    });

    it("returns 500 when NEXT_PUBLIC_APP_URL is not set", async () => {
        delete process.env.NEXT_PUBLIC_APP_URL;
        const res = await GET(makeRequest({ code: "abc", state: makeValidState() }));
        expect(res.status).toBe(500);
    });

    it("redirects to /workspace?slack=denied when error param is present", async () => {
        const res = await GET(makeRequest({ error: "access_denied" }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=denied");
    });

    it("redirects to /workspace?slack=error when code is missing", async () => {
        const res = await GET(makeRequest({ state: makeValidState() }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=error");
    });

    it("redirects to /workspace?slack=error when state is missing", async () => {
        const res = await GET(makeRequest({ code: "some_code" }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=error");
    });

    it("redirects to /workspace?slack=error when state signature is invalid", async () => {
        const badState = `${WORKSPACE_ID}.badsignature1234567890123456`;
        const res = await GET(makeRequest({ code: "abc", state: badState }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=error");
    });

    it("redirects to /workspace?slack=error when state has no dot separator", async () => {
        const res = await GET(makeRequest({ code: "abc", state: "nodothere" }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=error");
    });

    it("redirects to /workspace?slack=error when SLACK_CLIENT_SECRET is missing", async () => {
        delete process.env.SLACK_CLIENT_SECRET;
        const res = await GET(makeRequest({ code: "abc", state: `${WORKSPACE_ID}.anything` }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=error");
    });

    it("redirects to /workspace?slack=error when Slack API returns ok: false", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ ok: false, error: "invalid_code" }),
        }));
        const res = await GET(makeRequest({ code: "badcode", state: makeValidState() }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=error");
        vi.unstubAllGlobals();
    });

    it("redirects to /workspace?slack=error when Slack API response has no access_token", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ ok: true, access_token: null }),
        }));
        const res = await GET(makeRequest({ code: "code123", state: makeValidState() }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=error");
        vi.unstubAllGlobals();
    });

    it("stores OAuth data and redirects to /workspace?slack=connected on success", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            json: () => Promise.resolve({
                ok: true,
                access_token: "xoxb-bot-token",
                team: { id: "T001", name: "Acme Inc" },
            }),
        }));
        const res = await GET(makeRequest({ code: "good_code", state: makeValidState() }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=connected");
        expect(db.update).toHaveBeenCalledTimes(1);
        vi.unstubAllGlobals();
    });

    it("sets slackEnabled: true and stores bot token on success", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            json: () => Promise.resolve({
                ok: true,
                access_token: "xoxb-real-token",
                team: { id: "T002", name: "Beta Corp" },
            }),
        }));
        await GET(makeRequest({ code: "good_code", state: makeValidState() }));
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.slackBotToken).toBe("xoxb-real-token");
        expect(setArgs.slackEnabled).toBe(true);
        expect(setArgs.slackTeamId).toBe("T002");
        vi.unstubAllGlobals();
    });

    it("redirects to /workspace?slack=error when fetch throws", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
        const res = await GET(makeRequest({ code: "abc", state: makeValidState() }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toContain("slack=error");
        vi.unstubAllGlobals();
    });
});
