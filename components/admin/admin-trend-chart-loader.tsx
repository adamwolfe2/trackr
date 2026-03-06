"use client";

import nextDynamic from "next/dynamic";

export const AdminTrendChartLoader = nextDynamic(
    () => import("@/components/admin/admin-trend-chart").then((m) => m.AdminTrendChart),
    { ssr: false }
);
