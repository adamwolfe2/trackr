"use client";

import { Bot, Sliders, Target, Search, Users, Compass, RefreshCw, FileText } from "lucide-react";

export function OffsetFeatures() {
    const features = [
        {
            icon: Bot,
            title: "Research Agents",
            headline: "Send agents. Not interns.",
            body: "Trackr's research agents scrape pricing pages, product docs, Reddit threads, and G2 reviews on your behalf. They bring back structured data, not raw links.",
            colSpan: "md:col-span-2"
        },
        {
            icon: Sliders,
            title: "Custom Scorecard",
            headline: "Score every tool the same way.",
            body: "Define what matters to your team: integration depth, pricing value, AI capabilities. Trackr scores every tool against your criteria automatically.",
            colSpan: "md:col-span-1"
        },
        {
            icon: Target,
            title: "Pain Points Engine",
            headline: "Context-aware agents.",
            body: "Add your team's active pain points. Agents use them as context when scoring every tool. A tool for cold email gets evaluated differently than a tool for SEO.",
            colSpan: "md:col-span-1"
        },
        {
            icon: Search,
            title: "Semantic Search",
            headline: "Search in plain English.",
            body: "Ask 'what tools did we look at for outreach automation'. Trackr searches across tool names, report content, and team notes using semantic understanding.",
            colSpan: "md:col-span-2"
        },
        {
            icon: Users,
            title: "Team Workspace",
            headline: "One database. No duplication.",
            body: "Invite your team. Everyone can add tools, read reports, and leave notes. No more parallel research.",
            colSpan: "md:col-span-1"
        },
        {
            icon: Compass,
            title: "Discovery Engine",
            headline: "Find tools you missed.",
            body: "Trackr runs background queries on ProductHunt and YC batches based on your pain points.",
            colSpan: "md:col-span-1"
        },
        {
            icon: RefreshCw,
            title: "Auto-Refresh",
            headline: "Database doesn't go stale.",
            body: "Trackr automatically re-researches every tool in your database every 30 days and flags what changed.",
            colSpan: "md:col-span-1"
        },
        {
            icon: FileText,
            title: "Structured Reports",
            headline: "Always the same format.",
            body: "Score breakdown. Pricing table. Features list. Pros and cons. Compare side by side without translation.",
            colSpan: "md:col-span-3"
        }
    ];

    return (
        <section className="w-full py-24 border-t border-black/10" id="features">
            <div className="mb-16">
                <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-4 block">
                    What Trackr Does
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6">
                    Everything your team needs to evaluate tools well.
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
                {features.map((feature, i) => (
                    <div key={i} className={`bg-white border border-black p-8 shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${feature.colSpan}`}>
                        <div className="w-10 h-10 bg-neutral-100 border border-black flex items-center justify-center mb-6">
                            <feature.icon className="w-5 h-5 text-black" strokeWidth={1.5} />
                        </div>
                        <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 mb-2 block">{feature.title}</span>
                        <h3 className="text-xl font-serif font-medium mb-3">{feature.headline}</h3>
                        <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                            {feature.body}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
