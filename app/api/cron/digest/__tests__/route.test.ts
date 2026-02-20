import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.CRON_SECRET = "test_digest_secret_789";
process.env.RESEND_API_KEY = "test_resend_key";

// Hoist mocks that are referenced in vi.mock() factories
const {
    mockGetUser,
    mockEmailSend,
    mockSendRenewalAlertEmail,
    mockPostMessage,
    mockRenewalAlertBlocks,
} = vi.hoisted(() => ({
    mockGetUser: vi.fn(),
    mockEmailSend: vi.fn().mockResolvedValue({ id: "email_1" }),
    mockSendRenewalAlertEmail: vi.fn().mockResolvedValue(undefined),
    mockPostMessage: vi.fn().mockResolvedValue(undefined),
    mockRenewalAlertBlocks: vi.fn().mockReturnValue([]),
}));

vi.mock("@clerk/nextjs/server", () => ({
    clerkClient: vi.fn().mockResolvedValue({
        users: { getUser: mockGetUser },
    }),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: { findMany: vi.fn() },
            tools: { findMany: vi.fn() },
            softwareSpend: { findMany: vi.fn() },
            workspaces: { findFirst: vi.fn() },
        },
    },
}));

vi.mock("resend", () => ({
    Resend: function Resend() {
        return { emails: { send: mockEmailSend } };
    },
}));

vi.mock("@/lib/email/resend", () => ({
    sendRenewalAlertEmail: mockSendRenewalAlertEmail,
}));

vi.mock("@/lib/services/slack", () => ({
    postMessage: mockPostMessage,
    renewalAlertBlocks: mockRenewalAlertBlocks,
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args) => args),
        and: vi.fn((...args) => args),
        gte: vi.fn((...args) => args),
        lte: vi.fn((...args) => args),
        desc: vi.fn((...args) => args),
    };
});

import { db } from "@/lib/db";
import { GET } from "../route";

const VALID_AUTH = "Bearer test_digest_secret_789";

function makeRequest(authHeader?: string) {
    return {
        headers: { get: (key: string) => (key === "Authorization" ? (authHeader ?? null) : null) },
    } as unknown as Request;
}

const MOCK_OWNER = {
    userId: "user_1",
    workspaceId: "ws_1",
    workspace: { id: "ws_1", name: "Acme Inc" },
};

describe("GET /api/cron/digest", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        mockGetUser.mockResolvedValue({
            emailAddresses: [{ emailAddress: "owner@acme.com" }],
        });
    });

    it("returns 401 for missing Authorization header", async () => {
        const res = await GET(makeRequest());
        expect(res.status).toBe(401);
    });

    it("returns 401 for wrong Authorization secret", async () => {
        const res = await GET(makeRequest("Bearer wrong_secret_xyz"));
        expect(res.status).toBe(401);
    });

    it("returns 500 when RESEND_API_KEY is not set", async () => {
        const saved = process.env.RESEND_API_KEY;
        delete process.env.RESEND_API_KEY;
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Resend not configured");
        process.env.RESEND_API_KEY = saved;
    });

    it("returns success with zero counts when no workspace owners exist", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.digestsSent).toBe(0);
        expect(body.renewalsSent).toBe(0);
    });

    it("skips owners without an email address and sends no digest", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        mockGetUser.mockResolvedValue({ emailAddresses: [] }); // no email

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.digestsSent).toBe(0);
        expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it("sends a digest email when owner has recent tools researched", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { name: "Linear", overallScore: "9.1", lastResearchedAt: new Date() },
            { name: "Notion", overallScore: null, lastResearchedAt: new Date() },
        ]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.digestsSent).toBe(1);
        expect(mockEmailSend).toHaveBeenCalledTimes(1);
        const emailCall = mockEmailSend.mock.calls[0][0];
        expect(emailCall.to).toBe("owner@acme.com");
        expect(emailCall.subject).toContain("2 tools researched");
    });

    it("sends a renewal alert when upcoming renewals exist", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { toolName: "Salesforce", renewalDate: new Date(), monthlyCost: "500" },
        ]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.renewalsSent).toBe(1);
        expect(mockSendRenewalAlertEmail).toHaveBeenCalledWith("owner@acme.com", expect.any(Array));
    });

    it("also posts to Slack when workspace has Slack enabled", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { toolName: "HubSpot", renewalDate: new Date(), monthlyCost: "200" },
        ]);
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "ws_1",
            slackEnabled: true,
            slackChannelId: "C001",
            slackBotToken: "xoxb-token",
        });

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        expect(mockPostMessage).toHaveBeenCalledWith(
            "C001",
            expect.stringContaining("upcoming renewal"),
            expect.any(Array),
            "xoxb-token"
        );
    });

    it("does not post to Slack when workspace has Slack disabled", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { toolName: "Zoom", renewalDate: new Date(), monthlyCost: "50" },
        ]);
        (db.query.workspaces.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "ws_1",
            slackEnabled: false,
            slackChannelId: null,
            slackBotToken: null,
        });

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        expect(mockPostMessage).not.toHaveBeenCalled();
    });
});
