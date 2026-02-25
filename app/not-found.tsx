import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F3F3EF] px-6 text-center">
            <div className="max-w-lg">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-6 block">
                    404 — Page Not Found
                </span>
                <h1 className="text-6xl md:text-8xl font-serif font-normal mb-6 leading-none">
                    Lost.
                </h1>
                <p className="font-mono text-sm text-neutral-600 mb-10 leading-relaxed">
                    We searched our entire vector database and came up empty. This page doesn&apos;t exist — or it moved without telling us.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/research"
                        className="bg-white text-black px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-100 transition-colors border border-black"
                    >
                        Browse Tool Library
                    </Link>
                </div>
            </div>
        </div>
    );
}
