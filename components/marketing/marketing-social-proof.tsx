"use client";

export function MarketingSocialProof() {
    return (
        <section className="w-full py-24 border-t border-black/10">
            <div className="mb-16">
                <h2 className="text-3xl md:text-4xl font-serif font-normal text-center mb-12">
                    Built for teams who move fast and evaluate often.
                </h2>

                {/* Stat Bar */}
                <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-24 mb-20 text-center">
                    <div>
                        <div className="text-4xl font-mono font-medium mb-2">&lt; 2 min</div>
                        <div className="text-sm font-mono text-neutral-500 uppercase tracking-wide">Average time to report</div>
                    </div>
                    <div>
                        <div className="text-4xl font-mono font-medium mb-2">7 dims</div>
                        <div className="text-sm font-mono text-neutral-500 uppercase tracking-wide">Scored on every tool</div>
                    </div>
                    <div>
                        <div className="text-4xl font-mono font-medium mb-2">30-day</div>
                        <div className="text-sm font-mono text-neutral-500 uppercase tracking-wide">Auto-refresh cycle</div>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <blockquote className="bg-neutral-50 p-8 border border-neutral-200 shadow-sm">
                        <p className="font-serif text-lg italic mb-6">"We used to spend half a Friday afternoon looking at tools for a new workflow. Now we submit them Monday morning and have reports by lunch."</p>
                        <footer className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                            — Head of Operations, AI Services Agency
                        </footer>
                    </blockquote>
                    <blockquote className="bg-neutral-50 p-8 border border-neutral-200 shadow-sm">
                        <p className="font-serif text-lg italic mb-6">"The scorecard is the thing. Everyone on my team was evaluating tools based on different criteria. Trackr forced us to agree on what actually matters."</p>
                        <footer className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                            — Founder, Growth Agency
                        </footer>
                    </blockquote>
                    <blockquote className="bg-neutral-50 p-8 border border-neutral-200 shadow-sm">
                        <p className="font-serif text-lg italic mb-6">"The discovery feed alone is worth it. We found 3 tools we'd never heard of that directly addressed pain points we'd been stuck on for months."</p>
                        <footer className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                            — Technical Project Lead, Modern Amenities Group
                        </footer>
                    </blockquote>
                </div>
            </div>
        </section>
    );
}
