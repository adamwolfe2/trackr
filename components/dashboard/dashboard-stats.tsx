"use client";

import { Activity, FileText, Star, AlertCircle, TrendingUp } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

function WeekDelta({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-black font-medium">
            <TrendingUp className="h-2.5 w-2.5" />
            +{count} this week
        </span>
    );
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
    const motionVal = useMotionValue(0);
    const display = useTransform(motionVal, (v) =>
        decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()
    );

    useEffect(() => {
        const ctrl = animate(motionVal, value, { duration: 0.8, ease: "easeOut" });
        return ctrl.stop;
    }, [value, motionVal]);

    return <motion.span>{display}</motion.span>;
}

export function DashboardStats({
    avgScore = 0,
    activeTools = 0,
    researchReports = 0,
    activePainPoints = 0,
    toolsThisWeek = 0,
    reportsThisWeek = 0,
}: {
    avgScore?: number;
    activeTools?: number;
    researchReports?: number;
    activePainPoints?: number;
    toolsThisWeek?: number;
    reportsThisWeek?: number;
}) {
    const stats = [
        {
            label: "Avg Score",
            icon: Star,
            numValue: avgScore,
            displayValue: avgScore > 0 ? <AnimatedNumber value={avgScore} decimals={1} /> : <span>—</span>,
            sub: <span className="font-mono text-[10px] text-neutral-400">across all researched tools</span>,
            border: "border-r border-b md:border-b-0 border-black",
        },
        {
            label: "Total Tools",
            icon: Activity,
            numValue: activeTools,
            displayValue: <AnimatedNumber value={activeTools} />,
            sub: <><WeekDelta count={toolsThisWeek} />{toolsThisWeek <= 0 && <span className="font-mono text-[10px] text-neutral-400">in your workspace</span>}</>,
            border: "border-b md:border-b-0 md:border-r border-black",
        },
        {
            label: "Reports",
            icon: FileText,
            numValue: researchReports,
            displayValue: <AnimatedNumber value={researchReports} />,
            sub: <><WeekDelta count={reportsThisWeek} />{reportsThisWeek <= 0 && <span className="font-mono text-[10px] text-neutral-400">reports generated</span>}</>,
            border: "border-r border-black",
        },
        {
            label: "Pain Points",
            icon: AlertCircle,
            numValue: activePainPoints,
            displayValue: <AnimatedNumber value={activePainPoints} />,
            sub: <span className="font-mono text-[10px] text-neutral-400">problems tracked</span>,
            border: "",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 border border-black">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07, ease: "easeOut" }}
                    className={`p-5 ${stat.border}`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                            {stat.label}
                        </span>
                        <stat.icon className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-bold">{stat.displayValue}</div>
                    <p className="font-mono text-[10px] mt-1">{stat.sub}</p>
                </motion.div>
            ))}
        </div>
    );
}
