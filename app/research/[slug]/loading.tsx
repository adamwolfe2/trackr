import { MarketingNavigation } from "@/components/marketing/marketing-navigation";

export default function ResearchSlugLoading() {
    return (
        <div className="min-h-screen bg-[#F3F3EF]">
            <MarketingNavigation isLoggedIn={false} />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="animate-pulse space-y-8">
                    {/* Back link */}
                    <div className="h-4 w-36 bg-neutral-200" />

                    {/* Tool header */}
                    <div className="border border-black p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral-200 border border-black" />
                            <div className="space-y-2">
                                <div className="h-8 w-48 bg-neutral-200" />
                                <div className="h-4 w-32 bg-neutral-200" />
                            </div>
                            <div className="ml-auto h-16 w-16 bg-neutral-200 border border-black" />
                        </div>
                        <div className="h-4 w-full bg-neutral-200" />
                        <div className="h-4 w-3/4 bg-neutral-200" />
                    </div>

                    {/* Scorecard */}
                    <div className="border border-black divide-y divide-neutral-100">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="p-4 flex items-center gap-4">
                                <div className="h-3 w-28 bg-neutral-200" />
                                <div className="flex-1 h-2 bg-neutral-200" />
                                <div className="h-5 w-8 bg-neutral-200" />
                            </div>
                        ))}
                    </div>

                    {/* Pros/Cons */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-black p-4 space-y-3">
                            <div className="h-4 w-16 bg-neutral-200" />
                            {[...Array(4)].map((_, i) => <div key={i} className="h-3 w-full bg-neutral-200" />)}
                        </div>
                        <div className="border border-black p-4 space-y-3">
                            <div className="h-4 w-16 bg-neutral-200" />
                            {[...Array(4)].map((_, i) => <div key={i} className="h-3 w-full bg-neutral-200" />)}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
