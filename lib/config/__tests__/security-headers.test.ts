import { describe, it, expect } from "vitest";
import { SECURITY_HEADERS, HSTS_HEADER } from "../security-headers";

describe("SECURITY_HEADERS", () => {
    it("includes X-Frame-Options SAMEORIGIN", () => {
        const header = SECURITY_HEADERS.find(h => h.key === "X-Frame-Options");
        expect(header).toBeDefined();
        expect(header?.value).toBe("SAMEORIGIN");
    });

    it("includes X-Content-Type-Options nosniff", () => {
        const header = SECURITY_HEADERS.find(h => h.key === "X-Content-Type-Options");
        expect(header).toBeDefined();
        expect(header?.value).toBe("nosniff");
    });

    it("includes X-XSS-Protection", () => {
        const header = SECURITY_HEADERS.find(h => h.key === "X-XSS-Protection");
        expect(header).toBeDefined();
        expect(header?.value).toBe("1; mode=block");
    });

    it("includes Referrer-Policy strict-origin-when-cross-origin", () => {
        const header = SECURITY_HEADERS.find(h => h.key === "Referrer-Policy");
        expect(header).toBeDefined();
        expect(header?.value).toBe("strict-origin-when-cross-origin");
    });

    it("includes Permissions-Policy disabling camera, mic, geolocation", () => {
        const header = SECURITY_HEADERS.find(h => h.key === "Permissions-Policy");
        expect(header).toBeDefined();
        expect(header?.value).toContain("camera=()");
        expect(header?.value).toContain("microphone=()");
        expect(header?.value).toContain("geolocation=()");
    });

    it("does not include HSTS (that is in HSTS_HEADER, not SECURITY_HEADERS)", () => {
        const headers = SECURITY_HEADERS as ReadonlyArray<{ key: string; value: string }>;
        const header = headers.find(h => h.key === "Strict-Transport-Security");
        expect(header).toBeUndefined();
    });
});

describe("HSTS_HEADER", () => {
    it("has Strict-Transport-Security key", () => {
        expect(HSTS_HEADER.key).toBe("Strict-Transport-Security");
    });

    it("has max-age of at least 1 year", () => {
        const match = HSTS_HEADER.value.match(/max-age=(\d+)/);
        expect(match).toBeTruthy();
        const maxAge = parseInt(match![1], 10);
        expect(maxAge).toBeGreaterThanOrEqual(31536000); // 1 year
    });

    it("includes includeSubDomains", () => {
        expect(HSTS_HEADER.value).toContain("includeSubDomains");
    });
});
