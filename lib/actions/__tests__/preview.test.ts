import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

import { currentUser } from "@clerk/nextjs/server";
import { previewTool, previewToolInternal } from "../preview";

const MOCK_USER = { id: "user_1" };

function mockFetch(html: string, status = 200) {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? "OK" : "Not Found",
        text: () => Promise.resolve(html),
    }));
}

describe("previewTool (auth guard)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns error when not logged in", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await previewTool("https://example.com");
        expect(result).toEqual({ error: "Unauthorized" });
    });

    it("calls previewToolInternal when authenticated", async () => {
        mockFetch("<html><title>Test</title></html>");
        const result = await previewTool("https://example.com");
        expect(result).not.toHaveProperty("error", "Unauthorized");
    });
});

describe("previewToolInternal — SSRF protection", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns error for empty URL", async () => {
        const result = await previewToolInternal("");
        expect(result).toEqual({ error: "URL is required" });
    });

    it("blocks localhost", async () => {
        const result = await previewToolInternal("http://localhost/admin");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks 127.0.0.1", async () => {
        const result = await previewToolInternal("http://127.0.0.1:8080");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks 0.0.0.0", async () => {
        const result = await previewToolInternal("http://0.0.0.0");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks [::1] (IPv6 loopback)", async () => {
        const result = await previewToolInternal("http://[::1]");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks *.local hostnames", async () => {
        const result = await previewToolInternal("http://myserver.local");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks *.internal hostnames", async () => {
        const result = await previewToolInternal("http://db.internal");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks metadata.google.internal (GCP metadata endpoint)", async () => {
        const result = await previewToolInternal("http://metadata.google.internal/computeMetadata/v1/");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks 10.x.x.x (private range)", async () => {
        const result = await previewToolInternal("http://10.0.0.1");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks 172.16.x.x (private range)", async () => {
        const result = await previewToolInternal("http://172.16.0.1");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks 192.168.x.x (private range)", async () => {
        const result = await previewToolInternal("http://192.168.1.1");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("blocks 169.254.x.x (AWS metadata / link-local)", async () => {
        const result = await previewToolInternal("http://169.254.169.254/latest/meta-data/");
        expect(result).toEqual({ error: "Invalid URL" });
    });

    it("does not allow ftp:// to fetch successfully (gets https-prefixed, fetch fails)", async () => {
        // ftp:// doesn't start with "http" so code prepends https://, making it an unparseable URL
        // that fetch rejects — end result is an error, not a successful preview
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Invalid URL")));
        const result = await previewToolInternal("ftp://example.com/file.txt");
        expect(result).toHaveProperty("error");
    });

    it("does not allow javascript: to fetch successfully", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Invalid URL")));
        const result = await previewToolInternal("javascript:alert(1)");
        expect(result).toHaveProperty("error");
    });

    it("allows public IPs through", async () => {
        mockFetch("<html><title>Public</title></html>");
        const result = await previewToolInternal("http://8.8.8.8");
        expect(result).not.toEqual({ error: "Invalid URL" });
    });
});

describe("previewToolInternal — URL normalization", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("prepends https:// when no protocol given", async () => {
        mockFetch("<html><title>Test Site</title></html>");
        const result = await previewToolInternal("example.com");
        // Should not get SSRF error — it fetched the public URL
        expect(result).not.toHaveProperty("error", "Invalid URL");
    });
});

describe("previewToolInternal — HTML metadata extraction", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("extracts title from <title> tag", async () => {
        mockFetch(`<html><head><title>Linear — Project Management</title></head></html>`);
        const result = await previewToolInternal("https://linear.app") as { title: string };
        expect(result.title).toBe("Linear — Project Management");
    });

    it("extracts meta description", async () => {
        mockFetch(`<html><head>
          <meta name="description" content="The issue tracker for modern teams" />
        </head></html>`);
        const result = await previewToolInternal("https://linear.app") as { description: string };
        expect(result.description).toBe("The issue tracker for modern teams");
    });

    it("extracts og:image", async () => {
        mockFetch(`<html><head>
          <meta property="og:image" content="https://linear.app/og.png" />
        </head></html>`);
        const result = await previewToolInternal("https://linear.app") as { image: string };
        expect(result.image).toBe("https://linear.app/og.png");
    });

    it("returns empty strings when meta tags are absent", async () => {
        mockFetch(`<html><body>No metadata here</body></html>`);
        const result = await previewToolInternal("https://example.com") as { title: string; description: string; image: string };
        expect(result.title).toBe("");
        expect(result.description).toBe("");
        expect(result.image).toBe("");
    });

    it("returns the normalized url in result", async () => {
        mockFetch(`<html><title>Test</title></html>`);
        const result = await previewToolInternal("https://example.com/page") as { url: string };
        expect(result.url).toBe("https://example.com/page");
    });
});

describe("previewToolInternal — fetch error handling", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns error when fetch returns non-ok status", async () => {
        mockFetch("Not Found", 404);
        const result = await previewToolInternal("https://example.com/notfound");
        expect(result).toHaveProperty("error");
        expect((result as { error: string }).error).toContain("Failed to fetch");
    });

    it("returns error when fetch throws (network error)", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
        const result = await previewToolInternal("https://example.com");
        expect(result).toEqual({ error: "Failed to preview URL" });
    });
});
