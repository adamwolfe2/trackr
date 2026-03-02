/**
 * Server-side markdown-to-React renderer.
 * Handles inline [text](url) links, strips # headings, and filters page-nav noise.
 */

// Lines that are clearly scraped UI chrome — skip them entirely
const NOISE_RE = /^(sort by|similarity|highest rated|most reviews?|sponsored|log\s?in|get started|show more details?|pricing|compare|write a review|filter by|sign up|sign in|try for free|free trial|view pricing|back to top)$/i;

type Segment = { type: "text"; value: string } | { type: "link"; text: string; href: string };

function parseInline(raw: string): Segment[] {
    const segments: Segment[] = [];
    const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRe.exec(raw)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: "text", value: raw.slice(lastIndex, match.index) });
        }
        segments.push({ type: "link", text: match[1], href: match[2] });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < raw.length) {
        segments.push({ type: "text", value: raw.slice(lastIndex) });
    }
    return segments;
}

function renderSegments(segments: Segment[], key: number) {
    return (
        <span key={key}>
            {segments.map((seg, i) =>
                seg.type === "link" ? (
                    <a
                        key={i}
                        href={seg.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-black text-neutral-600"
                    >
                        {seg.text}
                    </a>
                ) : (
                    <span key={i}>{seg.value}</span>
                )
            )}
        </span>
    );
}

/** Render a text field that may contain markdown links, #-headers, and noise lines */
export function MarkdownText({ text, className = "font-mono text-xs text-neutral-600 leading-relaxed" }: {
    text: string;
    className?: string;
}) {
    const paragraphs: React.ReactNode[] = [];
    let buffer: Segment[][] = [];

    const flush = () => {
        if (buffer.length === 0) return;
        paragraphs.push(
            <p key={paragraphs.length} className={className}>
                {buffer.map((segs, i) => (
                    <span key={i}>
                        {renderSegments(segs, i)}
                        {i < buffer.length - 1 ? " " : null}
                    </span>
                ))}
            </p>
        );
        buffer = [];
    };

    for (const rawLine of text.split("\n")) {
        // Strip leading # heading markers
        const line = rawLine.replace(/^#{1,3}\s*/, "").trim();

        // Skip empty lines — flush current paragraph
        if (!line) {
            flush();
            continue;
        }

        // Skip noise
        if (NOISE_RE.test(line)) continue;

        // Skip "KEY:" header lines like "COMPETITOR ANALYSIS:" — they duplicate our section labels
        if (/^[A-Z][A-Z\s]+:$/.test(line)) continue;

        // Skip very short lines that are likely nav/label fragments (≤ 2 words, no punctuation)
        const wordCount = line.split(/\s+/).length;
        if (wordCount <= 2 && !/[.,;:()\-]/.test(line) && !/https?:\/\//.test(line)) continue;

        buffer.push(parseInline(line));
    }
    flush();

    return <>{paragraphs}</>;
}

/** Parse a block that contains "[Title](url):\nsnippet..." into clean source cards */
export function SourceCards({ text }: { text: string }) {
    // Extract all [Title](url) with optional colon and following snippet
    const cardRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\):?/g;
    const cards: Array<{ title: string; href: string; hostname: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = cardRe.exec(text)) !== null) {
        let hostname = match[2];
        try { hostname = new URL(match[2]).hostname.replace("www.", ""); } catch { /* keep raw */ }
        cards.push({ title: match[1], href: match[2], hostname });
    }

    if (cards.length === 0) return null;

    return (
        <div className="space-y-1">
            {cards.map((card, i) => (
                <a
                    key={i}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 border border-black hover:bg-neutral-100 transition-colors group"
                >
                    <span className="font-mono text-xs truncate flex-1 group-hover:underline">{card.title}</span>
                    <span className="font-mono text-[10px] text-neutral-400 flex-shrink-0 ml-3">{card.hostname}</span>
                </a>
            ))}
        </div>
    );
}

/**
 * Renders the `competitorAnalysis` field — extracts the summary paragraph and
 * turns the markdown source links into clean clickable cards.
 */
export function CompetitorAnalysisBlock({ text }: { text: string }) {
    // Pull the narrative summary (everything before the first markdown link or "COMPETITOR SOURCES:")
    const firstLinkIdx = text.indexOf("[");
    const sourcesIdx = text.toUpperCase().indexOf("COMPETITOR SOURCES:");
    const splitAt = Math.min(
        firstLinkIdx !== -1 ? firstLinkIdx : Infinity,
        sourcesIdx !== -1 ? sourcesIdx : Infinity
    );

    const analysisText = splitAt !== Infinity ? text.slice(0, splitAt).trim() : text.trim();
    const hasLinks = /\[([^\]]+)\]\(https?:\/\//.test(text);

    return (
        <div className="space-y-3">
            {analysisText && (
                <MarkdownText text={analysisText} />
            )}
            {hasLinks && (
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Sources</p>
                    <SourceCards text={text} />
                </div>
            )}
        </div>
    );
}
