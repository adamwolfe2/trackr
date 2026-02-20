export default function SubmitLoading() {
    return (
        <div className="max-w-2xl mx-auto py-10 animate-pulse">
            <div className="border border-black bg-white">
                <div className="border-b border-black px-6 py-4">
                    <div className="h-6 w-48 bg-neutral-200 mb-2" />
                    <div className="h-3 w-64 bg-neutral-200" />
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <div className="h-3 w-20 bg-neutral-200 mb-2" />
                        <div className="h-10 w-full bg-neutral-200" />
                    </div>
                    <div>
                        <div className="h-3 w-24 bg-neutral-200 mb-2" />
                        <div className="h-10 w-full bg-neutral-200" />
                    </div>
                    <div>
                        <div className="h-3 w-28 bg-neutral-200 mb-2" />
                        <div className="h-20 w-full bg-neutral-200" />
                    </div>
                    <div className="h-10 w-40 bg-neutral-200" />
                </div>
            </div>
        </div>
    );
}
