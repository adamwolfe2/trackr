"use client";

import dynamic from "next/dynamic";

// `ssr: false` must live in a Client Component — cannot be used in Server Component layouts
const CommandPalette = dynamic(
    () => import("@/components/command-palette").then(m => ({ default: m.CommandPalette })),
    { ssr: false }
);

export function CommandPaletteLoader() {
    return <CommandPalette />;
}
