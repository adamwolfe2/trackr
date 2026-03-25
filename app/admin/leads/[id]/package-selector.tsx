"use client";

import { useState, useTransition } from "react";
import { PACKAGE_LIST } from "@/lib/config/architect-packages";
import type { PackageSlug } from "@/lib/config/architect-packages";
import { selectPackage, clearPackage } from "./actions";

interface PackageSelectorProps {
    submissionId: string;
    initialSelectedPackage: PackageSlug | null;
}

export function PackageSelector({ submissionId, initialSelectedPackage }: PackageSelectorProps) {
    const [selected, setSelected] = useState<PackageSlug | null>(initialSelectedPackage);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleSelect(slug: PackageSlug) {
        setError(null);

        if (selected === slug) {
            startTransition(async () => {
                const result = await clearPackage(submissionId);
                if (result.success) {
                    setSelected(null);
                } else {
                    setError(result.error ?? "Failed to clear package");
                }
            });
            return;
        }

        startTransition(async () => {
            const result = await selectPackage(submissionId, slug);
            if (result.success) {
                setSelected(slug);
            } else {
                setError(result.error ?? "Failed to select package");
            }
        });
    }

    return (
        <div>
            <div className="grid lg:grid-cols-3 gap-4">
                {PACKAGE_LIST.map((pkg) => {
                    const isSelected = selected === pkg.slug;
                    return (
                        <div
                            key={pkg.slug}
                            className={`border ${isSelected ? "border-2 border-black bg-white" : "border-black"} p-5 flex flex-col relative`}
                        >
                            {/* Recommended badge */}
                            {pkg.popular && (
                                <span className="absolute top-0 right-0 font-mono text-[9px] uppercase bg-black text-white px-2 py-0.5 translate-x-0 -translate-y-0">
                                    Recommended
                                </span>
                            )}

                            {/* Header */}
                            <div className="mb-4">
                                <h3 className="font-serif text-lg">{pkg.name}</h3>
                                <p className="font-mono text-[10px] text-neutral-500 mt-1 leading-relaxed">{pkg.tagline}</p>
                            </div>

                            {/* Price + Duration */}
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="font-mono text-2xl font-black">${pkg.price.toLocaleString()}</span>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 border border-neutral-200 px-1.5 py-0.5">
                                    {pkg.duration}
                                </span>
                            </div>

                            {/* Meetings */}
                            <div className="mb-4">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">Meetings</p>
                                <p className="font-mono text-[10px] text-neutral-600 leading-relaxed">{pkg.meetings}</p>
                            </div>

                            {/* Includes */}
                            <div className="mb-4 flex-1">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Includes</p>
                                <ul className="space-y-1.5">
                                    {pkg.includes.map((item, i) => (
                                        <li key={i} className="font-mono text-[10px] text-neutral-600 flex items-start gap-2">
                                            <span className="w-1 h-1 bg-neutral-400 mt-1.5 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Deliverables */}
                            <div className="mb-4">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-2">Deliverables</p>
                                <ul className="space-y-1">
                                    {pkg.deliverables.map((item, i) => (
                                        <li key={i} className="font-mono text-[10px] text-neutral-600 flex items-start gap-2">
                                            <span className="w-1 h-1 bg-black mt-1.5 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Ideal for */}
                            <p className="font-mono text-[9px] text-neutral-400 mb-4 leading-relaxed">
                                Best for: {pkg.idealFor}
                            </p>

                            {/* Select button */}
                            <button
                                type="button"
                                onClick={() => handleSelect(pkg.slug)}
                                disabled={isPending}
                                className={`font-mono text-xs uppercase tracking-widest px-4 py-2 transition-colors border ${
                                    isSelected
                                        ? "border-black bg-black text-white hover:bg-neutral-800"
                                        : "border-black hover:bg-black hover:text-white"
                                } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {isPending ? "Saving..." : isSelected ? "Selected" : "Select"}
                            </button>
                        </div>
                    );
                })}
            </div>

            {error && (
                <p className="font-mono text-[10px] text-red-600 mt-3">{error}</p>
            )}
        </div>
    );
}
