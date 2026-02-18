"use client";

export function MarketingUseCases() {
    return (
        <section className="w-full py-24 border-t border-black/10">
            <div className="mb-16">
                <span className="text-sm font-mono uppercase tracking-wider text-[#8B9A7F] mb-4 block">
                    Who Uses Trackr
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-normal mb-8">
                    If your team evaluates tools, Trackr saves you time.
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Card 1: Agency */}
                <div className="bg-neutral-50 border border-neutral-200 p-8">
                    <h3 className="text-xl font-serif font-medium mb-3">AI & Ops Agencies</h3>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-4">
                        <strong>Know what's best in the market before your clients ask.</strong>
                    </p>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                        Agency teams evaluate 10-30 tools per month across automation, outreach, CRM, and analytics. Trackr turns that research into a shared database your whole team can reference and build on.
                    </p>
                </div>

                {/* Card 2: Startup */}
                <div className="bg-neutral-50 border border-neutral-200 p-8">
                    <h3 className="text-xl font-serif font-medium mb-3">Startup Ops & Growth</h3>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-4">
                        <strong>Build a tool stack that's actually based on research.</strong>
                    </p>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                        Startups move fast and often adopt tools before they've been properly evaluated. Trackr gives ops and growth teams a systematic process for finding, scoring, and tracking tools.
                    </p>
                </div>

                {/* Card 3: Solopreneur */}
                <div className="bg-neutral-50 border border-neutral-200 p-8">
                    <h3 className="text-xl font-serif font-medium mb-3">Founders & Solopreneurs</h3>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-4">
                        <strong>Stop reading 14 landing pages to make one decision.</strong>
                    </p>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed">
                        You don't have a team to delegate research to. Trackr's agents do it in 2 minutes. Add a tool, read the report, make the call. Build a personal tool database you can come back to.
                    </p>
                </div>

            </div>
        </section>
    );
}
