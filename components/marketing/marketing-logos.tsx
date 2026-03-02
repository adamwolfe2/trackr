"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const LOGOS = [
  { name: "Linear", abbr: "Li" },
  { name: "Notion", abbr: "No" },
  { name: "Figma", abbr: "Fi" },
  { name: "Slack", abbr: "Sl" },
  { name: "HubSpot", abbr: "Hs" },
  { name: "Intercom", abbr: "Ic" },
  { name: "Loom", abbr: "Lm" },
  { name: "Retool", abbr: "Re" },
  { name: "Clay", abbr: "Cl" },
  { name: "Apollo", abbr: "Ap" },
];

export function MarketingLogos() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="w-full py-10 border-t border-black/8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 text-center mb-6">
          Ops teams are tracking these tools — and hundreds more
        </p>
        <div className="flex flex-wrap items-center justify-center gap-0 border border-black/10">
          {LOGOS.map((logo, i) => (
            <div
              key={logo.name}
              className={`flex items-center justify-center px-6 py-4 bg-white hover:bg-[#F3F3EF] transition-colors ${
                i < LOGOS.length - 1 ? "border-r border-black/10" : ""
              }`}
            >
              <span className="font-mono text-xs font-semibold text-neutral-600 tracking-wider whitespace-nowrap">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
