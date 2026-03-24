import { NextRequest, NextResponse } from "next/server";
import { getPublicProfile } from "@/lib/actions/public-profile";

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const format = request.nextUrl.searchParams.get("format");

    let data;
    try {
        data = await getPublicProfile(slug);
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    if (!data) {
        return new NextResponse("Profile not found", { status: 404 });
    }

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Script embed format
    if (format === "script") {
        const script = `
(function() {
    var container = document.getElementById('trackr-widget');
    if (!container) return;
    var slug = container.getAttribute('data-slug') || '${escapeHtml(slug)}';
    var height = container.getAttribute('data-height') || '500';
    var iframe = document.createElement('iframe');
    iframe.src = 'https://trytrackr.com/api/embed/' + encodeURIComponent(slug);
    iframe.width = '100%';
    iframe.height = height;
    iframe.frameBorder = '0';
    iframe.style.border = '1px solid #000';
    iframe.style.background = '#F3F3EF';
    container.appendChild(iframe);
})();
`;
        return new NextResponse(script, {
            headers: {
                "Content-Type": "application/javascript",
                "Cache-Control": "public, max-age=300",
                ...corsHeaders,
            },
        });
    }

    // HTML embed format (iframe src)
    const tools = data.tools.slice(0, 5);
    const showScores = data.profile.showScores;

    const toolRows = tools
        .map((t) => {
            const initial = escapeHtml(t.name[0] ?? "?");
            const name = escapeHtml(t.name);
            const score =
                showScores && t.overallScore
                    ? `<span style="font-family:'Geist Mono',monospace;font-size:11px;font-weight:700;">${Number(t.overallScore).toFixed(1)}</span>`
                    : "";
            return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid #000;background:#fff;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:24px;height:24px;border:1px solid #ccc;background:#fafafa;display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:10px;">${initial}</div>
                    <span style="font-family:'Geist Mono',monospace;font-size:12px;">${name}</span>
                </div>
                ${score}
            </div>`;
        })
        .join("");

    const moreTools =
        data.tools.length > 5
            ? `<p style="font-family:'Geist Mono',monospace;font-size:10px;color:#999;text-align:center;margin-top:8px;">+${data.tools.length - 5} more tools</p>`
            : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #F3F3EF; color: #000; padding: 20px; font-family: 'Newsreader', Georgia, serif; }
    </style>
</head>
<body>
    <div style="max-width:480px;margin:0 auto;">
        <!-- Company -->
        <h1 style="font-size:20px;font-weight:400;margin-bottom:4px;">${escapeHtml(data.workspace.name)}</h1>
        ${data.profile.headline ? `<p style="font-family:'Geist Mono',monospace;font-size:11px;color:#666;margin-bottom:16px;">${escapeHtml(data.profile.headline)}</p>` : '<div style="margin-bottom:16px;"></div>'}

        <!-- AI Score -->
        ${
            showScores
                ? `<div style="border:1px solid #000;background:#fff;padding:12px;margin-bottom:16px;">
                <span style="font-family:'Geist Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">AI Nativeness</span>
                <p style="font-size:24px;font-weight:400;">${data.aiNativeness.score}<span style="color:#999;font-size:12px;">/100</span></p>
                <p style="font-family:'Geist Mono',monospace;font-size:11px;color:#666;">${escapeHtml(data.aiNativeness.label)}</p>
            </div>`
                : ""
        }

        <!-- Tools -->
        <div style="margin-bottom:16px;">
            <span style="font-family:'Geist Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#999;display:block;margin-bottom:8px;">Top Tools</span>
            ${toolRows}
            ${moreTools}
        </div>

        <!-- CTA -->
        <div style="text-align:center;padding-top:12px;border-top:1px solid #000;">
            <a href="https://trytrackr.com" target="_blank" rel="noopener" style="font-family:'Geist Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;text-decoration:none;">
                Powered by Trackr
            </a>
        </div>
    </div>
</body>
</html>`;

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html",
            "Cache-Control": "public, max-age=300",
            ...corsHeaders,
        },
    });
}

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
