import { describe, it, expect } from "vitest";
import { getToolDomain, getToolLogoUrls } from "../tool-logos";

describe("getToolDomain", () => {
    it("resolves 'Microsoft Teams' to 'microsoft.com'", () => {
        expect(getToolDomain("Microsoft Teams")).toBe("microsoft.com");
    });

    it("resolves 'Adobe Creative Cloud' to 'adobe.com'", () => {
        expect(getToolDomain("Adobe Creative Cloud")).toBe("adobe.com");
    });

    it("resolves 'Azure' to 'azure.microsoft.com'", () => {
        expect(getToolDomain("Azure")).toBe("azure.microsoft.com");
    });

    it("uses domain hint when provided, overriding lookup", () => {
        expect(getToolDomain("Slack", "custom-slack.example.com")).toBe("custom-slack.example.com");
    });

    it("falls back to slugified .com for unknown tools", () => {
        expect(getToolDomain("My Custom Tool")).toBe("mycustomtool.com");
    });

    it("strips special characters from unknown tool fallback", () => {
        expect(getToolDomain("Tool! @#With Chars")).toBe("toolwithchars.com");
    });

    it("is case insensitive: 'SLACK' resolves to 'slack.com'", () => {
        expect(getToolDomain("SLACK")).toBe("slack.com");
    });

    it("is case insensitive: 'HubSpot' resolves to 'hubspot.com'", () => {
        expect(getToolDomain("HubSpot")).toBe("hubspot.com");
    });

    it("handles whitespace trimming", () => {
        expect(getToolDomain("  slack  ")).toBe("slack.com");
    });

    it("returns domain hint even for known tools", () => {
        expect(getToolDomain("Slack", "my-slack.com")).toBe("my-slack.com");
    });

    it("ignores null domain hint", () => {
        expect(getToolDomain("Slack", null)).toBe("slack.com");
    });
});

describe("getToolLogoUrls", () => {
    it("returns correct Clearbit + Google favicon URLs for known tool", () => {
        const result = getToolLogoUrls("Slack");
        expect(result.src).toBe("https://logo.clearbit.com/slack.com");
        expect(result.fallbackSrc).toBe("https://www.google.com/s2/favicons?sz=64&domain=slack.com");
    });

    it("uses domain hint for URLs", () => {
        const result = getToolLogoUrls("Custom", "custom.dev");
        expect(result.src).toBe("https://logo.clearbit.com/custom.dev");
        expect(result.fallbackSrc).toBe("https://www.google.com/s2/favicons?sz=64&domain=custom.dev");
    });

    it("uses slugified fallback for unknown tool", () => {
        const result = getToolLogoUrls("Unknown Tool");
        expect(result.src).toBe("https://logo.clearbit.com/unknowntool.com");
        expect(result.fallbackSrc).toBe("https://www.google.com/s2/favicons?sz=64&domain=unknowntool.com");
    });

    it("handles tools with subdomains correctly", () => {
        const result = getToolLogoUrls("Google Analytics");
        expect(result.src).toBe("https://logo.clearbit.com/analytics.google.com");
    });
});
