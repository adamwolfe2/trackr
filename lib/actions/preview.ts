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

        // Block private IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x)
        const parts = hostname.split(".").map(Number);
        if (parts.length === 4 && parts.every(p => !isNaN(p))) {
            const firstOctet = parts[0];
            if (firstOctet === 10) return true;
            if (firstOctet === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
            if (firstOctet === 192 && parts[1] === 168) return true;
            if (firstOctet === 169 && parts[1] === 254) return true; // AWS metadata
            if (firstOctet === 0) return true;
            if (firstOctet >= 224) return true; // Multicast (224-239) + Reserved (240-255)
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
