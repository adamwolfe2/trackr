import { redirect } from "next/navigation";

// /research/templates redirects to /research (which has the Templates tab)
export default function TemplatesIndexPage() {
    redirect("/research");
}
