function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function CreateAdLoading() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <Skel className="h-3 w-20" />
                <Skel className="h-8 w-52" />
                <Skel className="h-4 w-80" />
            </div>

            <div className="border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="border-b border-black px-6 py-4">
                    <Skel className="h-3 w-36" />
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Skel className="h-3 w-24" />
                        <Skel className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skel className="h-3 w-36" />
                        <Skel className="h-10 w-full" />
                        <Skel className="h-3 w-56" />
                    </div>
                    <Skel className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
}
