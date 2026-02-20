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
            softwareSpend: { findMany: vi.fn() },
        },
        update: vi.fn(),
        insert: vi.fn(),
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return { ...actual, eq: vi.fn((...args) => args) };
});

vi.mock("@/lib/db/ensure-workspace", () => ({
    ensureWorkspace: vi.fn().mockResolvedValue({
        workspaceId: "ws_1",
        workspace: { id: "ws_1", name: "Acme's Workspace" },
        created: false,
    }),
}));

// generateCompanyContext calls firecrawl + openai — mock them to avoid real calls
vi.mock("@/lib/services/firecrawl", () => ({
    firecrawl: { scrapeUrl: vi.fn() },
}));

vi.mock("@ai-sdk/openai", () => ({
    openai: vi.fn().mockReturnValue("gpt-4o-mini"),
}));

vi.mock("ai", () => ({
    generateText: vi.fn(),
}));

vi.mock("@/lib/actions/referrals", () => ({
    trackReferralSignup: vi.fn().mockResolvedValue(undefined),
}));

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ensureWorkspace } from "@/lib/db/ensure-workspace";
import { firecrawl } from "@/lib/services/firecrawl";
import { generateText } from "ai";
import { completeOnboarding, generateCompanyContext } from "../onboarding";

const MOCK_USER = {
    id: "user_1",
    firstName: "Adam",
    username: null,
    primaryEmailAddress: { emailAddress: "adam@acme.com" },
};

function setupDbChains() {
    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });

    const insertValues = vi.fn().mockResolvedValue({});
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
}

const VALID_ONBOARDING_INPUT = {
    companyName: "Acme Inc",
    companyContext: "We build SaaS tools for teams.",
    selectedTools: [{ name: "Slack", url: "slack.com" }],
    scorecardDimensions: [
        { key: "ease_of_use", label: "Ease of Use", weight: 50 },
        { key: "integrations", label: "Integrations", weight: 50 },
    ],
};

describe("completeOnboarding", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupDbChains();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (ensureWorkspace as ReturnType<typeof vi.fn>).mockResolvedValue({
            workspaceId: "ws_1",
            workspace: { id: "ws_1", name: "Acme's Workspace" },
            created: false,
        });
    });

    it("throws Unauthorized when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        await expect(completeOnboarding(VALID_ONBOARDING_INPUT)).rejects.toThrow("Unauthorized");
    });

    it("throws when companyName exceeds 200 characters", async () => {
        const input = { ...VALID_ONBOARDING_INPUT, companyName: "x".repeat(201) };
        await expect(completeOnboarding(input)).rejects.toThrow("Invalid onboarding data");
    });

    it("throws when companyContext exceeds 5000 characters", async () => {
        const input = { ...VALID_ONBOARDING_INPUT, companyContext: "x".repeat(5001) };
        await expect(completeOnboarding(input)).rejects.toThrow("Invalid onboarding data");
    });

    it("throws when scorecardDimensions weights do not sum to 100", async () => {
        const input = {
            ...VALID_ONBOARDING_INPUT,
            scorecardDimensions: [
                { key: "ease_of_use", label: "Ease of Use", weight: 60 },
                { key: "integrations", label: "Integrations", weight: 30 },
            ],
        };
        await expect(completeOnboarding(input)).rejects.toThrow("Scorecard weights must sum to 100%");
    });

    it("succeeds when scorecardDimensions is empty (no weight check)", async () => {
        const input = { ...VALID_ONBOARDING_INPUT, scorecardDimensions: [] };
        const result = await completeOnboarding(input);
        expect(result.success).toBe(true);
    });

    it("returns success and redirectTo /tools for regular users", async () => {
        const result = await completeOnboarding(VALID_ONBOARDING_INPUT);
        expect(result).toEqual({ success: true, redirectTo: "/tools" });
    });

    it("redirects to /settings/billing for plan='team'", async () => {
        const result = await completeOnboarding({ ...VALID_ONBOARDING_INPUT, plan: "team" });
        expect(result.redirectTo).toBe("/settings/billing");
    });

    it("redirects to /settings/billing for plan='startup'", async () => {
        const result = await completeOnboarding({ ...VALID_ONBOARDING_INPUT, plan: "startup" });
        expect(result.redirectTo).toBe("/settings/billing");
    });

    it("redirects to /settings/billing for plan='enterprise'", async () => {
        const result = await completeOnboarding({ ...VALID_ONBOARDING_INPUT, plan: "enterprise" });
        expect(result.redirectTo).toBe("/settings/billing");
    });

    it("redirects to /tools for plan='free'", async () => {
        const result = await completeOnboarding({ ...VALID_ONBOARDING_INPUT, plan: "free" });
        expect(result.redirectTo).toBe("/tools");
    });

    it("skips insert for tools already in the stack (deduplication)", async () => {
        // All selected tools already in DB — no insert expected
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { toolName: "Slack" },
        ]);
        await completeOnboarding({ ...VALID_ONBOARDING_INPUT, selectedTools: [{ name: "Slack" }] });
        expect(db.insert).not.toHaveBeenCalled();
    });

    it("inserts new tools not already in the stack", async () => {
        (db.query.softwareSpend.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await completeOnboarding({
            ...VALID_ONBOARDING_INPUT,
            selectedTools: [{ name: "Linear" }, { name: "Slack" }],
        });
        expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it("does not call db.insert when selectedTools is empty", async () => {
        await completeOnboarding({ ...VALID_ONBOARDING_INPUT, selectedTools: [] });
        expect(db.insert).not.toHaveBeenCalled();
    });

    it("always calls db.update to set workspace config", async () => {
        await completeOnboarding(VALID_ONBOARDING_INPUT);
        expect(db.update).toHaveBeenCalledTimes(1);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.onboardingCompleted).toBe(true);
    });
});

describe("generateCompanyContext", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
    });

    it("returns error when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await generateCompanyContext("https://example.com");
        expect(result.error).toBe("Unauthorized");
    });

    it("returns error for empty URL", async () => {
        const result = await generateCompanyContext("");
        expect(result.error).toBe("Website URL is required");
    });

    it("returns error for URL exceeding 2000 characters", async () => {
        const result = await generateCompanyContext("https://example.com/" + "a".repeat(2000));
        expect(result.error).toBe("URL too long");
    });

    it("blocks localhost URLs (SSRF protection)", async () => {
        const result = await generateCompanyContext("http://localhost/admin");
        expect(result.error).toBe("Invalid URL");
    });

    it("blocks 127.0.0.1 (SSRF protection)", async () => {
        const result = await generateCompanyContext("http://127.0.0.1");
        expect(result.error).toBe("Invalid URL");
    });

    it("returns error when firecrawl scrape fails", async () => {
        (firecrawl.scrapeUrl as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false });
        const result = await generateCompanyContext("https://example.com");
        expect(result.error).toBe("Could not scrape website");
    });

    it("returns error when scraped content is empty", async () => {
        (firecrawl.scrapeUrl as ReturnType<typeof vi.fn>).mockResolvedValue({
            success: true,
            data: { markdown: "" },
        });
        const result = await generateCompanyContext("https://example.com");
        expect(result.error).toBe("No readable content found on website");
    });

    it("returns generated context on success", async () => {
        (firecrawl.scrapeUrl as ReturnType<typeof vi.fn>).mockResolvedValue({
            success: true,
            data: { markdown: "Acme builds project management software for engineering teams." },
        });
        (generateText as ReturnType<typeof vi.fn>).mockResolvedValue({
            text: "Acme is a B2B SaaS company building project management tools for engineering teams.",
        });
        const result = await generateCompanyContext("https://acme.com");
        expect(result.context).toBe("Acme is a B2B SaaS company building project management tools for engineering teams.");
        expect(result.error).toBeUndefined();
    });
});
