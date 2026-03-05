import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ContactForm } from "@/components/marketing/contact-form";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact — Trackr",
    description: "Get in touch with the Trackr team. Questions, enterprise inquiries, or AI audit bookings.",
    keywords: ["contact trackr", "trackr support", "trackr enterprise inquiry", "AI audit booking", "trackr team contact"],
    alternates: {
        canonical: "https://trytrackr.com/contact",
    },
    openGraph: {
        title: "Contact — Trackr",
        description: "Get in touch with the Trackr team. Questions, enterprise inquiries, or AI audit bookings.",
        type: "website",
        url: "https://trytrackr.com/contact",
        images: [{ url: "/og.png", width: 1456, height: 816, alt: "Contact Trackr" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact — Trackr",
        description: "Get in touch with the Trackr team. Questions, enterprise inquiries, or AI audit bookings.",
        images: ["/og.png"],
    },
};

const contactJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "ContactPage",
            "@id": "https://trytrackr.com/contact",
            name: "Contact Trackr",
            description: "Get in touch with the Trackr team. Questions, enterprise inquiries, or AI audit bookings.",
            url: "https://trytrackr.com/contact",
        },
        {
            "@type": "Organization",
            "@id": "https://trytrackr.com/#organization",
            name: "Trackr",
            url: "https://trytrackr.com",
            contactPoint: {
                "@type": "ContactPoint",
                email: "hello@trytrackr.com",
                contactType: "customer support",
                availableLanguage: "English",
                contactOption: "TollFree",
            },
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://trytrackr.com" },
                { "@type": "ListItem", position: 2, name: "Contact", item: "https://trytrackr.com/contact" },
            ],
        },
    ],
};

export default async function ContactPage() {
    const user = await currentUser();

    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
        />
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

                <div className="max-w-2xl mb-12">
                    <ContactForm />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-black max-w-2xl mb-16">
                    <div className="p-8 border-b md:border-b-0 md:border-r border-black">
                        <div className="flex items-center gap-3 mb-3">
                            <Mail className="w-4 h-4" strokeWidth={1.5} />
                            <span className="font-mono text-xs uppercase tracking-widest">Email Directly</span>
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
        </>
    );
}
