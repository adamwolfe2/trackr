import { SignUp } from "@clerk/nextjs";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const params = await searchParams;
    const plan = params.plan ?? "";

    // Build redirect URL: if plan context exists, carry it into onboarding
    const redirectUrl = plan ? `/onboarding?plan=${plan}` : "/onboarding";

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <SignUp forceRedirectUrl={redirectUrl} />
        </div>
    );
}
