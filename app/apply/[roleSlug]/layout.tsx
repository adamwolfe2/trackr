import type { Metadata } from "next";
import { ARCHITECT_ROLES } from "@/lib/config/architect-roles";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ roleSlug: string }>;
}): Promise<Metadata> {
    const { roleSlug } = await params;
    const role = ARCHITECT_ROLES.find((r) => r.slug === roleSlug);
    const title = role ? `Apply — ${role.title} | Trackr` : "Apply | Trackr";
    const description = role?.description ?? "Apply to become a Trackr AI Architect and earn commissions by helping companies adopt the right AI tools.";

    return {
        title,
        description,
        openGraph: { title, description },
    };
}

export default function ApplyRoleLayout({ children }: { children: React.ReactNode }) {
    return children;
}
