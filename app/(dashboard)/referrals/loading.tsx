function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function ReferralsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skel className="h-9 w-48 mb-2" />
                <Skel className="h-4 w-72" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                {/* Referral link card */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <Skel className="h-3 w-32" />
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="border border-black p-3 flex items-center justify-between">
                            <Skel className="h-4 w-48" />
                            <Skel className="h-8 w-16 shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Stats card */}
                <div className="border border-black">
                    <div className="border-b border-black px-5 py-3">
                        <Skel className="h-3 w-28" />
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="border border-black p-4 text-center space-y-2">
                                    <Skel className="h-8 w-12 mx-auto" />
                                    <Skel className="h-3 w-20 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
