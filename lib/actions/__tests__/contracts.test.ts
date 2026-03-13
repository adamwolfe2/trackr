import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn().mockResolvedValue({ id: "user_1" }),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            workspaceMembers: {
                findFirst: vi.fn().mockResolvedValue({ workspaceId: "550e8400-e29b-41d4-a716-446655440000" }),
            },
            contracts: { findFirst: vi.fn(), findMany: vi.fn() },
            softwareSpend: { findFirst: vi.fn(), findMany: vi.fn() },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: "contract_1" }]),
            }),
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        }),
        delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
        }),
    },
}));

import { addContract } from "../contracts";

const VALID_WS = "550e8400-e29b-41d4-a716-446655440000";

describe("addContract", () => {
    beforeEach(() => vi.clearAllMocks());

    it("rejects invalid workspace ID", async () => {
        await expect(addContract("not-a-uuid", {
            fileName: "test.pdf",
            fileUrl: "https://example.com/test.pdf",
            uploadedBy: "user_1",
        })).rejects.toThrow("Invalid workspace ID");
    });

    it("rejects empty file name", async () => {
        await expect(addContract(VALID_WS, {
            fileName: "",
            fileUrl: "https://example.com/test.pdf",
            uploadedBy: "user_1",
        })).rejects.toThrow("File name is required");
    });

    it("rejects file name over 500 characters", async () => {
        await expect(addContract(VALID_WS, {
            fileName: "a".repeat(501),
            fileUrl: "https://example.com/test.pdf",
            uploadedBy: "user_1",
        })).rejects.toThrow("File name is required");
    });

    it("rejects empty file URL", async () => {
        await expect(addContract(VALID_WS, {
            fileName: "test.pdf",
            fileUrl: "",
            uploadedBy: "user_1",
        })).rejects.toThrow("File URL is required");
    });

    it("rejects javascript: URLs", async () => {
        await expect(addContract(VALID_WS, {
            fileName: "test.pdf",
            fileUrl: "javascript:alert(1)",
            uploadedBy: "user_1",
        })).rejects.toThrow();
    });

    it("rejects file:// URLs", async () => {
        await expect(addContract(VALID_WS, {
            fileName: "test.pdf",
            fileUrl: "file:///etc/passwd",
            uploadedBy: "user_1",
        })).rejects.toThrow();
    });

    it("rejects http:// URLs (only HTTPS allowed)", async () => {
        await expect(addContract(VALID_WS, {
            fileName: "test.pdf",
            fileUrl: "http://example.com/test.pdf",
            uploadedBy: "user_1",
        })).rejects.toThrow("Only HTTPS");
    });

    it("accepts valid https:// URLs", async () => {
        const result = await addContract(VALID_WS, {
            fileName: "test.pdf",
            fileUrl: "https://storage.example.com/test.pdf",
            uploadedBy: "user_1",
        });
        expect(result.success).toBe(true);
    });

    it("rejects invalid softwareSpendId format", async () => {
        await expect(addContract(VALID_WS, {
            fileName: "test.pdf",
            fileUrl: "https://example.com/test.pdf",
            softwareSpendId: "not-a-uuid",
            uploadedBy: "user_1",
        })).rejects.toThrow("Invalid software spend ID");
    });
});
