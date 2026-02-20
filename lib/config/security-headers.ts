/**
 * HTTP security headers applied to all responses via next.config.ts.
 * Exported as constants so they can be unit-tested independently.
 */

export const SECURITY_HEADERS = [
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-XSS-Protection", value: "1; mode=block" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
    },
] as const;

/** Only applied in production to avoid HSTS issues in local dev */
export const HSTS_HEADER = {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
} as const;
