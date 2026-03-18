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

import {
    addContract,
    updateContractTerms,
    getContract,
    deleteContract,
    linkContractToSpend,
    listContracts,
} from "../contracts";
import { db } from "@/lib/db";

const VALID_WS = "550e8400-e29b-41d4-a716-446655440000";
const VALID_CONTRACT_ID = "660e8400-e29b-41d4-a716-446655440001";
const VALID_SPEND_ID = "770e8400-e29b-41d4-a716-446655440002";
const OTHER_WS = "880e8400-e29b-41d4-a716-446655440003";

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

    it("rejects data: URLs", async () => {
        await expect(addContract(VALID_WS, {
            fileName: "test.pdf",
            fileUrl: "data:text/html,<script>alert(1)</script>",
            uploadedBy: "user_1",
        })).rejects.toThrow();
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

    it("blocks access when workspace ID does not match authenticated user", async () => {
        vi.mocked(db.query.workspaceMembers.findFirst).mockResolvedValueOnce({
            workspaceId: OTHER_WS,
        } as never);
        await expect(addContract(VALID_WS, {
            fileName: "test.pdf",
            fileUrl: "https://example.com/test.pdf",
            uploadedBy: "user_1",
        })).rejects.toThrow("Unauthorized");
    });
});

describe("updateContractTerms", () => {
    beforeEach(() => vi.clearAllMocks());

    it("rejects invalid contract ID", async () => {
        await expect(
            updateContractTerms("bad-id", VALID_WS, {})
        ).rejects.toThrow("Invalid contract ID");
    });

    it("rejects invalid workspace ID", async () => {
        await expect(
            updateContractTerms(VALID_CONTRACT_ID, "bad-ws", {})
        ).rejects.toThrow("Invalid workspace ID");
    });

    it("blocks cross-workspace access", async () => {
        vi.mocked(db.query.workspaceMembers.findFirst).mockResolvedValueOnce({
            workspaceId: OTHER_WS,
        } as never);
        await expect(
            updateContractTerms(VALID_CONTRACT_ID, VALID_WS, {})
        ).rejects.toThrow("Unauthorized");
    });

    it("updates terms successfully", async () => {
        const result = await updateContractTerms(VALID_CONTRACT_ID, VALID_WS, {
            renewalDate: "2027-01-01",
            autoRenew: true,
        });
        expect(result.success).toBe(true);
    });
});

describe("getContract", () => {
    beforeEach(() => vi.clearAllMocks());

    it("rejects invalid contract ID format", async () => {
        await expect(getContract("bad-id", VALID_WS)).rejects.toThrow("Invalid contract ID");
    });

    it("rejects invalid workspace ID format", async () => {
        await expect(getContract(VALID_CONTRACT_ID, "bad-ws")).rejects.toThrow("Invalid workspace ID");
    });

    it("throws when contract not found", async () => {
        vi.mocked(db.query.contracts.findFirst).mockResolvedValueOnce(undefined);
        await expect(getContract(VALID_CONTRACT_ID, VALID_WS)).rejects.toThrow("Contract not found");
    });

    it("returns contract when found", async () => {
        const mockContract = { id: VALID_CONTRACT_ID, fileName: "test.pdf" };
        vi.mocked(db.query.contracts.findFirst).mockResolvedValueOnce(mockContract as never);
        const result = await getContract(VALID_CONTRACT_ID, VALID_WS);
        expect(result.id).toBe(VALID_CONTRACT_ID);
    });
});

describe("deleteContract", () => {
    beforeEach(() => vi.clearAllMocks());

    it("rejects invalid contract ID format", async () => {
        await expect(deleteContract("bad-id", VALID_WS)).rejects.toThrow("Invalid contract ID");
    });

    it("rejects invalid workspace ID format", async () => {
        await expect(deleteContract(VALID_CONTRACT_ID, "bad-ws")).rejects.toThrow("Invalid workspace ID");
    });

    it("blocks cross-workspace deletion", async () => {
        vi.mocked(db.query.workspaceMembers.findFirst).mockResolvedValueOnce({
            workspaceId: OTHER_WS,
        } as never);
        await expect(deleteContract(VALID_CONTRACT_ID, VALID_WS)).rejects.toThrow("Unauthorized");
    });

    it("deletes successfully for authorized workspace", async () => {
        const result = await deleteContract(VALID_CONTRACT_ID, VALID_WS);
        expect(result.success).toBe(true);
    });
});

describe("linkContractToSpend", () => {
    beforeEach(() => vi.clearAllMocks());

    it("rejects invalid contract ID", async () => {
        await expect(
            linkContractToSpend("bad-id", VALID_WS, VALID_SPEND_ID)
        ).rejects.toThrow("Invalid contract ID");
    });

    it("rejects invalid workspace ID", async () => {
        await expect(
            linkContractToSpend(VALID_CONTRACT_ID, "bad-ws", VALID_SPEND_ID)
        ).rejects.toThrow("Invalid workspace ID");
    });

    it("rejects invalid software spend ID", async () => {
        await expect(
            linkContractToSpend(VALID_CONTRACT_ID, VALID_WS, "bad-id")
        ).rejects.toThrow("Invalid software spend ID");
    });

    it("throws when spend entry not found in workspace", async () => {
        vi.mocked(db.query.softwareSpend.findFirst).mockResolvedValueOnce(undefined);
        await expect(
            linkContractToSpend(VALID_CONTRACT_ID, VALID_WS, VALID_SPEND_ID)
        ).rejects.toThrow("Software spend entry not found");
    });

    it("links contract to spend successfully", async () => {
        vi.mocked(db.query.softwareSpend.findFirst).mockResolvedValueOnce({ id: VALID_SPEND_ID } as never);
        const result = await linkContractToSpend(VALID_CONTRACT_ID, VALID_WS, VALID_SPEND_ID);
        expect(result.success).toBe(true);
    });
});

describe("listContracts", () => {
    beforeEach(() => vi.clearAllMocks());

    it("rejects invalid workspace ID", async () => {
        await expect(listContracts("bad-ws")).rejects.toThrow("Invalid workspace ID");
    });

    it("blocks cross-workspace listing", async () => {
        vi.mocked(db.query.workspaceMembers.findFirst).mockResolvedValueOnce({
            workspaceId: OTHER_WS,
        } as never);
        await expect(listContracts(VALID_WS)).rejects.toThrow("Unauthorized");
    });

    it("returns contracts for authorized workspace", async () => {
        const mockContracts = [{ id: "c1", fileName: "a.pdf" }, { id: "c2", fileName: "b.pdf" }];
        vi.mocked(db.query.contracts.findMany).mockResolvedValueOnce(mockContracts as never);
        const result = await listContracts(VALID_WS);
        expect(result).toHaveLength(2);
    });
});
