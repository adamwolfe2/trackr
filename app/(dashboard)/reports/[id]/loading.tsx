function Skel({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${className ?? ""}`} />;
}

export default function ReportDetailLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skel className="h-8 w-40" />
                <Skel className="h-4 w-64" />
            </div>
            <div className="border border-black p-6 space-y-4">
                <Skel className="h-5 w-48" />
                <Skel className="h-4 w-full" />
                <Skel className="h-4 w-full" />
                <Skel className="h-4 w-3/4" />
                <Skel className="h-40 w-full" />
                <Skel className="h-4 w-full" />
                <Skel className="h-4 w-2/3" />
            </div>
        </div>
    );
}
