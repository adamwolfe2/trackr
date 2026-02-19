"use server";

import { currentUser } from "@clerk/nextjs/server";

export async function previewTool(url: string) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    if (!url) return { error: "URL is required" };

    try {
        // Ensure protocol
        if (!url.startsWith("http")) {
            url = `https://${url}`;
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

    } catch (error) {
        console.error("Preview error:", error);
        return { error: "Failed to preview URL" };
    }
}
