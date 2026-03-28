function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function PublicProfileLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="border border-black p-5 space-y-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skel className="h-4 w-24" />
                        <Skel className="h-9 w-full" />
                    </div>
                ))}
                <Skel className="h-9 w-28" />
            </div>
        </div>
    );
}
