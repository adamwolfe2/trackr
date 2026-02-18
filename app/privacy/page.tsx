import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Header } from "@/components/marketing/header";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-emerald-500/30">
            <Header />

            <main className="pt-32 pb-16 container mx-auto px-4 max-w-3xl prose prose-zinc dark:prose-invert">
                <h1>Privacy Policy</h1>
                <p>Last updated: March 2024</p>

                <h2>1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our interactive features.</p>

                <h2>2. How We Use Your Information</h2>
                <p>
                    We use the information we collect to provide, maintain, and improve our services, such as to personalize your experience and provide customer support.
                </p>

                <h2>3. Data Security</h2>
                <p>
                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                </p>
            </main>

            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-900 mt-24">
                <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
                    <p>&copy; 2024 Trackr Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
