import { Lock } from "lucide-react";
import Link from "next/link";

interface PlanGateProps {
    featureName: string;
    description: string;
}

export function PlanGate({ featureName, description }: PlanGateProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md border border-black p-8 text-center bg-white">
                <div className="w-10 h-10 border border-black flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-5 h-5 text-black" strokeWidth={1.5} />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-2">
                    Team Plan Required
                </span>
                <h2 className="text-2xl font-serif font-normal mb-3">{featureName}</h2>
                <p className="font-mono text-sm text-neutral-500 leading-relaxed mb-8">{description}</p>
                <Link
                    href="/settings/billing"
                    className="inline-block border border-black bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                    View Plans →
                </Link>
            </div>
        </div>
    );
}
