import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import { getAllPosts, getPostBySlug, markdownToHtml } from "../blog";

// Mock fs to avoid filesystem dependency
vi.mock("fs");

const mockFiles = {
  "first-post.md": `---
title: "First Post"
description: "The first post"
date: "2026-02-15"
author: "Test Author"
tags: ["ai", "saas"]
image: "/img/first.png"
---

This is the first post content with some words to test reading time.`,

  "second-post.md": `---
title: "Second Post"
description: "The second post"
date: "2026-02-18"
author: "Another Author"
tags: ["tools"]
---

Second post content here.`,

  "no-frontmatter.md": `Just raw content with no frontmatter at all.`,
};

beforeEach(() => {
  vi.mocked(fs.existsSync).mockReturnValue(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(fs.readdirSync).mockReturnValue(Object.keys(mockFiles) as any);
  vi.mocked(fs.readFileSync).mockImplementation((filepath) => {
    const filename = String(filepath).split("/").pop()!;
    return mockFiles[filename as keyof typeof mockFiles] || "";
  });
});

describe("getAllPosts", () => {
  it("returns posts sorted by date (newest first)", () => {
    const posts = getAllPosts();
    expect(posts.length).toBe(3);
    expect(posts[0].slug).toBe("second-post"); // 2026-02-18
    expect(posts[1].slug).toBe("first-post");  // 2026-02-15
  });

  it("parses frontmatter correctly", () => {
    const posts = getAllPosts();
    const first = posts.find((p) => p.slug === "first-post")!;
    expect(first.title).toBe("First Post");
    expect(first.description).toBe("The first post");
    expect(first.author).toBe("Test Author");
    expect(first.tags).toEqual(["ai", "saas"]);
    expect(first.image).toBe("/img/first.png");
  });

  it("uses defaults for missing frontmatter fields", () => {
    const posts = getAllPosts();
    const noFm = posts.find((p) => p.slug === "no-frontmatter")!;
    expect(noFm.title).toBe("no-frontmatter"); // falls back to slug
    expect(noFm.author).toBe("Trackr Team");
    expect(noFm.tags).toEqual([]);
    expect(noFm.image).toBe("/og.png");
  });

  it("calculates reading time (minimum 1 minute)", () => {
    const posts = getAllPosts();
    for (const post of posts) {
      expect(post.readingTime).toBeGreaterThanOrEqual(1);
    }
  });

  it("returns empty array if blog dir doesn't exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(getAllPosts()).toEqual([]);
  });
});

describe("getPostBySlug", () => {
  it("returns full post with content", () => {
    const post = getPostBySlug("first-post");
    expect(post).not.toBeNull();
    expect(post!.title).toBe("First Post");
    expect(post!.content).toContain("first post content");
  });

  it("returns null for nonexistent slug", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(getPostBySlug("nonexistent")).toBeNull();
  });
});

describe("markdownToHtml", () => {
  it("converts headings", () => {
    expect(markdownToHtml("# Title")).toContain("<h1");
    expect(markdownToHtml("## Subtitle")).toContain("<h2");
    expect(markdownToHtml("### Section")).toContain("<h3");
  });

  it("converts bold and italic", () => {
    const html = markdownToHtml("**bold** and *italic*");
    expect(html).toContain("<strong");
    expect(html).toContain("<em>");
  });

  it("converts links", () => {
    const html = markdownToHtml("[click here](https://example.com)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("click here");
  });

  it("converts unordered lists", () => {
    const html = markdownToHtml("- item one\n- item two");
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain("item one");
  });

  it("converts code blocks", () => {
    const html = markdownToHtml("```\nconst x = 1;\n```");
    expect(html).toContain("<pre");
    expect(html).toContain("<code>");
  });

  it("converts inline code", () => {
    const html = markdownToHtml("Use `npm install` to install");
    expect(html).toContain("<code");
    expect(html).toContain("npm install");
  });

  it("converts horizontal rules", () => {
    expect(markdownToHtml("---")).toContain("<hr");
  });
});
