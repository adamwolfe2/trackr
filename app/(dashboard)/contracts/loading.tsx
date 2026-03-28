function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function ContractsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="border border-black">
                <div className="border-b border-black p-3 flex gap-4">
                    <Skel className="h-4 w-32" />
                    <Skel className="h-4 w-24" />
                    <Skel className="h-4 w-20" />
                    <Skel className="h-4 w-28" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b border-black p-3 flex gap-4 last:border-b-0">
                        <Skel className="h-4 w-32" />
                        <Skel className="h-4 w-24" />
                        <Skel className="h-4 w-20" />
                        <Skel className="h-4 w-28" />
                    </div>
                ))}
            </div>
        </div>
    );
}
