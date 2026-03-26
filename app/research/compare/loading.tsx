import { MarketingNavigation } from "@/components/marketing/marketing-navigation";

export default function CompareLoading() {
    return (
        <div className="min-h-screen bg-[#F3F3EF]">
            <MarketingNavigation isLoggedIn={false} />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                <div className="animate-pulse space-y-8">
                    {/* Back link */}
                    <div className="h-4 w-36 bg-neutral-200" />

                    {/* Header */}
                    <div className="space-y-3">
                        <div className="h-10 w-80 bg-neutral-200" />
                        <div className="h-4 w-64 bg-neutral-200" />
                    </div>

                    {/* Comparison table skeleton */}
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="border border-black min-w-[480px]">
                        {/* Tool headers */}
                        <div className="grid grid-cols-3 border-b border-black">
                            <div className="p-4 border-r border-black" />
                            <div className="p-4 border-r border-black space-y-2">
                                <div className="h-6 w-24 bg-neutral-200" />
                                <div className="h-4 w-16 bg-neutral-200" />
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="h-6 w-24 bg-neutral-200" />
                                <div className="h-4 w-16 bg-neutral-200" />
                            </div>
                        </div>

                        {/* Score rows */}
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-3 border-b border-neutral-100">
                                <div className="p-4 border-r border-neutral-100">
                                    <div className="h-3 w-24 bg-neutral-200" />
                                </div>
                                <div className="p-4 border-r border-neutral-100">
                                    <div className="h-3 w-12 bg-neutral-200" />
                                </div>
                                <div className="p-4">
                                    <div className="h-3 w-12 bg-neutral-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
