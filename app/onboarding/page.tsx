import { Suspense } from "react";
import { OnboardingClient } from "./client";

export default function OnboardingPage() {
    return (
        <Suspense>
            <OnboardingClient />
        </Suspense>
    );
}
