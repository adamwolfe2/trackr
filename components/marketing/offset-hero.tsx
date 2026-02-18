"use client";

import { ArrowRight } from "lucide-react";
import React from "react";

export function OffsetHero() {
    return (
        <section className="mb-24 md:mb-32">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight max-w-4xl mb-8 font-serif">
                Transform noise into<br className="hidden md:block" /> actionable knowledge.
            </h2>

            <div className="max-w-2xl">
                <p className="md:text-lg leading-relaxed text-base text-neutral-600 font-mono mb-10">
                    Your intelligent canvas, always ready to assist.
                </p>

                {/* Waitlist Input */}
                <div className="flex flex-col sm:flex-row gap-4 max-w-md items-start">
                    <div className="relative w-full group">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full bg-white border border-black px-4 py-3 font-mono text-sm placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                    </div>
                    <button className="bg-black text-white px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-neutral-800 transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] whitespace-nowrap w-full sm:w-auto flex items-center gap-2 justify-center">
                        Join Waitlist <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <p className="font-mono text-xs text-neutral-400 mt-3">Limited early access rolling out weekly.</p>
            </div>
        </section>
    );
}
