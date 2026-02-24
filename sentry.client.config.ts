import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    debug: false,

    // Scrub PII before sending to Sentry — strips emails, auth tokens, and
    // workspace-identifying data from error reports.
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

        // Strip sensitive query params object
        if (event.request?.query_string) {
            const sensitiveKeys = ["token", "key", "secret", "password", "email", "code"];
            if (typeof event.request.query_string === "string") {
                sensitiveKeys.forEach(k => {
                    event.request!.query_string = (event.request!.query_string as string)
                        .replace(new RegExp(`(${k}=)[^&]*`, "gi"), `$1[REDACTED]`);
                });
            }
        }

        return event;
    },
});
