/**
 * Shared URL security utilities — imported by preview.ts and research.ts.
 * Keeps SSRF protection in one place so both paths stay in sync.
 */

/**
 * Returns true if the URL targets a private/internal address that should
 * never be fetched server-side (SSRF protection).
 * Blocks: loopback, RFC1918, link-local, cloud metadata endpoints,
 * multicast/reserved ranges, and non-http(s) protocols.
 */
export function isPrivateUrl(urlString: string): boolean {
    try {
        const parsed = new URL(urlString);
        const hostname = parsed.hostname.toLowerCase();

        // Block private/internal hostnames
        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "0.0.0.0" ||
            hostname === "[::1]" ||
            hostname === "metadata.google.internal" ||
            hostname.endsWith(".local") ||
            hostname.endsWith(".internal")
        ) return true;

        // Block private/reserved IP ranges
        const parts = hostname.split(".").map(Number);
        if (parts.length === 4 && parts.every(p => !isNaN(p))) {
            const [first, second] = parts;
            if (first === 10) return true;                                      // 10.0.0.0/8
            if (first === 172 && second >= 16 && second <= 31) return true;     // 172.16.0.0/12
            if (first === 192 && second === 168) return true;                   // 192.168.0.0/16
            if (first === 169 && second === 254) return true;                   // Link-local / AWS metadata
            if (first === 100 && second >= 64 && second <= 127) return true;    // CGNAT 100.64.0.0/10
            if (first === 0) return true;                                       // 0.0.0.0/8
            if (first >= 224) return true;                                      // Multicast + Reserved
        }

        // Block non-http(s) protocols
        if (!["http:", "https:"].includes(parsed.protocol)) return true;

        return false;
    } catch {
        return true; // Unparseable URL → block it
    }
}
