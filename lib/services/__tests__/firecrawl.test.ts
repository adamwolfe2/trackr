import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { FirecrawlService } from "../firecrawl";

function makeFetch(response: { ok: boolean; status?: number; json?: object; text?: string }) {
    return vi.fn().mockResolvedValue({
        ok: response.ok,
        status: response.status ?? (response.ok ? 200 : 500),
        json: () => Promise.resolve(response.json ?? {}),
        text: () => Promise.resolve(response.text ?? ""),
    });
}

describe("FirecrawlService.scrapeUrl", () => {
    let service: FirecrawlService;
    const originalKey = process.env.FIRECRAWL_API_KEY;

    beforeEach(() => {
        process.env.FIRECRAWL_API_KEY = "fc_test_key";
        service = new FirecrawlService();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        process.env.FIRECRAWL_API_KEY = originalKey;
    });

    it("returns error when FIRECRAWL_API_KEY is not set", async () => {
        process.env.FIRECRAWL_API_KEY = "";
        const emptyKeyService = new FirecrawlService();
        const result = await emptyKeyService.scrapeUrl("https://example.com");
        expect(result.success).toBe(false);
        expect(result.error).toContain("FIRECRAWL_API_KEY");
    });

    it("returns success with data on 200 response", async () => {
        vi.stubGlobal("fetch", makeFetch({
            ok: true,
            json: { data: { markdown: "# Hello World", html: "<h1>Hello</h1>" } },
        }));
        const result = await service.scrapeUrl("https://linear.app");
        expect(result.success).toBe(true);
        expect(result.data?.markdown).toBe("# Hello World");
    });

    it("sends correct Authorization header", async () => {
        const mockFetch = makeFetch({ ok: true, json: { data: {} } });
        vi.stubGlobal("fetch", mockFetch);
        await service.scrapeUrl("https://example.com");
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[1].headers.Authorization).toBe("Bearer fc_test_key");
    });

    it("sends correct request body with formats and onlyMainContent", async () => {
        const mockFetch = makeFetch({ ok: true, json: { data: {} } });
        vi.stubGlobal("fetch", mockFetch);
        await service.scrapeUrl("https://example.com");
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.url).toBe("https://example.com");
        expect(body.formats).toContain("markdown");
        expect(body.onlyMainContent).toBe(true);
    });

    it("returns error on non-ok response", async () => {
        vi.stubGlobal("fetch", makeFetch({ ok: false, status: 429, json: { error: "Rate limited" } }));
        const result = await service.scrapeUrl("https://example.com");
        expect(result.success).toBe(false);
        expect(result.error).toContain("429");
    });

    it("returns error when fetch throws", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network timeout")));
        const result = await service.scrapeUrl("https://example.com");
        expect(result.success).toBe(false);
        expect(result.error).toBe("Network timeout");
    });
});

describe("FirecrawlService.mapSite", () => {
    let service: FirecrawlService;
    const originalKey = process.env.FIRECRAWL_API_KEY;

    beforeEach(() => {
        process.env.FIRECRAWL_API_KEY = "fc_test_key";
        service = new FirecrawlService();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        process.env.FIRECRAWL_API_KEY = originalKey;
    });

    it("returns error when no API key", async () => {
        process.env.FIRECRAWL_API_KEY = "";
        const emptyKeyService = new FirecrawlService();
        const result = await emptyKeyService.mapSite("https://example.com");
        expect(result.success).toBe(false);
    });

    it("returns links from data.links format", async () => {
        vi.stubGlobal("fetch", makeFetch({
            ok: true,
            json: { links: ["https://linear.app/pricing", "https://linear.app/features"] },
        }));
        const result = await service.mapSite("https://linear.app");
        expect(result.success).toBe(true);
        expect(result.data).toContain("https://linear.app/pricing");
    });

    it("falls back to data.data format when data.links is absent", async () => {
        vi.stubGlobal("fetch", makeFetch({
            ok: true,
            json: { data: ["https://notion.so/pricing", "https://notion.so/about"] },
        }));
        const result = await service.mapSite("https://notion.so");
        expect(result.success).toBe(true);
        expect(result.data).toContain("https://notion.so/pricing");
    });

    it("returns error on non-ok response", async () => {
        vi.stubGlobal("fetch", makeFetch({ ok: false, status: 403, text: "Forbidden" }));
        const result = await service.mapSite("https://example.com");
        expect(result.success).toBe(false);
        expect(result.error).toContain("403");
    });

    it("returns error when fetch throws", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("DNS error")));
        const result = await service.mapSite("https://example.com");
        expect(result.success).toBe(false);
        expect(result.error).toBe("DNS error");
    });

    it("passes options (limit, search, includeSubdomains) to the request body", async () => {
        const mockFetch = makeFetch({ ok: true, json: { links: [] } });
        vi.stubGlobal("fetch", mockFetch);
        await service.mapSite("https://example.com", { limit: 20, search: "pricing", includeSubdomains: true });
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.limit).toBe(20);
        expect(body.search).toBe("pricing");
        expect(body.includeSubdomains).toBe(true);
    });

    it("uses defaults when no options provided", async () => {
        const mockFetch = makeFetch({ ok: true, json: { links: [] } });
        vi.stubGlobal("fetch", mockFetch);
        await service.mapSite("https://example.com");
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.limit).toBe(50);
        expect(body.includeSubdomains).toBe(false);
        expect(body.ignoreSitemap).toBe(true);
    });
});
