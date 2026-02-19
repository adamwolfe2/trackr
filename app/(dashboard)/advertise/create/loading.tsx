export default function CreateAdLoading() {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-3 w-20 bg-neutral-200" />
                <div className="h-8 w-52 bg-neutral-200" />
                <div className="h-4 w-80 bg-neutral-200" />
            </div>

            <div className="border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="border-b border-black px-6 py-4">
                    <div className="h-3 w-36 bg-neutral-200" />
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <div className="h-3 w-24 bg-neutral-200" />
                        <div className="h-10 w-full bg-neutral-200" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-36 bg-neutral-200" />
                        <div className="h-10 w-full bg-neutral-200" />
                        <div className="h-3 w-56 bg-neutral-200" />
                    </div>
                    <div className="h-12 w-full bg-neutral-200" />
                </div>
            </div>
        </div>
    );
}
