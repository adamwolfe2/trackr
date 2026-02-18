"use client";

import { FolderX, GitCommit, Repeat } from "lucide-react";

export function MarketingProblem() {
    return (
        <section className="w-full py-24 border-t border-black/10">
            <div className="mb-16">
                <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-4 block">
                    Why Trackr Exists
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-6">
                    Your tool research process is broken.
                </h2>
                <p className="text-lg md:text-xl font-mono text-neutral-600 max-w-3xl leading-relaxed">
                    You're spending hours on research that goes nowhere, gets repeated by someone else on your team, and lives in a Notion doc nobody opens again.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Card 1: Scattered Research */}
                <div className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="w-12 h-12 bg-neutral-100 border border-black flex items-center justify-center mb-6">
                        <FolderX className="w-6 h-6 text-black" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-serif font-medium mb-3">Research lives everywhere except where it should.</h3>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                        Your team tracks tools in spreadsheets, Slack threads, and browser bookmarks. By the time someone needs the research, it's outdated, incomplete, or just gone.
                    </p>
                </div>

                {/* Card 2: No Consistency */}
                <div className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="w-12 h-12 bg-neutral-100 border border-black flex items-center justify-center mb-6">
                        <GitCommit className="w-6 h-6 text-black" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-serif font-medium mb-3">Every evaluation is different. None are comparable.</h3>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                        There's no standard scorecard. One person looks at pricing. Another looks at integrations. Nobody looks at the same things, so you can't compare tools side by side.
                    </p>
                </div>

                {/* Card 3: Research Gets Repeated */}
                <div className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="w-12 h-12 bg-neutral-100 border border-black flex items-center justify-center mb-6">
                        <Repeat className="w-6 h-6 text-black" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-serif font-medium mb-3">Your team researches the same tools over and over.</h3>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                        Without a shared database, two people spend 4 hours each evaluating a tool that was already reviewed 6 months ago. That time doesn't come back.
                    </p>
                </div>

            </div>
        </section>
    );
}
