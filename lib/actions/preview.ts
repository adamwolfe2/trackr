"use server";

import { currentUser } from "@clerk/nextjs/server";

/**
 * Validate a URL is not targeting internal/private network addresses (SSRF protection).
 */
function isPrivateUrl(urlString: string): boolean {
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
        return true; // If URL can't be parsed, block it
    }
}

/**
 * Internal preview implementation — no auth check.
 * Called by previewTool (client-facing server action) and server-side API routes.
 */
export async function previewToolInternal(url: string) {
    if (!url) return { error: "URL is required" };

    try {
        // Ensure protocol
        if (!url.startsWith("http")) {
            url = `https://${url}`;
        }

        // SSRF protection: block internal/private URLs
        if (isPrivateUrl(url)) {
            return { error: "Invalid URL" };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "TrackrBot/1.0 (Compatible; +https://trackr.app)"
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return { error: `Failed to fetch URL: ${response.statusText}` };
        }

        const html = await response.text();

        // Simple Regex Extraction
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : "";

        // Meta Description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/i) ||
            html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["'][^>]*>/i);
        const description = descMatch ? descMatch[1] : "";

        // OG Image
        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["'][^>]*>/i);
        const image = imageMatch ? imageMatch[1] : "";

        return {
            title: title.trim(),
            description: description.trim(),
            image: image.trim(),
            url // Normalized URL
        };

    } catch {
        return { error: "Failed to preview URL" };
    }
}

/**
 * Client-facing server action with auth check.
 * This is the function that client components should import.
 */
export async function previewTool(url: string) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };
    return previewToolInternal(url);
}
