"use client";

import nextDynamic from "next/dynamic";

export const ToolDetailTabsLoader = nextDynamic(
    () => import("@/components/tools/tool-detail-tabs").then((m) => m.ToolDetailTabs),
    { ssr: false }
);
