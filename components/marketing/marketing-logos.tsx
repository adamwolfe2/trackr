"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const LOGOS = [
  { name: "Linear", domain: "linear.app" },
  { name: "Notion", domain: "notion.so" },
  { name: "Figma", domain: "figma.com" },
  { name: "Slack", domain: "slack.com" },
  { name: "HubSpot", domain: "hubspot.com" },
  { name: "Intercom", domain: "intercom.com" },
  { name: "Loom", domain: "loom.com" },
  { name: "Retool", domain: "retool.com" },
  { name: "Clay", domain: "clay.com" },
  { name: "Apollo", domain: "apollo.io" },
];

function LogoItem({ name, domain }: { name: string; domain: string }) {
  const [imgSrc, setImgSrc] = useState(`https://logo.clearbit.com/${domain}`);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white hover:bg-[#F3F3EF] transition-colors border-r border-black/10 last:border-r-0">
      {!failed ? (
        <img
          src={imgSrc}
          alt={name}
          className="h-7 w-7 object-contain"
          onError={() => {
            if (imgSrc.includes("clearbit")) {
              setImgSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
            } else {
              setFailed(true);
            }
          }}
        />
      ) : (
        <div className="h-7 w-7 border border-black/20 flex items-center justify-center font-mono text-xs font-bold text-neutral-500">
          {name.charAt(0)}
        </div>
      )}
      <span className="font-mono text-[10px] text-neutral-500 tracking-wide whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

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
        <div className="flex flex-wrap items-stretch justify-center border border-black/10 divide-x divide-black/10">
          {LOGOS.map((logo) => (
            <LogoItem key={logo.name} name={logo.name} domain={logo.domain} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
