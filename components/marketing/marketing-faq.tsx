"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "How long does a research report take?",
        a: "Under 2 minutes. Our research pipeline maps the tool's site, scrapes key pages, pulls reviews from G2, Capterra, TrustRadius, ProductHunt, Trustpilot, and Reddit, analyzes competitors, and synthesizes everything into a scored report — all automated.",
    },
    {
        q: "How accurate are the research reports?",
        a: "Reports are sourced from 25+ real data points — official sites, review platforms, Reddit threads, and competitive analysis. Every claim is grounded in real data, not hallucinated. You can see the exact sources in each report.",
    },
    {
        q: "What data sources do you use?",
        a: "We scrape the tool's official website, G2, Capterra, TrustRadius, ProductHunt, Trustpilot, BBB, Glassdoor, Reddit (3 targeted queries), and competitive intelligence from market databases. Each report cites its sources.",
    },
    {
        q: "Can I export reports?",
        a: "Yes. Team plans and above can export any research report as a PDF — ready to share with stakeholders, attach to procurement docs, or archive for compliance.",
    },
    {
        q: "Is my data private?",
        a: "Yes. Your workspace data is isolated and never shared between accounts. Research reports are private to your workspace unless you explicitly create a share link.",
    },
    {
        q: "What does 'per workspace, not per user' mean?",
        a: "Your subscription covers the entire workspace. Add team members without paying per seat. The Team plan includes 5 members, Startup includes 15, and Enterprise is unlimited.",
    },
    {
        q: "Can I try paid features before committing?",
        a: "All paid plans include a 14-day free trial with full access. No credit card required to start. Cancel anytime during the trial.",
    },
    {
        q: "What happens when I hit my research credit limit?",
        a: "You'll see a prompt to upgrade or purchase extra credits. Your existing data stays intact — you just can't run new research until the next billing cycle or you buy more credits.",
    },
];

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-black/10 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-5 text-left group"
            >
                <span className="font-serif text-base pr-4">{q}</span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-neutral-400 group-hover:text-black transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-40 pb-5" : "max-h-0"
                }`}
            >
                <p className="font-mono text-xs text-neutral-500 leading-relaxed pr-8">{a}</p>
            </div>
        </div>
    );
}

export function MarketingFaq() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="w-full py-24 border-t border-black/10" id="faq">
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                        FAQ
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-normal">
                        Common questions
                    </h2>
                </div>

                <div className="max-w-2xl mx-auto border border-black p-6 md:p-8">
                    {faqs.map((faq, i) => (
                        <FaqItem
                            key={faq.q}
                            q={faq.q}
                            a={faq.a}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                        />
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
