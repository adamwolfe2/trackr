import { redirect } from "next/navigation";

// Settings hub — redirect to workspace settings which is the primary settings page.
// /settings/billing remains a separate route for billing management.
export default function SettingsPage() {
    redirect("/workspace");
}
