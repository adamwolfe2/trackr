import { redirect } from "next/navigation";

// Redirect root dashboard path to /dashboard to avoid stale duplicate
export default function RootDashboardRedirect() {
    redirect("/dashboard");
}
