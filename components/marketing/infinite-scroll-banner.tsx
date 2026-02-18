"use client";

import { useRef, useEffect } from "react";

const companies = [
    "Acme Corp",
    "Globex",
    "Soylent Corp",
    "Initech",
    "Umbrella Corp",
    "Stark Ind",
    "Wayne Ent",
    "Cyberdyne",
    "Massive Dynamic",
    "Hooli",
];

export function InfiniteScrollBanner() {
    return (
        <div className="w-full overflow-hidden bg-white dark:bg-black py-10 border-y border-zinc-100 dark:border-zinc-900">
            <div className="container mx-auto px-4 mb-6">
                <p className="text-center text-sm font-medium text-zinc-500 uppercase tracking-widest">
                    Trusted by forward-thinking teams
                </p>
            </div>
            <div className="relative flex overflow-x-hidden">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
                    {companies.map((company, i) => (
                        <span
                            key={i}
                            className="text-xl font-bold text-zinc-300 dark:text-zinc-700 select-none"
                        >
                            {company}
                        </span>
                    ))}
                </div>
                <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-16 px-8">
                    {companies.map((company, i) => (
                        <span
                            key={i}
                            className="text-xl font-bold text-zinc-300 dark:text-zinc-700 select-none"
                        >
                            {company}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
