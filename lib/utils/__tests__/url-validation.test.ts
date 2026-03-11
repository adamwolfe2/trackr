import { describe, it, expect } from "vitest";
import { isPrivateUrl } from "../url-validation";

describe("isPrivateUrl — SSRF protection", () => {
    // ── Should block (private/internal) ──────────────────────────────────────

    it("blocks localhost", () => {
        expect(isPrivateUrl("http://localhost")).toBe(true);
        expect(isPrivateUrl("http://localhost:8080/path")).toBe(true);
    });

    it("blocks 127.0.0.1 loopback", () => {
        expect(isPrivateUrl("http://127.0.0.1")).toBe(true);
        expect(isPrivateUrl("https://127.0.0.1:3000/api")).toBe(true);
    });

    it("blocks 0.0.0.0", () => {
        expect(isPrivateUrl("http://0.0.0.0")).toBe(true);
    });

    it("blocks IPv6 loopback [::1]", () => {
        expect(isPrivateUrl("http://[::1]")).toBe(true);
    });

    it("blocks GCP metadata endpoint", () => {
        expect(isPrivateUrl("http://metadata.google.internal/computeMetadata/v1/")).toBe(true);
    });

    it("blocks .local mDNS hostnames", () => {
        expect(isPrivateUrl("http://myserver.local")).toBe(true);
        expect(isPrivateUrl("https://db.local/admin")).toBe(true);
    });

    it("blocks .internal hostnames", () => {
        expect(isPrivateUrl("http://api.internal/v1")).toBe(true);
        expect(isPrivateUrl("https://service.cluster.internal")).toBe(true);
    });

    it("blocks 10.0.0.0/8 RFC1918 range", () => {
        expect(isPrivateUrl("http://10.0.0.1")).toBe(true);
        expect(isPrivateUrl("http://10.255.255.255")).toBe(true);
        expect(isPrivateUrl("http://10.1.2.3/internal")).toBe(true);
    });

    it("blocks 172.16.0.0/12 RFC1918 range", () => {
        expect(isPrivateUrl("http://172.16.0.1")).toBe(true);
        expect(isPrivateUrl("http://172.31.255.255")).toBe(true);
    });

    it("does not block 172.15.x.x or 172.32.x.x (outside RFC1918)", () => {
        expect(isPrivateUrl("http://172.15.0.1")).toBe(false);
        expect(isPrivateUrl("http://172.32.0.1")).toBe(false);
    });

    it("blocks 192.168.0.0/16 RFC1918 range", () => {
        expect(isPrivateUrl("http://192.168.0.1")).toBe(true);
        expect(isPrivateUrl("http://192.168.100.200/admin")).toBe(true);
    });

    it("blocks 169.254.x.x link-local / AWS instance metadata", () => {
        expect(isPrivateUrl("http://169.254.169.254")).toBe(true); // AWS metadata
        expect(isPrivateUrl("http://169.254.169.254/latest/meta-data/iam/")).toBe(true);
    });

    it("blocks 100.64.x.x–100.127.x.x CGNAT range", () => {
        expect(isPrivateUrl("http://100.64.0.1")).toBe(true);
        expect(isPrivateUrl("http://100.127.255.255")).toBe(true);
    });

    it("does not block 100.63.x.x (just outside CGNAT)", () => {
        expect(isPrivateUrl("http://100.63.0.1")).toBe(false);
    });

    it("blocks 0.x.x.x range", () => {
        expect(isPrivateUrl("http://0.0.0.1")).toBe(true);
    });

    it("blocks multicast range 224.x.x.x+", () => {
        expect(isPrivateUrl("http://224.0.0.1")).toBe(true);
        expect(isPrivateUrl("http://255.255.255.255")).toBe(true);
    });

    it("blocks non-http(s) protocols", () => {
        expect(isPrivateUrl("ftp://example.com")).toBe(true);
        expect(isPrivateUrl("file:///etc/passwd")).toBe(true);
        expect(isPrivateUrl("gopher://example.com")).toBe(true);
        expect(isPrivateUrl("javascript://example.com")).toBe(true);
        expect(isPrivateUrl("data:text/html,<script>alert(1)</script>")).toBe(true);
    });

    it("blocks unparseable/malformed URLs", () => {
        expect(isPrivateUrl("not-a-url")).toBe(true);
        expect(isPrivateUrl("")).toBe(true);
        expect(isPrivateUrl("://no-scheme")).toBe(true);
    });

    // ── Should allow (public internet) ───────────────────────────────────────

    it("allows plain http public URL", () => {
        expect(isPrivateUrl("http://example.com")).toBe(false);
    });

    it("allows https public URL", () => {
        expect(isPrivateUrl("https://github.com/anthropics/claude")).toBe(false);
    });

    it("allows public URL with port", () => {
        expect(isPrivateUrl("https://api.example.com:443/v1")).toBe(false);
    });

    it("allows public IP in valid ranges", () => {
        expect(isPrivateUrl("http://8.8.8.8")).toBe(false);   // Google DNS
        expect(isPrivateUrl("http://1.1.1.1")).toBe(false);   // Cloudflare DNS
    });

    it("allows SaaS product URLs", () => {
        expect(isPrivateUrl("https://notion.so")).toBe(false);
        expect(isPrivateUrl("https://slack.com/intl/en-us/")).toBe(false);
        expect(isPrivateUrl("https://linear.app/pricing")).toBe(false);
    });
});
