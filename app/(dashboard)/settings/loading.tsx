function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function SettingsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-black p-5 space-y-4">
                    <Skel className="h-5 w-32" />
                    <div className="space-y-3">
                        <Skel className="h-4 w-full" />
                        <Skel className="h-4 w-3/4" />
                        <Skel className="h-9 w-48" />
                    </div>
                </div>
            ))}
        </div>
    );
}
