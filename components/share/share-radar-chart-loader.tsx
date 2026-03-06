"use client";

import nextDynamic from "next/dynamic";

export const ShareRadarChartLoader = nextDynamic(
    () => import("@/components/share/share-radar-chart").then((m) => m.ShareRadarChart),
    { ssr: false }
);
