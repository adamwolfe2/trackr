"use client";

import { CreditCard, FileText, Clock } from "lucide-react";

const PROVIDERS: Array<{
    name: string;
    description: string;
    category: string;
    icon: typeof CreditCard;
}> = [
    { name: "Ramp", description: "Auto-sync SaaS transactions from your Ramp corporate card", category: "Spend Management", icon: CreditCard },
    { name: "Brex", description: "Import software spend from Brex card transactions", category: "Spend Management", icon: CreditCard },
    { name: "Bill.com", description: "Sync vendor payments and invoices from Bill.com", category: "Spend Management", icon: CreditCard },
    { name: "Notion", description: "Push tool reports and decision logs to your Notion workspace", category: "Knowledge Base", icon: FileText },
    { name: "Confluence", description: "Push reports and board summaries to Confluence spaces", category: "Knowledge Base", icon: FileText },
];

export function IntegrationsClient() {
    const categories = [...new Set(PROVIDERS.map((p) => p.category))];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Settings</p>
                <h1 className="font-serif text-2xl font-normal">Integrations</h1>
                <p className="font-mono text-xs text-neutral-500 mt-1">
                    Third-party integrations to automate spend tracking and push reports.
                </p>
            </div>

            {categories.map((category) => (
                <div key={category}>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">{category}</p>
                    <div className="border border-black divide-y divide-neutral-100">
                        {PROVIDERS.filter((p) => p.category === category).map((p) => (
                            <div key={p.name} className="bg-white p-5 flex items-start gap-4 opacity-60">
                                <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center flex-shrink-0">
                                    <p.icon className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-mono text-sm font-bold">{p.name}</h3>
                                        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest border border-neutral-300 text-neutral-400 px-2 py-0.5">
                                            <Clock className="w-2.5 h-2.5" />
                                            Coming Soon
                                        </span>
                                    </div>
                                    <p className="font-mono text-xs text-neutral-500 leading-relaxed">{p.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="border border-black bg-[#F3F3EF] p-5 max-w-2xl">
                <p className="font-mono text-xs font-bold mb-2">On the Roadmap</p>
                <p className="font-mono text-[10px] text-neutral-500 leading-relaxed">
                    OAuth-based connections for Ramp, Brex, Bill.com, Notion, and Confluence are in active development.
                    Want early access? Reach out to us and we will prioritize the integrations you need.
                </p>
            </div>
        </div>
    );
}
