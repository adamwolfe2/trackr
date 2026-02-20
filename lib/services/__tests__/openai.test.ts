import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock OpenAI before importing OpenAIService
const mockEmbeddingsCreate = vi.fn();
const mockCompletionsCreate = vi.fn();
vi.mock("openai", () => ({
    OpenAI: function OpenAI() {
        return {
            embeddings: {
                create: mockEmbeddingsCreate,
            },
            chat: {
                completions: {
                    create: mockCompletionsCreate,
                },
            },
        };
    },
}));

import { OpenAIService } from "../openai";

describe("OpenAIService", () => {
    let service: OpenAIService;
    const originalKey = process.env.OPENAI_API_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.OPENAI_API_KEY = "test_openai_key";
        service = new OpenAIService();
    });

    afterEach(() => {
        process.env.OPENAI_API_KEY = originalKey;
    });

    describe("generateEmbedding()", () => {
        it("throws when no API key is configured", async () => {
            delete process.env.OPENAI_API_KEY;
            const noKeyService = new OpenAIService();
            await expect(noKeyService.generateEmbedding("test")).rejects.toThrow(
                "OPENAI_API_KEY is not configured"
            );
        });

        it("returns the embedding array from the API", async () => {
            const mockEmbedding = [0.1, 0.2, 0.3, 0.4];
            mockEmbeddingsCreate.mockResolvedValue({
                data: [{ embedding: mockEmbedding }],
            });
            const result = await service.generateEmbedding("test text");
            expect(result).toEqual(mockEmbedding);
        });

        it("calls the API with correct model and encoding format", async () => {
            mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding: [0.5] }] });
            await service.generateEmbedding("hello world");
            expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
                model: "text-embedding-3-small",
                input: "hello world",
                encoding_format: "float",
            });
        });
    });

    describe("analyzeTool()", () => {
        it("throws when no API key is configured", async () => {
            delete process.env.OPENAI_API_KEY;
            const noKeyService = new OpenAIService();
            await expect(noKeyService.analyzeTool("content")).rejects.toThrow(
                "OPENAI_API_KEY is not configured"
            );
        });

        it("returns parsed JSON from the API response", async () => {
            const mockAnalysis = {
                summary: "A project management tool",
                overallScore: 8.5,
                pros: ["Fast", "Intuitive"],
                cons: ["Expensive"],
            };
            mockCompletionsCreate.mockResolvedValue({
                choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
            });
            const result = await service.analyzeTool("Linear homepage content...");
            expect(result.summary).toBe("A project management tool");
            expect(result.overallScore).toBe(8.5);
        });

        it("uses gpt-4o with json_object response format", async () => {
            mockCompletionsCreate.mockResolvedValue({
                choices: [{ message: { content: "{}" } }],
            });
            await service.analyzeTool("content");
            expect(mockCompletionsCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: "gpt-4o",
                    response_format: { type: "json_object" },
                })
            );
        });

        it("throws 'Failed to analyze content' when API call fails", async () => {
            mockCompletionsCreate.mockRejectedValue(new Error("Rate limit exceeded"));
            await expect(service.analyzeTool("content")).rejects.toThrow(
                "Failed to analyze content"
            );
        });

        it("truncates content to 20000 characters before sending", async () => {
            mockCompletionsCreate.mockResolvedValue({
                choices: [{ message: { content: "{}" } }],
            });
            const longContent = "x".repeat(30000);
            await service.analyzeTool(longContent);
            const callArgs = mockCompletionsCreate.mock.calls[0][0];
            const userMessageContent = callArgs.messages[1].content as string;
            // Content is truncated to 20000 chars; allow for the prefix text
            expect(userMessageContent).not.toContain("x".repeat(20001));
        });
    });
});
