import {
    LayoutDashboard,
    Database,
    Search,
    Rss,
    Zap,
    MessageSquare,
    Layers,
    BarChart3,
    AlertCircle,
    GitCompareArrows,
    SlidersHorizontal,
    Sparkles,
    Gift,
    CreditCard,
    Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Tool Database", href: "/tools", icon: Database },
    { title: "Discover", href: "/discover", icon: Search },
    { title: "Your Feed", href: "/feed", icon: Rss },
    { title: "Research Queue", href: "/queue", icon: Zap },
    { title: "Ask Trackr AI", href: "/ask", icon: MessageSquare },
    { title: "Software Stack", href: "/stack", icon: Layers },
    { title: "Analytics", href: "/analytics", icon: BarChart3 },
    { title: "Pain Points", href: "/pain-points", icon: AlertCircle },
    { title: "Compare", href: "/compare", icon: GitCompareArrows },
    { title: "Scorecard", href: "/scorecard", icon: SlidersHorizontal },
    { title: "Advertise", href: "/advertise", icon: Sparkles },
    { title: "Referrals", href: "/referrals", icon: Gift },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
    { title: "Billing", href: "/settings/billing", icon: CreditCard },
    { title: "Workspace", href: "/workspace", icon: Settings },
];
