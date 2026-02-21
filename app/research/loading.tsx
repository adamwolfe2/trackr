import { MarketingNavigation } from "@/components/marketing/marketing-navigation";

export default function ResearchLoading() {
    return (
        <div className="min-h-screen bg-[#F3F3EF]">
            <MarketingNavigation isSignedIn={false} />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                <div className="animate-pulse space-y-8">
                    {/* Header */}
                    <div className="space-y-3">
                        <div className="h-3 w-32 bg-neutral-200" />
                        <div className="h-10 w-96 bg-neutral-200" />
                        <div className="h-4 w-64 bg-neutral-200" />
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-2">
                        {[80, 100, 72, 90, 64].map((w, i) => (
                            <div key={i} className="h-7 bg-neutral-200 border border-neutral-300" style={{ width: w }} />
                        ))}
                    </div>

                    {/* Tool cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="border border-black p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-neutral-200" />
                                    <div className="h-5 w-28 bg-neutral-200" />
                                </div>
                                <div className="h-3 w-full bg-neutral-200" />
                                <div className="h-3 w-3/4 bg-neutral-200" />
                                <div className="h-3 w-full bg-neutral-200" />
                                <div className="flex justify-between items-center pt-2">
                                    <div className="h-6 w-12 bg-neutral-200" />
                                    <div className="h-4 w-20 bg-neutral-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
