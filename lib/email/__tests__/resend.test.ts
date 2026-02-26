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
            dripEmails: { findMany: vi.fn() },
        },
        insert: vi.fn(),
        update: vi.fn(),
    },
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

vi.mock("@/lib/db/schema", () => ({
    dripEmails: {},
}));

import { Resend } from "resend";
import { db } from "@/lib/db";
import {
    sendWelcomeEmail,
    sendInviteEmail,
    sendResearchCompleteEmail,
    sendResearchFailedEmail,
    sendTrialEndingEmail,
    scheduleDripSequence,
    cancelDripForUser,
    sendRenewalAlertEmail,
} from "../resend";

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

    (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
}

// ── sendWelcomeEmail ──────────────────────────────────────────────────────────

describe("sendWelcomeEmail", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        process.env.RESEND_API_KEY = "resend_test_key";
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
        mockEmailsSend.mockResolvedValue({ data: { id: "email_1" } });
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = ORIG_KEY;
        process.env.NEXT_PUBLIC_APP_URL = ORIG_APP_URL;
    });

    it("returns without sending when RESEND_API_KEY is not set", async () => {
        delete process.env.RESEND_API_KEY;
        await sendWelcomeEmail("user@example.com", "Adam");
        expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("sends to correct address with correct subject", async () => {
        await sendWelcomeEmail("user@example.com", "Adam");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.to).toBe("user@example.com");
        expect(call.subject).toBe("Welcome to Trackr");
        expect(call.from).toContain("noreply@trytrackr.com");
    });

    it("includes the user's first name in the HTML body", async () => {
        await sendWelcomeEmail("user@example.com", "Adam");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("Adam");
    });

    it("HTML-escapes firstName to prevent XSS", async () => {
        await sendWelcomeEmail("user@example.com", "<script>alert(1)</script>");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).not.toContain("<script>");
        expect(call.html).toContain("&lt;script&gt;");
    });

    it("includes app URL in CTA button", async () => {
        await sendWelcomeEmail("user@example.com", "Adam");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("https://trytrackr.com/tools");
    });
});

// ── sendInviteEmail ───────────────────────────────────────────────────────────

describe("sendInviteEmail", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        process.env.RESEND_API_KEY = "resend_test_key";
        mockEmailsSend.mockResolvedValue({ data: { id: "email_1" } });
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = ORIG_KEY;
    });

    it("returns without sending when no API key", async () => {
        delete process.env.RESEND_API_KEY;
        await sendInviteEmail("user@example.com", "Acme");
        expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("includes workspace name in subject", async () => {
        await sendInviteEmail("user@example.com", "Acme Corp");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("Acme Corp");
    });

    it("includes inviter name in body when provided", async () => {
        await sendInviteEmail("user@example.com", "Acme", "John Doe");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("by John Doe");
    });

    it("does not include 'by undefined' when inviterName is omitted", async () => {
        await sendInviteEmail("user@example.com", "Acme");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).not.toContain("by undefined");
        expect(call.html).not.toContain("by null");
    });

    it("HTML-escapes workspace name in subject and body", async () => {
        await sendInviteEmail("user@example.com", "<b>Evil Corp</b>");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).not.toContain("<b>Evil Corp</b>");
        expect(call.html).toContain("&lt;b&gt;");
        expect(call.subject).not.toContain("<b>");
    });
});

// ── sendResearchCompleteEmail ─────────────────────────────────────────────────

describe("sendResearchCompleteEmail", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        process.env.RESEND_API_KEY = "resend_test_key";
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
        mockEmailsSend.mockResolvedValue({ data: { id: "email_1" } });
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = ORIG_KEY;
        process.env.NEXT_PUBLIC_APP_URL = ORIG_APP_URL;
    });

    it("returns without sending when no API key", async () => {
        delete process.env.RESEND_API_KEY;
        await sendResearchCompleteEmail("user@example.com", "Linear", "tool_1", 8.5);
        expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("includes score formatted to 1 decimal in subject", async () => {
        await sendResearchCompleteEmail("user@example.com", "Linear", "tool_1", 8.5);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("8.5/10");
    });

    it("formats whole number score with one decimal", async () => {
        await sendResearchCompleteEmail("user@example.com", "Notion", "tool_2", 9);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("9.0/10");
    });

    it("includes tool name in subject", async () => {
        await sendResearchCompleteEmail("user@example.com", "Figma", "tool_3", 7.2);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("Figma");
    });

    it("includes toolId in the CTA link", async () => {
        await sendResearchCompleteEmail("user@example.com", "Linear", "tool_abc123", 7.5);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("tool_abc123");
    });
});

// ── sendResearchFailedEmail ───────────────────────────────────────────────────

describe("sendResearchFailedEmail", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        process.env.RESEND_API_KEY = "resend_test_key";
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
        mockEmailsSend.mockResolvedValue({ data: { id: "email_1" } });
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = ORIG_KEY;
        process.env.NEXT_PUBLIC_APP_URL = ORIG_APP_URL;
    });

    it("returns without sending when no API key", async () => {
        delete process.env.RESEND_API_KEY;
        await sendResearchFailedEmail("user@example.com", "Linear", "tool_1", "Timeout");
        expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("HTML-escapes errorMessage to prevent XSS", async () => {
        await sendResearchFailedEmail("user@example.com", "Linear", "tool_1", "<script>xss</script>");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).not.toContain("<script>xss</script>");
        expect(call.html).toContain("&lt;script&gt;xss&lt;/script&gt;");
    });

    it("includes the error message text in the body", async () => {
        await sendResearchFailedEmail("user@example.com", "Linear", "tool_1", "Rate limit exceeded");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("Rate limit exceeded");
    });

    it("subject includes tool name", async () => {
        await sendResearchFailedEmail("user@example.com", "Figma", "tool_2", "error");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("Figma");
    });

    it("includes toolId in the retry link", async () => {
        await sendResearchFailedEmail("user@example.com", "Linear", "tool_retry_99", "error");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("tool_retry_99");
    });
});

// ── sendTrialEndingEmail ──────────────────────────────────────────────────────

describe("sendTrialEndingEmail", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        process.env.RESEND_API_KEY = "resend_test_key";
        mockEmailsSend.mockResolvedValue({ data: { id: "email_1" } });
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = ORIG_KEY;
    });

    it("returns without sending when no API key", async () => {
        delete process.env.RESEND_API_KEY;
        await sendTrialEndingEmail("user@example.com", 7, "Pro");
        expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("uses plural 'days' in subject when daysLeft > 1", async () => {
        await sendTrialEndingEmail("user@example.com", 7, "Pro");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("7 days");
    });

    it("uses singular 'day' in subject when daysLeft === 1", async () => {
        await sendTrialEndingEmail("user@example.com", 1, "Pro");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("1 day");
        expect(call.subject).not.toContain("1 days");
    });

    it("shows urgency red color when daysLeft <= 3", async () => {
        await sendTrialEndingEmail("user@example.com", 3, "Pro");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("C0392B");
    });

    it("shows 'today' text in urgency block when daysLeft === 0", async () => {
        await sendTrialEndingEmail("user@example.com", 0, "Pro");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("today");
    });

    it("shows standard trial-days text when daysLeft > 3", async () => {
        await sendTrialEndingEmail("user@example.com", 7, "Pro");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("in 7 days");
    });

    it("includes plan name in body", async () => {
        await sendTrialEndingEmail("user@example.com", 5, "Startup");
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("Startup");
    });
});

// ── sendRenewalAlertEmail ─────────────────────────────────────────────────────

describe("sendRenewalAlertEmail", () => {
    const TOOLS = [
        { name: "Slack", renewalDate: new Date("2026-03-15"), monthlyCost: "49.99" },
        { name: "Notion", renewalDate: new Date("2026-03-20"), monthlyCost: "0" },
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        process.env.RESEND_API_KEY = "resend_test_key";
        process.env.NEXT_PUBLIC_APP_URL = "https://trytrackr.com";
        mockEmailsSend.mockResolvedValue({ data: { id: "email_1" } });
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = ORIG_KEY;
        process.env.NEXT_PUBLIC_APP_URL = ORIG_APP_URL;
    });

    it("returns without sending when no API key", async () => {
        delete process.env.RESEND_API_KEY;
        await sendRenewalAlertEmail("user@example.com", TOOLS);
        expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("uses plural 'renewals' in subject for multiple tools", async () => {
        await sendRenewalAlertEmail("user@example.com", TOOLS);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("2 tool renewals");
    });

    it("uses singular 'renewal' in subject for one tool", async () => {
        await sendRenewalAlertEmail("user@example.com", [TOOLS[0]]);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.subject).toContain("1 tool renewal");
        expect(call.subject).not.toContain("renewals");
    });

    it("shows formatted cost for tools with monthlyCost > 0", async () => {
        await sendRenewalAlertEmail("user@example.com", [TOOLS[0]]);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("$49.99/mo");
    });

    it("shows '—' for tools with zero monthlyCost", async () => {
        await sendRenewalAlertEmail("user@example.com", [TOOLS[1]]);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("—");
    });

    it("shows '—' for tools with null monthlyCost", async () => {
        await sendRenewalAlertEmail("user@example.com", [
            { name: "Figma", renewalDate: new Date("2026-03-10"), monthlyCost: null },
        ]);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("—");
    });

    it("HTML-escapes tool names to prevent XSS", async () => {
        await sendRenewalAlertEmail("user@example.com", [
            { name: "<b>Evil Tool</b>", renewalDate: new Date("2026-03-10"), monthlyCost: "10" },
        ]);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).not.toContain("<b>Evil Tool</b>");
        expect(call.html).toContain("&lt;b&gt;");
    });

    it("includes all tool names in the email body", async () => {
        await sendRenewalAlertEmail("user@example.com", TOOLS);
        const call = mockEmailsSend.mock.calls[0][0];
        expect(call.html).toContain("Slack");
        expect(call.html).toContain("Notion");
    });
});

// ── scheduleDripSequence ──────────────────────────────────────────────────────

describe("scheduleDripSequence", () => {
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

    it("returns without scheduling when no API key", async () => {
        delete process.env.RESEND_API_KEY;
        await scheduleDripSequence("user@example.com", "Adam");
        expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("returns without throwing even if send rejects (fire-and-forget)", async () => {
        mockEmailsSend.mockRejectedValue(new Error("Resend service error"));
        await expect(scheduleDripSequence("user@example.com", "Adam")).resolves.toBeUndefined();
    });

    it("initiates 4 drip email sends (d1, d3, d7, d14)", async () => {
        await scheduleDripSequence("user@example.com", "Adam");
        expect(mockEmailsSend).toHaveBeenCalledTimes(4);
    });

    it("includes first name in the d1 drip subject", async () => {
        await scheduleDripSequence("user@example.com", "Adam");
        const subjects = mockEmailsSend.mock.calls.map((c) => c[0].subject as string);
        expect(subjects[0]).toContain("Adam");
    });

    it("sets scheduledAt on each drip email", async () => {
        await scheduleDripSequence("user@example.com", "Adam");
        for (const [args] of mockEmailsSend.mock.calls) {
            expect(args.scheduledAt).toBeDefined();
            expect(typeof args.scheduledAt).toBe("string");
        }
    });

    it("inserts drip records into DB when send succeeds", async () => {
        await scheduleDripSequence("user@example.com", "Adam");
        // Flush the fire-and-forget .then() microtasks
        await Promise.resolve();
        await Promise.resolve();
        expect(db.insert).toHaveBeenCalled();
    });
});

// ── cancelDripForUser ─────────────────────────────────────────────────────────

describe("cancelDripForUser", () => {
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

    it("returns without canceling when no API key", async () => {
        delete process.env.RESEND_API_KEY;
        await cancelDripForUser("user@example.com");
        expect(mockEmailsCancel).not.toHaveBeenCalled();
    });

    it("does nothing when there are no pending drips", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await cancelDripForUser("user@example.com");
        expect(mockEmailsCancel).not.toHaveBeenCalled();
        expect(db.update).not.toHaveBeenCalled();
    });

    it("calls resend.emails.cancel for each pending drip", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "drip_1", resendEmailId: "email_abc", email: "user@example.com" },
            { id: "drip_2", resendEmailId: "email_def", email: "user@example.com" },
        ]);
        await cancelDripForUser("user@example.com");
        expect(mockEmailsCancel).toHaveBeenCalledTimes(2);
        expect(mockEmailsCancel).toHaveBeenCalledWith("email_abc");
        expect(mockEmailsCancel).toHaveBeenCalledWith("email_def");
    });

    it("updates canceledAt for each successfully canceled drip", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "drip_1", resendEmailId: "email_abc", email: "user@example.com" },
        ]);
        await cancelDripForUser("user@example.com");
        expect(db.update).toHaveBeenCalledTimes(1);
        const setArgs = (
            (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(setArgs.canceledAt).toBeInstanceOf(Date);
    });

    it("silently ignores cancellation errors and processes remaining drips", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "drip_1", resendEmailId: "email_abc", email: "user@example.com" },
            { id: "drip_2", resendEmailId: "email_def", email: "user@example.com" },
        ]);
        mockEmailsCancel
            .mockRejectedValueOnce(new Error("Already sent"))
            .mockResolvedValueOnce({ data: {} });

        await expect(cancelDripForUser("user@example.com")).resolves.toBeUndefined();
        // Second drip should still have been attempted
        expect(mockEmailsCancel).toHaveBeenCalledTimes(2);
    });

    it("does not update DB when cancellation throws", async () => {
        (db.query.dripEmails.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
            { id: "drip_1", resendEmailId: "email_abc", email: "user@example.com" },
        ]);
        mockEmailsCancel.mockRejectedValue(new Error("Already sent"));

        await cancelDripForUser("user@example.com");
        expect(db.update).not.toHaveBeenCalled();
    });
});

// ── sendWithRetry (tested indirectly via sendWelcomeEmail) ────────────────────

describe("sendWithRetry behavior (via sendWelcomeEmail)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        restoreResendMock();
        setupDbChains();
        vi.useFakeTimers();
        process.env.RESEND_API_KEY = "resend_test_key";
    });

    afterEach(() => {
        vi.useRealTimers();
        process.env.RESEND_API_KEY = ORIG_KEY;
    });

    it("retries once on transient failure then succeeds", async () => {
        mockEmailsSend
            .mockRejectedValueOnce(new Error("transient error"))
            .mockResolvedValueOnce({ data: { id: "ok" } });

        const promise = sendWelcomeEmail("user@example.com", "Adam");
        await vi.runAllTimersAsync();
        await promise;

        expect(mockEmailsSend).toHaveBeenCalledTimes(2);
    });

    it("throws after MAX_RETRIES (3) consecutive failures", async () => {
        mockEmailsSend.mockRejectedValue(new Error("persistent failure"));

        const promise = sendWelcomeEmail("user@example.com", "Adam");
        // Attach rejection handler before advancing timers to avoid unhandled rejection warning
        const expectation = expect(promise).rejects.toThrow("persistent failure");
        await vi.runAllTimersAsync();
        await expectation;
        expect(mockEmailsSend).toHaveBeenCalledTimes(3);
    });

    it("succeeds on the third attempt without throwing", async () => {
        mockEmailsSend
            .mockRejectedValueOnce(new Error("fail 1"))
            .mockRejectedValueOnce(new Error("fail 2"))
            .mockResolvedValueOnce({ data: { id: "ok" } });

        const promise = sendWelcomeEmail("user@example.com", "Adam");
        await vi.runAllTimersAsync();
        await promise;

        expect(mockEmailsSend).toHaveBeenCalledTimes(3);
    });
});
