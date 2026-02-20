import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@ai-sdk/openai", () => ({
    openai: Object.assign(vi.fn().mockReturnValue("gpt-4o-mini"), {
        embedding: vi.fn().mockReturnValue("text-embedding-3-small"),
    }),
}));

vi.mock("ai", () => ({
    embed: vi.fn(),
}));

import { embed } from "ai";
import { generateEmbedding } from "../embedding";

describe("generateEmbedding", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns a non-empty number array on success", async () => {
        const mockEmbedding = Array.from({ length: 1536 }, (_, i) => i * 0.001);
        (embed as ReturnType<typeof vi.fn>).mockResolvedValue({ embedding: mockEmbedding });

        const result = await generateEmbedding("hello world");
        expect(result).toHaveLength(1536);
        expect(typeof result[0]).toBe("number");
    });

    it("normalizes newlines in the input text", async () => {
        (embed as ReturnType<typeof vi.fn>).mockResolvedValue({ embedding: [0.1, 0.2] });
        await generateEmbedding("line1\nline2\nline3");
        const callArgs = (embed as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(callArgs.value).toBe("line1 line2 line3");
    });

    it("throws when the returned embedding is empty", async () => {
        (embed as ReturnType<typeof vi.fn>).mockResolvedValue({ embedding: [] });
        await expect(generateEmbedding("test")).rejects.toThrow("Empty embedding returned");
    });

    it("throws when the returned embedding is undefined", async () => {
        (embed as ReturnType<typeof vi.fn>).mockResolvedValue({ embedding: undefined });
        await expect(generateEmbedding("test")).rejects.toThrow("Empty embedding returned");
    });

    it("propagates errors thrown by embed()", async () => {
        (embed as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API rate limit exceeded"));
        await expect(generateEmbedding("test")).rejects.toThrow("API rate limit exceeded");
    });
});
