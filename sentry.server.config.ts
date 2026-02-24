import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,

    // Scrub PII before sending to Sentry — strips emails, auth tokens, and
    // workspace-identifying data from server-side error reports.
    beforeSend(event) {
        // Remove user identity info
        if (event.user) {
            delete event.user.email;
            delete event.user.username;
            delete event.user.ip_address;
        }

        // Strip sensitive query params from request URLs
        if (event.request?.url) {
            try {
                const url = new URL(event.request.url);
                ["token", "key", "secret", "password", "email", "code"].forEach(p => {
                    if (url.searchParams.has(p)) url.searchParams.set(p, "[REDACTED]");
                });
                event.request.url = url.toString();
            } catch { /* leave URL as-is if unparseable */ }
        }

        return event;
    },
});
