import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockEmailSend } = vi.hoisted(() => ({
    mockEmailSend: vi.fn().mockResolvedValue({ id: "email_1" }),
}));

vi.mock("resend", () => ({
    Resend: function Resend() {
        return { emails: { send: mockEmailSend } };
    },
}));

import { submitContactForm } from "../contact";

const VALID_INPUT = {
    name: "Adam Wolfe",
    email: "adam@acme.com",
    type: "general" as const,
    message: "Hello, I have a question about Trackr pricing and features.",
};

describe("submitContactForm", () => {
    const originalKey = process.env.RESEND_API_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.RESEND_API_KEY = "test_resend_key";
    });

    afterEach(() => {
        process.env.RESEND_API_KEY = originalKey;
    });

    describe("validation", () => {
        it("returns error when name is empty", async () => {
            const result = await submitContactForm({ ...VALID_INPUT, name: "" });
            expect(result.success).toBe(false);
            expect(result.error).toContain("Name is required");
        });

        it("returns error when email is invalid", async () => {
            const result = await submitContactForm({ ...VALID_INPUT, email: "not-an-email" });
            expect(result.success).toBe(false);
            expect(result.error).toContain("email");
        });

        it("returns error when message is too short (under 10 chars)", async () => {
            const result = await submitContactForm({ ...VALID_INPUT, message: "Too short" });
            expect(result.success).toBe(false);
            expect(result.error).toContain("10 characters");
        });

        it("returns error when message exceeds 2000 characters", async () => {
            const result = await submitContactForm({ ...VALID_INPUT, message: "x".repeat(2001) });
            expect(result.success).toBe(false);
        });
    });

    describe("email sending", () => {
        it("returns success without sending email when RESEND_API_KEY is not set", async () => {
            delete process.env.RESEND_API_KEY;
            const result = await submitContactForm(VALID_INPUT);
            expect(result.success).toBe(true);
            expect(mockEmailSend).not.toHaveBeenCalled();
        });

        it("sends email to hello@trytrackr.com with replyTo set to submitter", async () => {
            const result = await submitContactForm(VALID_INPUT);
            expect(result.success).toBe(true);
            expect(mockEmailSend).toHaveBeenCalledTimes(1);
            const call = mockEmailSend.mock.calls[0][0];
            expect(call.to).toBe("hello@trytrackr.com");
            expect(call.replyTo).toBe("adam@acme.com");
        });

        it("labels subject correctly for sales type", async () => {
            await submitContactForm({ ...VALID_INPUT, type: "sales" });
            const call = mockEmailSend.mock.calls[0][0];
            expect(call.subject).toContain("Sales / Enterprise");
            expect(call.subject).toContain("Adam Wolfe");
        });

        it("labels subject correctly for support type", async () => {
            await submitContactForm({ ...VALID_INPUT, type: "support" });
            const call = mockEmailSend.mock.calls[0][0];
            expect(call.subject).toContain("Support");
        });

        it("returns error with fallback instructions when Resend throws", async () => {
            mockEmailSend.mockRejectedValueOnce(new Error("Rate limit exceeded"));
            const result = await submitContactForm(VALID_INPUT);
            expect(result.success).toBe(false);
            expect(result.error).toContain("hello@trytrackr.com");
        });
    });
});
