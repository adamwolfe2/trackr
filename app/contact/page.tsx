import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact — Trackr",
    description: "Get in touch with the Trackr team. Questions, enterprise inquiries, or AI audit bookings.",
    openGraph: {
        title: "Contact — Trackr",
        description: "Get in touch with the Trackr team.",
        type: "website",
        url: "https://trytrackr.com/contact",
    },
};

export default async function ContactPage() {
    const user = await currentUser();

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-6">
            <MarketingNavigation isLoggedIn={!!user} />

            <section className="py-20 border-t border-black/10">
                <div className="max-w-2xl">
                    <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Contact</span>
                    <h1 className="font-serif text-4xl md:text-5xl font-normal mb-6 leading-tight">
                        Get in touch.
                    </h1>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-12">
                        Questions about pricing, enterprise contracts, or want to see a demo? Reach us below.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-black max-w-2xl mb-16">
                    <div className="p-8 border-b md:border-b-0 md:border-r border-black">
                        <div className="flex items-center gap-3 mb-3">
                            <Mail className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-mono text-xs uppercase tracking-widest">General Inquiries</span>
                        </div>
                        <a
                            href="mailto:hello@trytrackr.com"
                            className="font-mono text-sm text-neutral-700 hover:text-black hover:underline"
                        >
                            hello@trytrackr.com
                        </a>
                        <p className="font-mono text-xs text-neutral-400 mt-2">We reply within 1 business day.</p>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-3">
                            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-mono text-xs uppercase tracking-widest">AI Audit</span>
                        </div>
                        <p className="font-mono text-xs text-neutral-500 mb-4 leading-relaxed">
                            Book a white-glove AI stack audit with our team. 90-day roadmap included.
                        </p>
                        <Link
                            href="/audit"
                            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-mono text-xs uppercase tracking-wide border border-black hover:bg-neutral-800 transition-colors"
                        >
                            Book Audit →
                        </Link>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    );
}
