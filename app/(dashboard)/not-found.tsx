import Link from "next/link";

export default function DashboardNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">
                404 — Not Found
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4">
                Page not found.
            </h1>
            <p className="font-mono text-sm text-neutral-500 mb-8 max-w-md leading-relaxed">
                This page doesn&apos;t exist or may have been moved. Check the URL or head back to your dashboard.
            </p>
            <div className="flex gap-3">
                <Link
                    href="/dashboard"
                    className="border border-black px-6 py-2.5 font-mono text-xs bg-black text-white hover:bg-neutral-800"
                >
                    Dashboard
                </Link>
                <Link
                    href="/tools"
                    className="border border-black px-6 py-2.5 font-mono text-xs bg-white hover:bg-neutral-100"
                >
                    Tool Database
                </Link>
            </div>
        </div>
    );
}
