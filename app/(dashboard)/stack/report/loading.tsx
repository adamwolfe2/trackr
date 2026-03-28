function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function StackReportLoading() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
                <Skel className="h-3 w-24" />
                <Skel className="h-8 w-64" />
                <Skel className="h-4 w-48" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`p-5 ${i < 3 ? "border-r border-black" : ""}`}>
                        <Skel className="h-3 w-20 mb-3" />
                        <Skel className="h-7 w-24 mb-1" />
                        <Skel className="h-3 w-16" />
                    </div>
                ))}
            </div>

            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-black p-6 space-y-4">
                    <Skel className="h-5 w-40" />
                    <Skel className="h-4 w-full" />
                    <Skel className="h-4 w-3/4" />
                    <Skel className="h-4 w-5/6" />
                </div>
            ))}
        </div>
    );
}
