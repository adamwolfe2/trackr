function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function SubmitLoading() {
    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="border border-black bg-white">
                <div className="border-b border-black px-6 py-4 space-y-2">
                    <Skel className="h-6 w-48" />
                    <Skel className="h-3 w-64" />
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <Skel className="h-3 w-20 mb-2" />
                        <Skel className="h-10 w-full" />
                    </div>
                    <div>
                        <Skel className="h-3 w-24 mb-2" />
                        <Skel className="h-10 w-full" />
                    </div>
                    <div>
                        <Skel className="h-3 w-28 mb-2" />
                        <Skel className="h-20 w-full" />
                    </div>
                    <Skel className="h-10 w-40" />
                </div>
            </div>
        </div>
    );
}
