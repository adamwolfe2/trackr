import { describe, it, expect } from "vitest";
import { parseStackJson } from "../parse-stack";

describe("parseStackJson", () => {
    it("parses a valid JSON array of tools", () => {
        const input = JSON.stringify([
            { toolName: "Notion", category: "productivity", estimatedSeats: 10 },
            { toolName: "Slack", category: "communication" },
        ]);
        const result = parseStackJson(input);
        expect(result.items).toHaveLength(2);
        expect(result.items![0].toolName).toBe("Notion");
        expect(result.items![0].category).toBe("productivity");
        expect(result.items![0].estimatedSeats).toBe(10);
        expect(result.items![1].toolName).toBe("Slack");
    });

    it("strips markdown code fences before parsing", () => {
        const input = "```json\n[{\"toolName\": \"Linear\"}]\n```";
        const result = parseStackJson(input);
        expect(result.items).toHaveLength(1);
        expect(result.items![0].toolName).toBe("Linear");
    });

    it("strips bare code fences without language tag", () => {
        const input = "```\n[{\"toolName\": \"Figma\"}]\n```";
        const result = parseStackJson(input);
        expect(result.items![0].toolName).toBe("Figma");
    });

    it("returns error for invalid JSON", () => {
        const result = parseStackJson("not valid json");
        expect(result.error).toBeDefined();
        expect(result.items).toBeUndefined();
    });

    it("returns error when input is not an array", () => {
        const result = parseStackJson('{"toolName": "Notion"}');
        expect(result.error).toMatch(/array/i);
    });

    it("returns error when no items have toolName", () => {
        const result = parseStackJson('[{"name": "Notion"}]');
        expect(result.error).toMatch(/no valid/i);
    });

    it("filters out items without toolName while keeping valid ones", () => {
        const input = JSON.stringify([
            { toolName: "Valid Tool" },
            { name: "Invalid — no toolName field" },
        ]);
        const result = parseStackJson(input);
        expect(result.items).toHaveLength(1);
        expect(result.items![0].toolName).toBe("Valid Tool");
    });

    it("uses null fallback for missing optional fields", () => {
        const input = JSON.stringify([{ toolName: "Minimal" }]);
        const result = parseStackJson(input);
        expect(result.items![0].category).toBeNull();
        expect(result.items![0].vendorUrl).toBeNull();
        expect(result.items![0].estimatedSeats).toBeNull();
        expect(result.items![0].notes).toBeNull();
    });

    it("defaults billingCycle to 'monthly' when not provided", () => {
        const input = JSON.stringify([{ toolName: "Notion" }]);
        const result = parseStackJson(input);
        expect(result.items![0].billingCycle).toBe("monthly");
    });

    it("preserves billingCycle when provided", () => {
        const input = JSON.stringify([{ toolName: "Notion", billingCycle: "annual" }]);
        const result = parseStackJson(input);
        expect(result.items![0].billingCycle).toBe("annual");
    });
});
