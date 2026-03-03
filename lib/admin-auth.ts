/**
 * Shared admin authentication for /admin pages.
 *
 * Two ways to authenticate:
 * 1. Password-based: enter ADMIN_PASSWORD → sets trackr-admin cookie
 * 2. Email-based: logged-in Clerk user whose email is in ADMIN_EMAILS env var
 */

import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { currentUser } from "@clerk/nextjs/server";

/** Comma-separated list of admin emails (env var). */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/**
 * Check if the current request is authenticated as admin.
 * Returns true if:
 * - The trackr-admin cookie matches the hashed ADMIN_PASSWORD, OR
 * - The Clerk user's primary email is in ADMIN_EMAILS
 */
export async function isAdminAuthenticated(): Promise<boolean> {
    // Check cookie-based password auth
    const cookie = (await cookies()).get("trackr-admin");
    if (cookie?.value && process.env.ADMIN_PASSWORD) {
        const expected = createHash("sha256").update(process.env.ADMIN_PASSWORD).digest("hex");
        const a = Buffer.from(cookie.value);
        const b = Buffer.from(expected);
        if (a.length === b.length && timingSafeEqual(a, b)) {
            return true;
        }
    }

    // Check Clerk email-based admin access
    if (ADMIN_EMAILS.length > 0) {
        try {
            const user = await currentUser();
            if (user) {
                const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();
                if (email && ADMIN_EMAILS.includes(email)) {
                    return true;
                }
            }
        } catch {
            // Clerk unavailable — fall through to false
        }
    }

    return false;
}
