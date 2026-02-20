import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            tools: { findFirst: vi.fn() },
            subscriptions: { findFirst: vi.fn() },
            reports: { findMany: vi.fn() },
        },
        update: vi.fn(),
        insert: vi.fn(),
        select: vi.fn(),
    },
}));

vi.mock("@/lib/db/schema", () => ({
    tools: {},
    reports: {},
    workspaces: {},
    researchJobs: {},
    subscriptions: {},
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
        gte: vi.fn((...args: unknown[]) => args),
        ne: vi.fn((...args: unknown[]) => args),
        gt: vi.fn((...args: unknown[]) => args),
        inArray: vi.fn((...args: unknown[]) => args),
        count: vi.fn(() => "count_mock"),
    };
});

vi.mock("@/lib/services/firecrawl", () => ({
    firecrawl: {
        mapSite: vi.fn(),
        scrapeUrl: vi.fn(),
    },
}));

vi.mock("@/lib/services/tavily", () => ({
    tavily: {
        search: vi.fn(),
    },
}));

vi.mock("@/lib/services/perplexity", () => ({
    perplexity: {
        search: vi.fn(),
    },
}));

vi.mock("@ai-sdk/openai", () => ({
    openai: vi.fn().mockReturnValue("gpt-4o-mini"),
}));

vi.mock("ai", () => ({
    generateObject: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/config/subscriptions", () => ({
    getPlanLimits: vi.fn().mockReturnValue({
        name: "Free",
        limits: { research: Infinity },
    }),
}));

vi.mock("@/lib/email/resend", () => ({
    sendResearchCompleteEmail: vi.fn().mockResolvedValue(undefined),
    sendResearchFailedEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@clerk/nextjs/server", () => ({
    clerkClient: vi.fn().mockResolvedValue({
        users: {
            getUser: vi.fn().mockResolvedValue({
                emailAddresses: [{ emailAddress: "user@example.com" }],
            }),
        },
    }),
}));

vi.mock("@/lib/services/slack", () => ({
    postMessage: vi.fn().mockResolvedValue({}),
    researchCompleteBlocks: vi.fn().mockReturnValue([]),
    researchFailedBlocks: vi.fn().mockReturnValue([]),
}));

vi.mock("@/lib/services/api-logger", () => ({
    logApiCall: vi.fn(),
    COST_MAP: {
        firecrawl: { map: 0.001, scrape: 0.002 },
        tavily: { search: 0.005 },
        perplexity: { "sonar-reasoning-pro": 0.05 },
    },
    estimateOpenAICost: vi.fn().mockReturnValue(0.001),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { db } from "@/lib/db";
import { firecrawl } from "@/lib/services/firecrawl";
import { tavily } from "@/lib/services/tavily";
import { generateObject } from "ai";
import { getPlanLimits } from "@/lib/config/subscriptions";
import { sendResearchCompleteEmail, sendResearchFailedEmail } from "@/lib/email/resend";
import { postMessage } from "@/lib/services/slack";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { performDeepResearch } from "../research";

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_WORKSPACE = {
    id: "ws_1",
    name: "Acme",
    companyContext: "B2B SaaS company",
    scorecardConfig: null,
    slackEnabled: false,
    slackChannelId: null,
    slackBotToken: null,
};

const MOCK_TOOL = {
    id: "tool_1",
    name: "Linear",
    websiteUrl: "https://linear.app",
    workspaceId: "ws_1",
    submittedBy: null as string | null,
    workspace: MOCK_WORKSPACE,
};

const MOCK_REPORT = {
    summary: "Linear is a project management tool.",
    scorecardSnapshot: {
        features: { score: 8, justification: "Good features" },
        pricing_value: { score: 7, justification: "Reasonable" },
        ease_of_use: { score: 9, justification: "Very easy" },
        integration_depth: { score: 7, justification: "Many integrations" },
        support_quality: { score: 7, justification: "Good support" },
        security: { score: 8, justification: "SOC2" },
        ai_capabilities: { score: 6, justification: "Some AI" },
    },
    features: { list: ["Issues", "Cycles"] },
    pricing: [{ tier: "Free", price: "$0/mo" }],
    isPricingHidden: false,
    pros: ["Fast", "Clean UI"],
    cons: ["Limited free tier"],
    competitors: ["asana.com"],
    integrations: ["Slack"],
    categories: ["Project Management"],
    sentimentConsensus: {
        overall: "very_positive" as const,
        confidence: 85,
        sourceAgreement: "Sources agree.",
    },
    marketIntel: {
        founded: "2019",
        headquarters: "San Francisco",
        employeeCount: "51-200",
        funding: "$35M",
        recentNews: ["Linear 2.0 launched"],
    },
};

// ── DB chain helpers ──────────────────────────────────────────────────────────

function setupDbChains(selectJobCount = 0) {
    // update chain: .set().where() → {}
    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });

    // insert chain: .values() → { returning: fn } (returning resolves to [{id}])
    const returning = vi.fn().mockResolvedValue([{ id: "job_1" }]);
    const insertValues = vi.fn().mockReturnValue({ returning });
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    // select chain: .from().where() → [{ value: N }]
    const selectWhere = vi.fn().mockResolvedValue([{ value: selectJobCount }]);
    const selectFrom = vi.fn().mockReturnValue({ where: selectWhere });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: selectFrom });

    // query mocks
    (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_TOOL);
    (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (db.query.reports.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
}

function setupServiceMocks() {
    (firecrawl.mapSite as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: ["https://linear.app/pricing", "https://linear.app/features"],
    });
    (firecrawl.scrapeUrl as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: { markdown: "# Linear\nProject management for teams." },
    });
    (tavily.search as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [], answer: "" });
    (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({
        object: MOCK_REPORT,
        usage: { inputTokens: 1000, outputTokens: 500 },
    });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("performDeepResearch", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Restore mock implementations cleared by resetAllMocks
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({
            name: "Free",
            limits: { research: Infinity },
        });
        (sendResearchCompleteEmail as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
        (sendResearchFailedEmail as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
        (postMessage as ReturnType<typeof vi.fn>).mockResolvedValue({});
        (revalidatePath as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
        (clerkClient as ReturnType<typeof vi.fn>).mockResolvedValue({
            users: {
                getUser: vi.fn().mockResolvedValue({
                    emailAddresses: [{ emailAddress: "user@example.com" }],
                }),
            },
        });
        setupDbChains();
        setupServiceMocks();
    });

    // ── Tool validation ────────────────────────────────────────────────────────

    it("returns error when tool is not found", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
        const result = await performDeepResearch("tool_missing");
        expect(result).toEqual({ success: false, error: "Tool not found or missing URL" });
    });

    it("returns error when tool has no websiteUrl", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_TOOL,
            websiteUrl: null,
        });
        const result = await performDeepResearch("tool_1");
        expect(result).toEqual({ success: false, error: "Tool not found or missing URL" });
    });

    // ── Plan limit enforcement ─────────────────────────────────────────────────

    it("skips the limit check when plan has Infinity research runs", async () => {
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({
            name: "Pro",
            limits: { research: Infinity },
        });
        const result = await performDeepResearch("tool_1");
        // db.select for job count should NOT be called when limit is Infinity
        expect(db.select).not.toHaveBeenCalled();
        expect(result.success).toBe(true);
    });

    it("returns error when monthly limit is reached and workspace has no credits", async () => {
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({
            name: "Free",
            limits: { research: 3 },
        });
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            workspaceId: "ws_1",
            creditBalance: 0,
        });
        // Job count >= limit (5 >= 3)
        setupDbChains(5);
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({
            name: "Free",
            limits: { research: 3 },
        });

        const result = await performDeepResearch("tool_1");
        expect(result.success).toBe(false);
        expect(result.error).toContain("Monthly research limit");
    });

    it("continues research when limit reached but workspace has credits", async () => {
        (getPlanLimits as ReturnType<typeof vi.fn>).mockReturnValue({
            name: "Free",
            limits: { research: 3 },
        });
        // Set subscription AFTER setupDbChains so it isn't overwritten
        setupDbChains(5); // 5 jobs >= limit of 3
        (db.query.subscriptions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            workspaceId: "ws_1",
            creditBalance: 5,
        });
        setupServiceMocks();

        const result = await performDeepResearch("tool_1");
        expect(result.success).toBe(true);
    });

    // ── Research job lifecycle ─────────────────────────────────────────────────

    it("creates a researchJob row at the start of research", async () => {
        await performDeepResearch("tool_1");
        expect(db.insert).toHaveBeenCalled();
    });

    it("sets tool status to 'researching' before running agents", async () => {
        await performDeepResearch("tool_1");
        // db.update is called multiple times; check that status:'researching' was passed
        const allSetCalls = (
            (db.update as ReturnType<typeof vi.fn>).mock.results
                .map((r) => (r.value.set as ReturnType<typeof vi.fn>)?.mock?.calls ?? [])
                .flat()
        );
        const researchingCall = allSetCalls.find((args) => args[0]?.status === "researching");
        expect(researchingCall).toBeDefined();
    });

    // ── Happy path ─────────────────────────────────────────────────────────────

    it("returns { success: true } on successful research", async () => {
        const result = await performDeepResearch("tool_1");
        expect(result).toEqual({ success: true });
    });

    it("sets tool status to 'active' after successful research", async () => {
        await performDeepResearch("tool_1");
        const allSetCalls = (
            (db.update as ReturnType<typeof vi.fn>).mock.results
                .map((r) => (r.value.set as ReturnType<typeof vi.fn>)?.mock?.calls ?? [])
                .flat()
        );
        const activeCall = allSetCalls.find((args) => args[0]?.status === "active");
        expect(activeCall).toBeDefined();
    });

    it("marks the researchJob as complete on success", async () => {
        await performDeepResearch("tool_1");
        const allSetCalls = (
            (db.update as ReturnType<typeof vi.fn>).mock.results
                .map((r) => (r.value.set as ReturnType<typeof vi.fn>)?.mock?.calls ?? [])
                .flat()
        );
        const completeCall = allSetCalls.find((args) => args[0]?.status === "complete");
        expect(completeCall).toBeDefined();
    });

    it("calculates avgScore from scorecard and stores it", async () => {
        await performDeepResearch("tool_1");
        // All 7 scores: 8,7,9,7,7,8,6 → sum=52, avg=52/7≈7.43 → "7.4"
        const allSetCalls = (
            (db.update as ReturnType<typeof vi.fn>).mock.results
                .map((r) => (r.value.set as ReturnType<typeof vi.fn>)?.mock?.calls ?? [])
                .flat()
        );
        const scoreCall = allSetCalls.find((args) => args[0]?.overallScore !== undefined);
        expect(scoreCall).toBeDefined();
        expect(typeof scoreCall?.[0]?.overallScore).toBe("string");
    });

    it("calls revalidatePath for tool page, /tools, and /queue", async () => {
        await performDeepResearch("tool_1");
        expect(revalidatePath).toHaveBeenCalledWith("/tools/tool_1");
        expect(revalidatePath).toHaveBeenCalledWith("/tools");
        expect(revalidatePath).toHaveBeenCalledWith("/queue");
    });

    it("calls firecrawl.mapSite with the tool's website URL", async () => {
        await performDeepResearch("tool_1");
        expect(firecrawl.mapSite).toHaveBeenCalledWith("https://linear.app");
    });

    it("calls tavily.search multiple times (reviews, trust, Reddit, competitors)", async () => {
        await performDeepResearch("tool_1");
        // research.ts calls tavily for: reviews, trust, 3x reddit, competitors, market = 7 calls
        const callCount = (tavily.search as ReturnType<typeof vi.fn>).mock.calls.length;
        expect(callCount).toBeGreaterThanOrEqual(4);
    });

    // ── Error handling ─────────────────────────────────────────────────────────

    it("returns { success: false } when generateObject throws", async () => {
        (generateObject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("AI error"));
        const result = await performDeepResearch("tool_1");
        expect(result.success).toBe(false);
        expect(result.error).toBe("AI error");
    });

    it("sets tool status to 'failed' when research throws", async () => {
        (generateObject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("AI error"));
        await performDeepResearch("tool_1");
        const allSetCalls = (
            (db.update as ReturnType<typeof vi.fn>).mock.results
                .map((r) => (r.value.set as ReturnType<typeof vi.fn>)?.mock?.calls ?? [])
                .flat()
        );
        const failedCall = allSetCalls.find((args) => args[0]?.status === "failed");
        expect(failedCall).toBeDefined();
    });

    it("marks researchJob as failed on error", async () => {
        (generateObject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));
        await performDeepResearch("tool_1");
        const allSetCalls = (
            (db.update as ReturnType<typeof vi.fn>).mock.results
                .map((r) => (r.value.set as ReturnType<typeof vi.fn>)?.mock?.calls ?? [])
                .flat()
        );
        const jobFailCall = allSetCalls.find((args) => args[0]?.status === "failed" && args[0]?.errorMessage);
        expect(jobFailCall).toBeDefined();
    });

    // ── Email & Slack notifications ────────────────────────────────────────────

    it("sends success email when tool has submittedBy", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_TOOL,
            submittedBy: "user_clerk_1",
        });
        await performDeepResearch("tool_1");
        expect(sendResearchCompleteEmail).toHaveBeenCalledTimes(1);
        expect(sendResearchCompleteEmail).toHaveBeenCalledWith(
            "user@example.com",
            "Linear",
            "tool_1",
            expect.any(Number),
        );
    });

    it("does not send email when submittedBy is null", async () => {
        await performDeepResearch("tool_1"); // MOCK_TOOL has submittedBy: null
        expect(sendResearchCompleteEmail).not.toHaveBeenCalled();
    });

    it("sends Slack notification when workspace has Slack enabled", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_TOOL,
            workspace: {
                ...MOCK_WORKSPACE,
                slackEnabled: true,
                slackChannelId: "ch_abc",
                slackBotToken: "xoxb-token",
            },
        });
        await performDeepResearch("tool_1");
        expect(postMessage).toHaveBeenCalledTimes(1);
    });

    it("does not send Slack when workspace.slackEnabled is false", async () => {
        await performDeepResearch("tool_1"); // MOCK_TOOL workspace has slackEnabled: false
        expect(postMessage).not.toHaveBeenCalled();
    });

    it("sends failure email when research errors and submittedBy is set", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_TOOL,
            submittedBy: "user_clerk_1",
        });
        (generateObject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("synthesis failed"));
        await performDeepResearch("tool_1");
        expect(sendResearchFailedEmail).toHaveBeenCalledTimes(1);
        expect(sendResearchFailedEmail).toHaveBeenCalledWith(
            "user@example.com",
            "Linear",
            "tool_1",
            "synthesis failed",
        );
    });

    it("sends Slack failure notification when workspace has Slack and research errors", async () => {
        (db.query.tools.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_TOOL,
            workspace: {
                ...MOCK_WORKSPACE,
                slackEnabled: true,
                slackChannelId: "ch_abc",
                slackBotToken: "xoxb-token",
            },
        });
        (generateObject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));
        await performDeepResearch("tool_1");
        expect(postMessage).toHaveBeenCalledTimes(1);
    });

    // ── Perplexity ─────────────────────────────────────────────────────────────

    it("skips Perplexity when PERPLEXITY_API_KEY is not set", async () => {
        const origKey = process.env.PERPLEXITY_API_KEY;
        delete process.env.PERPLEXITY_API_KEY;
        const { perplexity } = await import("@/lib/services/perplexity");
        await performDeepResearch("tool_1");
        expect((perplexity.search as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
        process.env.PERPLEXITY_API_KEY = origKey;
    });
});
