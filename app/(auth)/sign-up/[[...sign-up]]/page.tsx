import { SignUp } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { trackReferralClick } from "@/lib/actions/referrals";

export const metadata: Metadata = {
    title: "Sign Up — Trackr",
    description: "Create your Trackr account and start researching AI tools.",
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const user = await currentUser();
    if (user) redirect("/tools");

    const params = await searchParams;
    const plan = params.plan ?? "";
    const ref = params.ref ?? "";

    // Store referral code in cookie and track click
    if (ref) {
        const cookieStore = await cookies();
        cookieStore.set("trackr_ref", ref, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });
        // Fire-and-forget click tracking
        trackReferralClick(ref).catch(() => {});
    }

    // Build redirect URL: carry plan + ref context into onboarding
    const redirectParams = new URLSearchParams();
    if (plan) redirectParams.set("plan", plan);
    if (ref) redirectParams.set("ref", ref);
    const redirectUrl = redirectParams.toString()
        ? `/onboarding?${redirectParams.toString()}`
        : "/onboarding";

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <SignUp forceRedirectUrl={redirectUrl} />
        </div>
    );
}
