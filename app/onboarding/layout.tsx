import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Set Up Your Workspace — Trackr",
    description: "Complete onboarding to configure your AI tool intelligence workspace.",
    robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
