import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockEmailsSend, mockEmailsCancel } = vi.hoisted(() => ({
    mockEmailsSend: vi.fn(),
    mockEmailsCancel: vi.fn(),
}));

vi.mock("resend", () => ({
    Resend: vi.fn().mockImplementation(function () {
        return {
            emails: {
                send: mockEmailsSend,
                cancel: mockEmailsCancel,
            },
        };
    }),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            auditSubmissions: { findFirst: vi.fn() },
            dripEmails: { findMany: vi.fn() },
        },
        insert: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock("@/lib/db/schema", () => ({
    auditSubmissions: {},
    dripEmails: {},
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
        isNull: vi.fn((x: unknown) => x),
    };
});

vi.mock("./resend", () => ({
    getResend: vi.fn(() => ({
        emails: { send: mockEmailsSend, cancel: mockEmailsCancel },
    })),
    emailWrapper: vi.fn((content: string) => `<html>${content}</html>`),
    emailButton: vi.fn((href: string, label: string) => `<a href="${href}">${label}</a>`),
    escapeHtml: vi.fn((text: string) => text.replace(/</g, "&lt;").replace(/>/g, "&gt;")),
}));

import { Resend } from "resend";
import { db } from "@/lib/db";
import { scheduleAuditDripSequence, cancelAuditDrips } from "../audit-drips";

const ORIG_KEY = process.env.RESEND_API_KEY;
const ORIG_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

function restoreResendMock() {
    (Resend as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return {
            emails: { send: mockEmailsSend, cancel: mockEmailsCancel },
        };
    });
}

function setupDbChains() {
    const insertValues = vi.fn().mockResolvedValue({});
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: insertValues });

    const updateWhere = vi.fn().mockResolvedValue({});
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: updateSet });

    (db.query.auditSubmissions.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        publicSlug: "test-slug",
        shareToken: "test-token",
    });

    (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
}

const FULL_SCORECARD = {
    aiNativeScore: { score: 45 },
    quickWins: [
        { action: "Enable auto-summary", tool: "Notion AI", timeToValue: "1 day", expectedOutcome: "Save 2hrs/week" },
        { action: "Set up Slack bot", tool: "Slack", timeToValue: "2 hours", expectedOutcome: "Faster responses" },
        { action: "Automate reports", tool: "Zapier", timeToValue: "3 days", expectedOutcome: "No manual reports" },
    ],
    industryBenchmark: {
        peerAvgScore: 55,
        peerLabel: "SaaS companies, 50-200 employees",
        percentile: 35,
        insight: "Below average AI adoption",
        competitiveContext: "Competitors are investing heavily in AI",
    },
    roiProjection: {
        currentAnnualWaste: 120000,
        projectedSavings: 85000,
        paybackMonths: 4,
        assumptions: ["Based on current headcount", "Assumes full adoption"],
    },
};

// ── scheduleAuditDripSequence ───────────────────────────────────────────────

describe("scheduleAuditDripSequence", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        process.env.RESEND_API_KEY = "resend_test_key";
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
        mockEmailsSend.mockResolvedValue({ data: { id: "email_drip_1" } });
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = ORIG_KEY;
        process.env.NEXT_PUBLIC_APP_URL = ORIG_APP_URL;
    });

    it("schedules 3 emails with correct day offsets (d+3, d+7, d+14)", async () => {
        const before = Date.now();
        await scheduleAuditDripSequence("sub_1", "user@example.com", "Acme", FULL_SCORECARD);

        expect(mockEmailsSend).toHaveBeenCalledTimes(3);

        const scheduledDates = mockEmailsSend.mock.calls.map(
            (c) => new Date(c[0].scheduledAt).getTime()
        );

        const d3 = 3 * 24 * 60 * 60 * 1000;
        const d7 = 7 * 24 * 60 * 60 * 1000;
        const d14 = 14 * 24 * 60 * 60 * 1000;

        // Allow 5s tolerance for test execution time
        expect(scheduledDates[0]).toBeGreaterThanOrEqual(before + d3 - 5000);
        expect(scheduledDates[0]).toBeLessThanOrEqual(before + d3 + 5000);
        expect(scheduledDates[1]).toBeGreaterThanOrEqual(before + d7 - 5000);
        expect(scheduledDates[1]).toBeLessThanOrEqual(before + d7 + 5000);
        expect(scheduledDates[2]).toBeGreaterThanOrEqual(before + d14 - 5000);
        expect(scheduledDates[2]).toBeLessThanOrEqual(before + d14 + 5000);
    });

    it("records each email in dripEmails table", async () => {
        await scheduleAuditDripSequence("sub_1", "user@example.com", "Acme", FULL_SCORECARD);

        expect(db.insert).toHaveBeenCalledTimes(3);
    });

    it("handles missing quickWins gracefully (old scorecards)", async () => {
        const scorecardNoQuickWins = { ...FULL_SCORECARD, quickWins: undefined };
        await expect(
            scheduleAuditDripSequence("sub_1", "user@example.com", "Acme", scorecardNoQuickWins)
        ).resolves.toBeUndefined();
        expect(mockEmailsSend).toHaveBeenCalledTimes(3);
    });

    it("handles missing industryBenchmark gracefully", async () => {
        const scorecardNoBenchmark = { ...FULL_SCORECARD, industryBenchmark: undefined };
        await expect(
            scheduleAuditDripSequence("sub_1", "user@example.com", "Acme", scorecardNoBenchmark)
        ).resolves.toBeUndefined();
        expect(mockEmailsSend).toHaveBeenCalledTimes(3);
    });

    it("handles missing roiProjection gracefully", async () => {
        const scorecardNoRoi = { ...FULL_SCORECARD, roiProjection: undefined };
        await expect(
            scheduleAuditDripSequence("sub_1", "user@example.com", "Acme", scorecardNoRoi)
        ).resolves.toBeUndefined();
        expect(mockEmailsSend).toHaveBeenCalledTimes(3);
    });

    it("returns early if RESEND_API_KEY not set", async () => {
        delete process.env.RESEND_API_KEY;
        await scheduleAuditDripSequence("sub_1", "user@example.com", "Acme", FULL_SCORECARD);
        expect(mockEmailsSend).not.toHaveBeenCalled();
    });
});

// ── cancelAuditDrips ────────────────────────────────────────────────────────

describe("cancelAuditDrips", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        process.env.RESEND_API_KEY = "resend_test_key";
        mockEmailsCancel.mockResolvedValue({ data: {} });
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = ORIG_KEY;
    });

    it("queries correct auditSubmissionId", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await cancelAuditDrips("sub_abc");
        expect(db.query.dripEmails.findMany).toHaveBeenCalledTimes(1);
    });

    it("calls resend.emails.cancel for each pending drip", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "drip_1", resendEmailId: "email_abc" },
            { id: "drip_2", resendEmailId: "email_def" },
            { id: "drip_3", resendEmailId: "email_ghi" },
        ]);
        await cancelAuditDrips("sub_1");
        expect(mockEmailsCancel).toHaveBeenCalledTimes(3);
        expect(mockEmailsCancel).toHaveBeenCalledWith("email_abc");
        expect(mockEmailsCancel).toHaveBeenCalledWith("email_def");
        expect(mockEmailsCancel).toHaveBeenCalledWith("email_ghi");
    });

    it("sets canceledAt on each record", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "drip_1", resendEmailId: "email_abc" },
        ]);
        await cancelAuditDrips("sub_1");
        expect(db.update).toHaveBeenCalledTimes(1);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.canceledAt).toBeInstanceOf(Date);
    });

    it("handles empty results (no drips to cancel)", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await cancelAuditDrips("sub_1");
        expect(mockEmailsCancel).not.toHaveBeenCalled();
        expect(db.update).not.toHaveBeenCalled();
    });

    it("returns early if RESEND_API_KEY not set", async () => {
        delete process.env.RESEND_API_KEY;
        await cancelAuditDrips("sub_1");
        expect(mockEmailsCancel).not.toHaveBeenCalled();
    });
});
