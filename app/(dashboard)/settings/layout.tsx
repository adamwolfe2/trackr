import { SettingsNav } from "@/components/layout/settings-nav";
import type { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <SettingsNav />
            {children}
        </div>
    );
}
