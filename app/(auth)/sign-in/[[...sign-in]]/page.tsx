import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In — Trackr",
    description: "Sign in to your Trackr workspace.",
};

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <SignIn fallbackRedirectUrl="/tools" />
        </div>
    );
}
