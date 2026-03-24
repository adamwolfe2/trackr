"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ScorecardNavProps {
    sections: Array<{ id: string; label: string }>;
}

export function ScorecardNav({ sections }: ScorecardNavProps) {
    const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
    const observerRef = useRef<IntersectionObserver | null>(null);
    const navRef = useRef<HTMLElement>(null);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
            e.preventDefault();
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveId(id);
            }
        },
        [],
    );

    useEffect(() => {
        if (sections.length === 0) return;

        const sectionIds = sections.map((s) => s.id);
        const visibleEntries = new Map<string, IntersectionObserverEntry>();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    visibleEntries.set(entry.target.id, entry);
                }

                // Find the first section (in DOM order) that is intersecting
                for (const id of sectionIds) {
                    const entry = visibleEntries.get(id);
                    if (entry?.isIntersecting) {
                        setActiveId(id);
                        return;
                    }
                }
            },
            {
                rootMargin: "-64px 0px -60% 0px",
                threshold: 0,
            },
        );

        for (const { id } of sections) {
            const el = document.getElementById(id);
            if (el) {
                observerRef.current.observe(el);
            }
        }

        return () => {
            observerRef.current?.disconnect();
        };
    }, [sections]);

    if (sections.length === 0) return null;

    return (
        <nav
            ref={navRef}
            className="sticky top-0 z-30 bg-[#F3F3EF] border-b border-black overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
            <div className="flex items-center gap-5 px-6 py-2.5 min-w-max">
                {sections.map((section) => {
                    const isActive = activeId === section.id;
                    return (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            onClick={(e) => handleClick(e, section.id)}
                            className={`font-mono text-[10px] uppercase tracking-widest whitespace-nowrap pb-1 transition-colors ${
                                isActive
                                    ? "text-black font-bold border-b-2 border-black"
                                    : "text-neutral-400 hover:text-black"
                            }`}
                        >
                            {section.label}
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}
