import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function scoreColor(score: number): string {
    if (score >= 8) return "#171717";
    if (score >= 6) return "#2563EB";
    if (score >= 4) return "#D97706";
    return "#DC2626";
}

function scoreBg(score: number): string {
    if (score >= 8) return "#F3F3EF";
    if (score >= 6) return "#EFF6FF";
    if (score >= 4) return "#FFFBEB";
    return "#FEF2F2";
}

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const name = searchParams.get("name") ?? "Tool";
    const scoreStr = searchParams.get("score");
    const score = scoreStr ? parseFloat(scoreStr) : null;
    const category = searchParams.get("category") ?? "";
    const type = searchParams.get("type") ?? "research"; // "research" | "audit"

    if (type === "audit") {
        const auditScore = score ?? 0;
        const company = name;
        const auditColor = auditScore >= 61 ? "#171717" : auditScore >= 41 ? "#D97706" : "#DC2626";

        return new ImageResponse(
            (
                <div
                    style={{
                        width: "1200px",
                        height: "630px",
                        display: "flex",
                        flexDirection: "column",
                        background: "#F3F3EF",
                        fontFamily: "monospace",
                        padding: "60px",
                        border: "4px solid #000",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#999" }}>
                            AI Readiness Assessment
                        </div>
                    </div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "52px", fontWeight: 400, marginBottom: "40px", color: "#000" }}>
                        {company}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "40px", flex: 1 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontSize: "120px", fontWeight: 900, color: auditColor, lineHeight: 1 }}>
                                {auditScore}
                            </div>
                            <div style={{ fontSize: "24px", color: "#999" }}>/100</div>
                        </div>
                        <div style={{ width: "2px", height: "140px", background: "#D0D0CC" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ fontSize: "16px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#999" }}>
                                AI Operational Readiness Index
                            </div>
                            <div style={{ fontSize: "20px", color: "#555" }}>
                                {auditScore < 21 ? "Minimal AI adoption" : auditScore < 41 ? "Ad-hoc AI usage" : auditScore < 61 ? "Developing AI strategy" : auditScore < 81 ? "Advancing AI operations" : "AI-native operations"}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #000", paddingTop: "20px" }}>
                        <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#999" }}>
                            Trackr — AI-powered software intelligence
                        </div>
                        <div style={{ fontSize: "14px", color: "#999" }}>trytrackr.com</div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 },
        );
    }

    // Default: research tool scorecard
    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    flexDirection: "column",
                    background: "#F3F3EF",
                    fontFamily: "monospace",
                    padding: "60px",
                    border: "4px solid #000",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#999" }}>
                        AI Tool Scorecard
                    </div>
                    {category && (
                        <div style={{ fontSize: "12px", border: "1px solid #D0D0CC", padding: "4px 12px", color: "#666" }}>
                            {category}
                        </div>
                    )}
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "64px", fontWeight: 400, marginBottom: "40px", color: "#000" }}>
                    {name}
                </div>
                {score !== null ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "40px", flex: 1 }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "30px 40px",
                                border: "3px solid #000",
                                background: scoreBg(score),
                            }}
                        >
                            <div style={{ fontSize: "100px", fontWeight: 900, color: scoreColor(score), lineHeight: 1 }}>
                                {score.toFixed(1)}
                            </div>
                            <div style={{ fontSize: "24px", color: "#999" }}>/10</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ fontSize: "16px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#999" }}>
                                Overall Score
                            </div>
                            <div style={{ fontSize: "20px", color: "#555" }}>
                                {score >= 8 ? "Excellent" : score >= 6 ? "Good" : score >= 4 ? "Average" : "Below Average"} — AI-powered analysis
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <div style={{ fontSize: "20px", color: "#555" }}>
                            AI-powered research report with scores, pricing, and competitive analysis
                        </div>
                    </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #000", paddingTop: "20px" }}>
                    <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#999" }}>
                        Trackr — AI-powered software intelligence
                    </div>
                    <div style={{ fontSize: "14px", color: "#999" }}>trytrackr.com</div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 },
    );
}
