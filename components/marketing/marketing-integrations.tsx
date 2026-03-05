"use client";

import Image from "next/image";

const ROW_1 = [
    { src: "/integrations/notion.svg", alt: "Notion" },
    { src: "/integrations/slack-svgrepo-com.svg", alt: "Slack" },
    { src: "/integrations/openai-svgrepo-com.svg", alt: "OpenAI" },
    { src: "/integrations/hubspot-svgrepo-com.svg", alt: "HubSpot" },
    { src: "/integrations/salesforce.svg", alt: "Salesforce" },
    { src: "/integrations/airtable-svgrepo-com.svg", alt: "Airtable" },
    { src: "/integrations/linear.svg", alt: "Linear" },
    { src: "/integrations/asana.svg", alt: "Asana" },
    { src: "/integrations/gmail.svg", alt: "Gmail" },
    { src: "/integrations/google-drive-svgrepo-com.svg", alt: "Google Drive" },
    { src: "/integrations/github.svg", alt: "GitHub" },
    { src: "/integrations/typeform.svg", alt: "Typeform" },
    { src: "/integrations/apollo.svg", alt: "Apollo" },
    { src: "/integrations/meta-color.svg", alt: "Meta" },
    { src: "/integrations/tiktok.svg", alt: "TikTok" },
    { src: "/integrations/icons8-instagram.svg", alt: "Instagram" },
    { src: "/integrations/google-ads-svgrepo-com.svg", alt: "Google Ads" },
    { src: "/integrations/icons8-wordpress.svg", alt: "WordPress" },
    { src: "/integrations/X_idJxGuURW1_0.svg", alt: "X" },
    { src: "/integrations/search-console-icon-2025-1.svg", alt: "Search Console" },
];

const ROW_2 = [
    { src: "/integrations/calendly.svg", alt: "Calendly" },
    { src: "/integrations/shopify.svg", alt: "Shopify" },
    { src: "/integrations/reddit-4.svg", alt: "Reddit" },
    { src: "/integrations/linkedin.svg", alt: "LinkedIn" },
    { src: "/integrations/klaviyo.svg", alt: "Klaviyo" },
    { src: "/integrations/Webflow_id2IyfqSKv_0.svg", alt: "Webflow" },
    { src: "/integrations/trello_logo_icon_167765.png", alt: "Trello" },
    { src: "/integrations/icons8-microsoft-teams.svg", alt: "Microsoft Teams" },
    { src: "/integrations/icons8-zoom.svg", alt: "Zoom" },
    { src: "/integrations/google-docs-svgrepo-com.svg", alt: "Google Docs" },
    { src: "/integrations/Sentry_idovIhtf_y_0.svg", alt: "Sentry" },
    { src: "/integrations/google-calendar-svgrepo-com.svg", alt: "Google Calendar" },
    { src: "/integrations/icons8-microsoft-outlook-2019.svg", alt: "Outlook" },
    { src: "/integrations/icons8-pinterest.svg", alt: "Pinterest" },
    { src: "/integrations/gsheet-document-svgrepo-com.svg", alt: "Google Sheets" },
    { src: "/integrations/telegram-communication-chat-interaction-network-connection-svgrepo-com.svg", alt: "Telegram" },
    { src: "/integrations/instantly.webp", alt: "Instantly" },
    { src: "/integrations/attentive.webp", alt: "Attentive" },
    { src: "/integrations/firecrawl-logo.webp", alt: "Firecrawl" },
    { src: "/integrations/apple-logo.png", alt: "Apple" },
];

function LogoTile({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="flex-shrink-0 w-16 h-16 bg-white border border-neutral-200 flex items-center justify-center mx-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)]">
            <Image
                src={src}
                alt={alt}
                width={32}
                height={32}
                className="object-contain w-8 h-8"
                unoptimized
            />
        </div>
    );
}

function MarqueeRow({ logos, reverse = false }: { logos: typeof ROW_1; reverse?: boolean }) {
    const doubled = [...logos, ...logos];
    return (
        <div className="overflow-hidden w-full">
            <div
                className="flex items-center"
                style={{
                    animation: `marquee${reverse ? "Rev" : ""} 55s linear infinite`,
                    width: "max-content",
                }}
            >
                {doubled.map((logo, i) => (
                    <LogoTile key={`${logo.alt}-${i}`} src={logo.src} alt={logo.alt} />
                ))}
            </div>
        </div>
    );
}

export function MarketingIntegrations() {
    return (
        <section className="w-full py-24 border-t border-black/10 overflow-hidden">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marqueeRev {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
            `}</style>

            <div className="text-center mb-12">
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-500 mb-4 block">
                    Researches everything
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-normal mb-4">
                    Any tool your team evaluates.
                </h2>
                <p className="font-mono text-sm text-neutral-500 max-w-lg mx-auto">
                    Paste any URL. Trackr pulls data from the tool&apos;s site, G2, Reddit, Capterra, and competitor sources — no manual setup required.
                </p>
            </div>

            <div className="space-y-3 -mx-6">
                <MarqueeRow logos={ROW_1} />
                <MarqueeRow logos={ROW_2} reverse />
            </div>

            <div className="text-center mt-10">
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                    + thousands more tools supported
                </span>
            </div>
        </section>
    );
}
