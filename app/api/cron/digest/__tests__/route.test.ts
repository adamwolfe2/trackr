import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.CRON_SECRET = "test_digest_secret_789";
process.env.RESEND_API_KEY = "test_resend_key";

// Hoist mocks that are referenced in vi.mock() factories
const {
    mockGetUser,
    mockEmailSend,
    mockSendRenewalAlertEmail,
    mockSendStackHealthDigest,
    mockSendWeeklyDigestEmail,
    mockPostMessage,
    mockRenewalAlertBlocks,
    mockComputeStackInsights,
    mockSelectChain,
} = vi.hoisted(() => {
    const makeGroupBy = () => ({ groupBy: vi.fn().mockResolvedValue([]) });
    const selectChain = {
        from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue(makeGroupBy()),
            }),
            where: vi.fn().mockReturnValue(makeGroupBy()),
        }),
    };
    return {
        mockGetUser: vi.fn(),
        mockEmailSend: vi.fn().mockResolvedValue({ id: "email_1" }),
        mockSendRenewalAlertEmail: vi.fn().mockResolvedValue(undefined),
        mockSendStackHealthDigest: vi.fn().mockResolvedValue(undefined),
        mockPostMessage: vi.fn().mockResolvedValue(undefined),
        mockRenewalAlertBlocks: vi.fn().mockReturnValue([]),
        mockSendWeeklyDigestEmail: vi.fn().mockResolvedValue(undefined),
        mockComputeStackInsights: vi.fn().mockReturnValue({
            score: 60,
            label: "Mixed",
            totalActiveSpend: 5000,
            aiNativeCount: 2,
            aiEnabledCount: 3,
            traditionalCount: 4,
            unknownCount: 0,
            timeSavedPerMonth: 10,
            dollarValueSaved: 800,
            opportunities: [],
            enrichedTools: [],
        }),
        mockSelectChain: selectChain,
    };
});

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
            subscriptions: { findMany: vi.fn().mockResolvedValue([]) },
        },
        select: vi.fn().mockReturnValue(mockSelectChain),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        }),
    },
}));

vi.mock("resend", () => ({
    Resend: function Resend() {
        return { emails: { send: mockEmailSend } };
    },
}));

vi.mock("@/lib/email/resend", () => ({
    sendRenewalAlertEmail: mockSendRenewalAlertEmail,
    sendStackHealthDigest: mockSendStackHealthDigest,
    sendWeeklyDigestEmail: mockSendWeeklyDigestEmail,
    getResend: vi.fn().mockReturnValue({ emails: { send: mockEmailSend } }),
    emailWrapper: vi.fn((html: string) => html),
    emailButton: vi.fn((_url: string, text: string) => text),
    escapeHtml: vi.fn((s: string) => s),
}));

vi.mock("@/lib/utils/stack-insights", () => ({
    computeStackInsights: mockComputeStackInsights,
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
        sql: vi.fn((...args) => args),
        inArray: vi.fn((...args) => args),
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
    workspace: { id: "ws_1", name: "Acme Inc", currentStreak: 3, longestStreak: 5 },
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
        expect(mockSendWeeklyDigestEmail).not.toHaveBeenCalled();
    });

    it("sends a digest email when owner has recent tools researched", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { name: "Linear", overallScore: "9.1", lastResearchedAt: new Date(), workspaceId: "ws_1" },
            { name: "Notion", overallScore: null, lastResearchedAt: new Date(), workspaceId: "ws_1" },
        ]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.digestsSent).toBe(1);
        expect(mockSendWeeklyDigestEmail).toHaveBeenCalledTimes(1);
        const emailCall = mockSendWeeklyDigestEmail.mock.calls[0][0];
        expect(emailCall.email).toBe("owner@acme.com");
        expect(emailCall.toolsResearched).toBe(2);
    });

    it("sends a renewal alert when upcoming renewals exist", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { toolName: "Salesforce", renewalDate: new Date(), monthlyCost: "500", workspaceId: "ws_1", status: "active" },
        ]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.renewalsSent).toBe(1);
        expect(mockSendRenewalAlertEmail).toHaveBeenCalledWith("owner@acme.com", expect.any(Array));
    });

    it("also posts to Slack when workspace has Slack enabled", async () => {
        const slackOwner = {
            ...MOCK_OWNER,
            workspace: { ...MOCK_OWNER.workspace, slackEnabled: true, slackChannelId: "C001", slackBotToken: "xoxb-token" },
        };
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([slackOwner]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { toolName: "HubSpot", renewalDate: new Date(), monthlyCost: "200", workspaceId: "ws_1", status: "active" },
        ]);

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
        const noSlackOwner = {
            ...MOCK_OWNER,
            workspace: { ...MOCK_OWNER.workspace, slackEnabled: false, slackChannelId: null, slackBotToken: null },
        };
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([noSlackOwner]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { toolName: "Zoom", renewalDate: new Date(), monthlyCost: "50", workspaceId: "ws_1", status: "active" },
        ]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it("sends stack health digest when workspace has spend data", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "sp_1", toolName: "Slack", status: "active", monthlyCost: "100", renewalDate: null, workspaceId: "ws_1", createdAt: new Date() },
        ]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.stackDigestsSent).toBe(1);
        expect(mockSendStackHealthDigest).toHaveBeenCalledWith("owner@acme.com", expect.objectContaining({
            workspaceName: "Acme Inc",
            totalMonthlySpend: expect.any(Number),
            aiScore: expect.any(Number),
        }));
    });

    it("does not send stack health digest when workspace has no spend data", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.stackDigestsSent).toBe(0);
        expect(mockSendStackHealthDigest).not.toHaveBeenCalled();
    });

    it("includes streak in stack health digest", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "sp_1", toolName: "Notion", status: "active", monthlyCost: "50", renewalDate: null, workspaceId: "ws_1", createdAt: new Date() },
        ]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        expect(mockSendStackHealthDigest).toHaveBeenCalledWith("owner@acme.com", expect.objectContaining({
            currentStreak: expect.any(Number),
        }));
    });

    it("returns stackDigestsSent count in response", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const res = await GET(makeRequest(VALID_AUTH));
        const body = await res.json();
        expect(body).toHaveProperty("stackDigestsSent");
        expect(typeof body.stackDigestsSent).toBe("number");
    });

    it("passes a positive spendDelta when spend was added this week", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        // One old entry ($200/mo) + one new entry ($100/mo added today)
        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "sp_old", toolName: "Salesforce", status: "active", monthlyCost: "200", renewalDate: null, workspaceId: "ws_1", createdAt: tenDaysAgo },
            { id: "sp_new", toolName: "Linear", status: "active", monthlyCost: "100", renewalDate: null, workspaceId: "ws_1", createdAt: new Date() },
        ]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        expect(mockSendStackHealthDigest).toHaveBeenCalledWith("owner@acme.com", expect.objectContaining({
            spendDelta: expect.any(Number),
        }));
        // spendDelta should be positive (new spend added this week)
        const callArg = mockSendStackHealthDigest.mock.calls[0][1] as { spendDelta: number };
        expect(callArg.spendDelta).toBeGreaterThan(0);
    });

    it("passes zero spendDelta when no new spend was added this week", async () => {
        (db.query.workspaceMembers.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_OWNER]);
        (db.query.tools.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        // Override computeStackInsights to return totalActiveSpend matching the one old entry ($500)
        mockComputeStackInsights.mockReturnValueOnce({
            score: 60, label: "Mixed", totalActiveSpend: 500,
            aiNativeCount: 0, aiEnabledCount: 0, traditionalCount: 1, unknownCount: 0,
            timeSavedPerMonth: 0, timeSavedPerYear: 0, dollarValueSaved: 0,
            opportunities: [], enrichedTools: [],
        });
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "sp_old", toolName: "Salesforce", status: "active", monthlyCost: "500", renewalDate: null, workspaceId: "ws_1", createdAt: tenDaysAgo },
        ]);

        const res = await GET(makeRequest(VALID_AUTH));
        expect(res.status).toBe(200);
        const callArg = mockSendStackHealthDigest.mock.calls[0][1] as { spendDelta: number };
        expect(callArg.spendDelta).toBe(0);
    });
});
