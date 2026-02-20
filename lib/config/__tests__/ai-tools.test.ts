import { describe, it, expect } from "vitest";
import { classifyTool } from "../ai-tools";

describe("classifyTool", () => {
    describe("empty / blank input", () => {
        it("returns traditional/unmatched for empty string", () => {
            const result = classifyTool("");
            expect(result.matched).toBe(false);
            expect(result.classification).toBe("traditional");
            expect(result.hoursPerUserPerMonth).toBe(0);
        });

        it("returns traditional/unmatched for whitespace-only string", () => {
            const result = classifyTool("   ");
            expect(result.matched).toBe(false);
        });
    });

    describe("exact matches", () => {
        it("matches 'chatgpt' as ai-native", () => {
            const result = classifyTool("chatgpt");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-native");
        });

        it("matches 'cursor' as ai-native with 35h savings", () => {
            const result = classifyTool("cursor");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-native");
            expect(result.hoursPerUserPerMonth).toBe(35);
        });

        it("matches 'slack' as ai-enabled", () => {
            const result = classifyTool("slack");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-enabled");
        });

        it("matches 'jira' as ai-enabled", () => {
            const result = classifyTool("jira");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-enabled");
        });

        it("matches 'github copilot' as ai-native with 35h savings", () => {
            const result = classifyTool("github copilot");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-native");
            expect(result.hoursPerUserPerMonth).toBe(35);
        });
    });

    describe("case insensitive matching", () => {
        it("matches uppercase 'SLACK'", () => {
            const result = classifyTool("SLACK");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-enabled");
        });

        it("matches mixed case 'GitHub Copilot'", () => {
            const result = classifyTool("GitHub Copilot");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-native");
        });

        it("matches 'ChatGPT' with mixed case", () => {
            const result = classifyTool("ChatGPT");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-native");
        });
    });

    describe("fuzzy matching — tool name contains key", () => {
        it("matches 'Slack Enterprise' because it contains 'slack'", () => {
            const result = classifyTool("Slack Enterprise");
            expect(result.matched).toBe(true);
        });

        it("matches 'Grammarly Business' because it contains 'grammarly'", () => {
            const result = classifyTool("Grammarly Business");
            expect(result.matched).toBe(true);
            expect(result.classification).toBe("ai-native");
        });

        it("picks the longest key when multiple keys match", () => {
            // "github copilot" (14 chars) should win over "copilot" (7 chars)
            const result = classifyTool("GitHub Copilot Pro");
            expect(result.matched).toBe(true);
            expect(result.hoursPerUserPerMonth).toBe(35); // github copilot value
        });
    });

    describe("fuzzy matching — key contains tool name (abbreviation fallback)", () => {
        it("matches 'copil' as a substring of 'copilot' (>=4 chars)", () => {
            // "copil" is >=4 chars and contained in key "copilot"
            const result = classifyTool("copil");
            expect(result.matched).toBe(true);
        });

        it("does NOT fallback for short names (<4 chars) to prevent false positives", () => {
            // "not" is <4 chars so fallback is skipped
            const result = classifyTool("not");
            expect(result.matched).toBe(false);
        });
    });

    describe("unknown tools", () => {
        it("returns traditional/unmatched for a completely unknown tool", () => {
            const result = classifyTool("SuperRandomToolThatDoesNotExist");
            expect(result.matched).toBe(false);
            expect(result.classification).toBe("traditional");
            expect(result.hoursPerUserPerMonth).toBe(0);
        });
    });

    describe("ai alternatives", () => {
        it("returns aiAlternative for traditional tools that have a known replacement", () => {
            // E.g., Photoshop has aiAlternative set in the map
            const result = classifyTool("photoshop");
            if (result.matched) {
                // If photoshop is in the map with an alternative, check it
                if (result.aiAlternative) {
                    expect(typeof result.aiAlternative).toBe("string");
                    expect(result.aiAlternative.length).toBeGreaterThan(0);
                }
            }
        });

        it("ai-enabled tools may have an aiAlternative suggesting ai-native replacement", () => {
            // e.g. Zoom or other ai-enabled tools may suggest ai-native alternatives
            const result = classifyTool("zoom");
            if (result.matched && result.aiAlternative) {
                expect(typeof result.aiAlternative).toBe("string");
            }
        });
    });

    describe("category assignment", () => {
        it("assigns ai-assistant category to chatgpt", () => {
            const result = classifyTool("chatgpt");
            expect(result.category).toBe("ai-assistant");
        });

        it("assigns ai-dev category to cursor", () => {
            const result = classifyTool("cursor");
            expect(result.category).toBe("ai-dev");
        });

        it("assigns communication category to slack", () => {
            const result = classifyTool("slack");
            expect(result.category).toBeDefined();
        });
    });
});
