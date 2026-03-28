function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function QuizTakeLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="border border-black p-6 space-y-4">
                <Skel className="h-3 w-full" />
                <Skel className="h-6 w-3/4" />
                <div className="space-y-3 pt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border border-black p-3">
                            <Skel className="h-4 w-48" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
