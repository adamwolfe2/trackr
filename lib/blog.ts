import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image: string;
  readingTime: number; // minutes
}

export interface BlogPost extends BlogPostMeta {
  content: string; // raw markdown body (no frontmatter)
}

// ---------------------------------------------------------------------------
// Frontmatter parser (regex-based, zero dependencies)
// ---------------------------------------------------------------------------

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

function parseFrontmatter(raw: string): { data: Record<string, string | string[]>; content: string } {
  const match = raw.match(FRONTMATTER_REGEX);
  if (!match) {
    return { data: {}, content: raw };
  }

  const frontmatterBlock = match[1];
  const content = raw.slice(match[0].length).trim();
  const data: Record<string, string | string[]> = {};

  for (const line of frontmatterBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse YAML-style arrays: ["a", "b", "c"]
    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1);
      data[key] = inner
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = value;
    }
  }

  return { data, content };
}

// ---------------------------------------------------------------------------
// Reading time estimator
// ---------------------------------------------------------------------------

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 230));
}

// ---------------------------------------------------------------------------
// Blog directory
// ---------------------------------------------------------------------------

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns all blog posts sorted by date (newest first).
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  const posts: BlogPostMeta[] = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
    const { data, content } = parseFrontmatter(raw);

    return {
      slug,
      title: (data.title as string) || slug,
      description: (data.description as string) || "",
      date: (data.date as string) || "1970-01-01",
      author: (data.author as string) || "Trackr Team",
      tags: Array.isArray(data.tags) ? data.tags : [],
      image: (data.image as string) || "/og.png",
      readingTime: estimateReadingTime(content),
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Returns a single blog post by slug, including the full markdown content.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const extensions = [".md", ".mdx"];

  for (const ext of extensions) {
    const filepath = path.join(BLOG_DIR, `${slug}${ext}`);
    if (fs.existsSync(filepath)) {
      const raw = fs.readFileSync(filepath, "utf-8");
      const { data, content } = parseFrontmatter(raw);

      return {
        slug,
        title: (data.title as string) || slug,
        description: (data.description as string) || "",
        date: (data.date as string) || "1970-01-01",
        author: (data.author as string) || "Trackr Team",
        tags: Array.isArray(data.tags) ? data.tags : [],
        image: (data.image as string) || "/og.png",
        readingTime: estimateReadingTime(content),
        content,
      };
    }
  }

  return null;
}

/**
 * Returns all slugs (for generateStaticParams).
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

// ---------------------------------------------------------------------------
// Simple Markdown to HTML converter
// ---------------------------------------------------------------------------

/**
 * Converts basic markdown to HTML. Supports:
 * - Headings (h1-h4)
 * - Paragraphs
 * - Bold and italic
 * - Links
 * - Unordered and ordered lists
 * - Inline code
 * - Code blocks
 * - Horizontal rules
 */
export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const htmlParts: string[] = [];
  let inList = false;
  let listType: "ul" | "ol" = "ul";
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        htmlParts.push(`<pre class="bg-black text-white p-4 border border-black font-mono text-sm overflow-x-auto my-4"><code>${codeBlockContent.join("\n")}</code></pre>`);
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(escapeHtml(line));
      continue;
    }

    // Close list if current line isn't a list item
    if (inList && !line.trim().match(/^[-*]\s/) && !line.trim().match(/^\d+\.\s/) && line.trim() !== "") {
      htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
      inList = false;
    }

    const trimmed = line.trim();

    // Empty line
    if (trimmed === "") {
      if (inList) {
        htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
        inList = false;
      }
      continue;
    }

    // Horizontal rule
    if (trimmed.match(/^[-*_]{3,}$/)) {
      htmlParts.push('<hr class="border-t border-black/10 my-8" />');
      continue;
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      htmlParts.push(`<h4 class="text-base font-serif font-normal mt-6 mb-2">${inlineFormat(trimmed.slice(5))}</h4>`);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      htmlParts.push(`<h3 class="text-lg font-serif font-normal mt-8 mb-3">${inlineFormat(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      htmlParts.push(`<h2 class="text-2xl font-serif font-normal mt-12 mb-4">${inlineFormat(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      htmlParts.push(`<h1 class="text-3xl font-serif font-normal mt-12 mb-4">${inlineFormat(trimmed.slice(2))}</h1>`);
      continue;
    }

    // Unordered list items
    if (trimmed.match(/^[-*]\s/)) {
      if (!inList || listType !== "ul") {
        if (inList) htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
        htmlParts.push('<ul class="list-disc list-outside ml-6 my-4 space-y-1 font-mono text-sm text-neutral-700">');
        inList = true;
        listType = "ul";
      }
      htmlParts.push(`<li class="leading-relaxed">${inlineFormat(trimmed.replace(/^[-*]\s/, ""))}</li>`);
      continue;
    }

    // Ordered list items
    if (trimmed.match(/^\d+\.\s/)) {
      if (!inList || listType !== "ol") {
        if (inList) htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
        htmlParts.push('<ol class="list-decimal list-outside ml-6 my-4 space-y-1 font-mono text-sm text-neutral-700">');
        inList = true;
        listType = "ol";
      }
      htmlParts.push(`<li class="leading-relaxed">${inlineFormat(trimmed.replace(/^\d+\.\s/, ""))}</li>`);
      continue;
    }

    // Regular paragraph
    htmlParts.push(`<p class="font-mono text-sm text-neutral-700 leading-relaxed mb-4">${inlineFormat(trimmed)}</p>`);
  }

  // Close any open list
  if (inList) {
    htmlParts.push(listType === "ul" ? "</ul>" : "</ol>");
  }

  return htmlParts.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Handles inline formatting: bold, italic, links, inline code.
 * Text is HTML-escaped first to prevent XSS; inline code is processed
 * before bold/italic to protect its content from nested regex passes.
 */
function inlineFormat(text: string): string {
  // 1. Escape HTML special characters FIRST to prevent XSS
  let result = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Inline code FIRST — protects its content from other regex passes
  result = result.replace(
    /`([^`]+)`/g,
    (_, code) => `<code class="bg-black/5 border border-black/10 px-1.5 py-0.5 font-mono text-xs">${code}</code>`
  );

  // 3. Links: [text](url) — validate URL to block javascript: and data: URIs
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, linkText, url) => {
      const safeUrl = /^(https?:\/\/|\/|#)/.test(url.trim()) ? url.trim() : "#";
      return `<a href="${safeUrl}" class="underline underline-offset-2 hover:text-black text-neutral-900 font-medium" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    }
  );

  // 4. Bold + italic: ***text*** or ___text___
  result = result.replace(/\*{3}([^*]+)\*{3}/g, "<strong><em>$1</em></strong>");
  result = result.replace(/_{3}([^_]+)_{3}/g, "<strong><em>$1</em></strong>");

  // 5. Bold: **text** or __text__
  result = result.replace(/\*{2}([^*]+)\*{2}/g, '<strong class="text-black font-semibold">$1</strong>');
  result = result.replace(/_{2}([^_]+)_{2}/g, '<strong class="text-black font-semibold">$1</strong>');

  // 6. Italic: *text* or _text_
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/\b_([^_]+)_\b/g, "<em>$1</em>");

  return result;
}
