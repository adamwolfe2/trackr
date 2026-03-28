function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function WorkspaceLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <Skel className="h-8 w-56" />
                <Skel className="h-3 w-64" />
            </div>
            <div className="border border-black p-6 space-y-4">
                <Skel className="h-4 w-32" />
                <Skel className="h-10 w-full max-w-md" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 border border-black">
                        <div className="flex items-center gap-3">
                            <Skel className="h-10 w-10" />
                            <div className="space-y-2">
                                <Skel className="h-4 w-32" />
                                <Skel className="h-3 w-48" />
                            </div>
                        </div>
                        <Skel className="h-6 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
