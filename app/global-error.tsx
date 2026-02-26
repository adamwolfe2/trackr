"use client";

// Root-level error boundary — catches RSC crashes before the layout renders.
// Cannot import any components, Tailwind classes, or external modules
// (they may be the source of the crash). Inline styles only.

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    padding: 0,
                    backgroundColor: "#F3F3EF",
                    fontFamily: "'Geist Mono', 'Courier New', monospace",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                }}
            >
                <div
                    style={{
                        maxWidth: "560px",
                        width: "100%",
                        margin: "0 auto",
                        padding: "48px 24px",
                    }}
                >
                    <div
                        style={{
                            border: "2px solid #000",
                            padding: "40px",
                            backgroundColor: "#F3F3EF",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "'Geist Mono', 'Courier New', monospace",
                                fontSize: "11px",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                margin: "0 0 16px 0",
                                color: "#000",
                            }}
                        >
                            Something went wrong
                        </p>

                        <h1
                            style={{
                                fontFamily: "Newsreader, Georgia, serif",
                                fontSize: "32px",
                                fontWeight: 600,
                                lineHeight: 1.2,
                                margin: "0 0 24px 0",
                                color: "#000",
                            }}
                        >
                            Unexpected Error
                        </h1>

                        <p
                            style={{
                                fontFamily: "'Geist Mono', 'Courier New', monospace",
                                fontSize: "13px",
                                lineHeight: 1.6,
                                color: "#444",
                                margin: "0 0 32px 0",
                            }}
                        >
                            A critical error occurred and the page could not load.
                            Try again or return to the home page.
                        </p>

                        {error.digest && (
                            <p
                                style={{
                                    fontFamily: "'Geist Mono', 'Courier New', monospace",
                                    fontSize: "11px",
                                    color: "#777",
                                    margin: "0 0 32px 0",
                                    padding: "8px 12px",
                                    border: "1px solid #ccc",
                                    backgroundColor: "#eee",
                                }}
                            >
                                Error ID: {error.digest}
                            </p>
                        )}

                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            <button
                                onClick={reset}
                                style={{
                                    fontFamily: "'Geist Mono', 'Courier New', monospace",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    padding: "10px 20px",
                                    backgroundColor: "#000",
                                    color: "#F3F3EF",
                                    border: "2px solid #000",
                                    cursor: "pointer",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                Try Again
                            </button>

                            <a
                                href="/"
                                style={{
                                    fontFamily: "'Geist Mono', 'Courier New', monospace",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    padding: "10px 20px",
                                    backgroundColor: "transparent",
                                    color: "#000",
                                    border: "2px solid #000",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    letterSpacing: "0.05em",
                                    display: "inline-block",
                                }}
                            >
                                Go Home
                            </a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
