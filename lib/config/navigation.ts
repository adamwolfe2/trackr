import {
    LayoutDashboard,
    Activity,
    Database,
    Search,
    Eye,
    Rss,
    Zap,
    ClipboardCheck,
    Calendar,
    FileStack,
    MessageSquare,
    Layers,
    GitCompareArrows,
    Shield,
    BarChart3,
    FileText,
    BookOpen,
    SlidersHorizontal,
    GraduationCap,
    AlertCircle,
    Sparkles,
    Gift,
    Link2,
    CreditCard,
    Settings,
    Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    section?: string;
    featureGate?: string; // Feature key from PlanFeatures or enterprise feature name
};

export type NavSection = {
    label: string;
    items: NavItem[];
};

// Flat list for backward compatibility
export const NAV_ITEMS: NavItem[] = [
    // Core
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Core" },
    { title: "Stack Health", href: "/health", icon: Activity, section: "Core", featureGate: "stackHealth" },
    { title: "Tool Database", href: "/tools", icon: Database, section: "Core" },
    { title: "Discover", href: "/discover", icon: Search, section: "Core" },
    { title: "Competitors", href: "/competitors", icon: Eye, section: "Core", featureGate: "competitorIntel" },
    { title: "Your Feed", href: "/feed", icon: Rss, section: "Core" },
    // Workflow
    { title: "Research Queue", href: "/queue", icon: Zap, section: "Workflow" },
    { title: "Procurement", href: "/procurement", icon: ClipboardCheck, section: "Workflow", featureGate: "procurement" },
    { title: "Calendar", href: "/calendar", icon: Calendar, section: "Workflow", featureGate: "calendar" },
    { title: "Contracts", href: "/contracts", icon: FileStack, section: "Workflow", featureGate: "contracts" },
    // Intelligence
    { title: "Ask Trackr AI", href: "/ask", icon: MessageSquare, section: "Intelligence" },
    { title: "Software Stack", href: "/stack", icon: Layers, section: "Intelligence" },
    { title: "Compare", href: "/compare", icon: GitCompareArrows, section: "Intelligence" },
    { title: "Risk Monitor", href: "/risk", icon: Shield, section: "Intelligence", featureGate: "riskMonitor" },
    // Reports
    { title: "Analytics", href: "/analytics", icon: BarChart3, section: "Reports" },
    { title: "Board Reports", href: "/reports", icon: FileText, section: "Reports", featureGate: "boardReports" },
    { title: "Decision Log", href: "/decisions", icon: BookOpen, section: "Reports", featureGate: "decisionLog" },
    // Team
    { title: "Scorecard", href: "/settings/scorecard", icon: SlidersHorizontal, section: "Team" },
    { title: "Team Literacy", href: "/literacy", icon: GraduationCap, section: "Team", featureGate: "teamLiteracy" },
    { title: "Pain Points", href: "/pain-points", icon: AlertCircle, section: "Team" },
    // Growth
    { title: "Advertise", href: "/advertise", icon: Sparkles, section: "Growth" },
    { title: "Referrals", href: "/referrals", icon: Gift, section: "Growth" },
];

// Grouped navigation for sidebar sections
export const NAV_SECTIONS: NavSection[] = [
    {
        label: "Core",
        items: NAV_ITEMS.filter((i) => i.section === "Core"),
    },
    {
        label: "Workflow",
        items: NAV_ITEMS.filter((i) => i.section === "Workflow"),
    },
    {
        label: "Intelligence",
        items: NAV_ITEMS.filter((i) => i.section === "Intelligence"),
    },
    {
        label: "Reports",
        items: NAV_ITEMS.filter((i) => i.section === "Reports"),
    },
    {
        label: "Team",
        items: NAV_ITEMS.filter((i) => i.section === "Team"),
    },
    {
        label: "Growth",
        items: NAV_ITEMS.filter((i) => i.section === "Growth"),
    },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
    { title: "Public Profile", href: "/settings/public-profile", icon: Globe },
    { title: "Integrations", href: "/settings/integrations", icon: Link2 },
    { title: "Billing", href: "/settings/billing", icon: CreditCard },
    { title: "Workspace", href: "/workspace", icon: Settings },
];
