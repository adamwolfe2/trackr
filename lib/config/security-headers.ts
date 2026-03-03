/**
 * HTTP security headers applied to all responses via next.config.ts.
 * Exported as constants so they can be unit-tested independently.
 */

/**
 * Content-Security-Policy.
 * - script-src: 'unsafe-inline' required for Next.js App Router hydration scripts.
 * - img-src https: allows any HTTPS image (tool logos come from arbitrary CDNs).
 * - connect-src https: wss: allows Clerk, Stripe, Sentry, and app API calls.
 * - frame-ancestors 'self' blocks clickjacking (reinforces X-Frame-Options).
 * - object-src 'none' blocks Flash / legacy plugin execution.
 * - base-uri 'self' prevents <base> tag injection.
 * - form-action 'self' prevents form-submission hijacking.
 */
const CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://clerk.trytrackr.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://js.stripe.com https://*.stripe.com https://*.clerk.accounts.dev https://clerk.trytrackr.com https://challenges.cloudflare.com",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://clerk.trytrackr.com https://*.clerk.accounts.dev",
].join("; ");

export const SECURITY_HEADERS = [
    { key: "Content-Security-Policy", value: CSP },
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
