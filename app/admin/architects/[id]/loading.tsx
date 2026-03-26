export default function ArchitectDetailLoading() {
    return (
        <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
            <div className="h-8 w-48 bg-neutral-200 animate-pulse" />
            <div className="border border-black p-6 space-y-4">
                <div className="h-4 w-32 bg-neutral-200 animate-pulse" />
                <div className="h-4 w-64 bg-neutral-100 animate-pulse" />
                <div className="h-4 w-48 bg-neutral-100 animate-pulse" />
            </div>
        </div>
    );
}
