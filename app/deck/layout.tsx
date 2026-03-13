import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trackr — AI Software Intelligence Platform",
    description: "See how Trackr helps teams research, compare, and manage their AI software stack with automated scoring, spend tracking, and proactive recommendations.",
    openGraph: {
        title: "Trackr — AI Software Intelligence Platform",
        description: "See how Trackr helps teams research, compare, and manage their AI software stack with automated scoring, spend tracking, and proactive recommendations.",
    },
};

export default function DeckLayout({ children }: { children: React.ReactNode }) {
    return children;
}
