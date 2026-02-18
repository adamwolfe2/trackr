import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Header } from "@/components/marketing/header";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-emerald-500/30">
            <Header />

            <main className="pt-32 pb-16 container mx-auto px-4 max-w-3xl prose prose-zinc dark:prose-invert">
                <h1>Terms of Service</h1>
                <p>Last updated: March 2024</p>

                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using Trackr ("the Service"), you agree to these Terms of Service.</p>

                <h2>2. Use License</h2>
                <p>
                    Permission is granted to temporarily view the materials on Trackr's website for personal, non-commercial transitory viewing only.
                </p>

                <h2>3. Subscription and Billing</h2>
                <p>
                    Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed is advance on a recurring and periodic basis ("Billing Cycle").
                </p>

                <h2>4. Termination</h2>
                <p>
                    We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
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
