"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ARCHITECT_ROLES } from "@/lib/config/architect-roles";

export default function ApplyRolePage() {
    const params = useParams<{ roleSlug: string }>();
    const router = useRouter();
    const role = ARCHITECT_ROLES.find((r) => r.slug === params.roleSlug);

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    if (!role) {
        return (
            <main className="min-h-screen bg-[#F3F3EF] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-serif text-3xl mb-4">Role not found</h1>
                    <Link href="/apply" className="font-mono text-xs uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                        Back to roles
                    </Link>
                </div>
            </main>
        );
    }

    if (submitted) {
        return (
            <main className="min-h-screen bg-[#F3F3EF] flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Application received</p>
                    <h1 className="font-serif text-4xl font-normal mb-4">Thank you.</h1>
                    <p className="font-mono text-sm text-neutral-600 leading-relaxed mb-8">
                        We review applications within 48 hours. You'll receive an email with next steps once your application has been reviewed.
                    </p>
                    <Link href="/" className="font-mono text-xs uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                        Back to Trackr
                    </Link>
                </div>
            </main>
        );
    }

    function clearFieldError(field: string) {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => { const { [field]: _, ...rest } = prev; return rest; });
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const form = new FormData(e.currentTarget);
        const firstName = (form.get("firstName") as string)?.trim();
        const lastName = (form.get("lastName") as string)?.trim();
        const email = (form.get("email") as string)?.trim();

        const newErrors: Record<string, string> = {};
        if (!firstName) newErrors.firstName = "First name is required";
        if (!lastName) newErrors.lastName = "Last name is required";
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }
        setFieldErrors({});
        setSubmitting(true);

        const payload = {
            firstName: form.get("firstName") as string,
            lastName: form.get("lastName") as string,
            email: form.get("email") as string,
            phone: (form.get("phone") as string) || undefined,
            linkedinUrl: (form.get("linkedinUrl") as string) || undefined,
            roleSlug: params.roleSlug,
            experience: (form.get("experience") as string) || undefined,
            portfolioUrl: (form.get("portfolioUrl") as string) || undefined,
            referralSource: (form.get("referralSource") as string) || undefined,
        };

        try {
            const res = await fetch("/api/architect/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                return;
            }
            setSubmitted(true);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F3F3EF] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/apply"
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-8"
                >
                    <ArrowLeft className="w-3 h-3" />
                    All roles
                </Link>

                <div className="mb-8">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Applying as</p>
                    <h1 className="font-serif text-4xl font-normal mb-2">{role.title}</h1>
                    <p className="font-mono text-sm text-neutral-600">{role.description}</p>
                </div>

                <form onSubmit={handleSubmit} className="border border-black bg-white p-8 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="firstName" className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                                First name *
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                onChange={() => clearFieldError("firstName")}
                                className={`w-full border px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black ${fieldErrors.firstName ? "border-red-500" : "border-black"}`}
                            />
                            {fieldErrors.firstName && <p className="text-red-500 font-mono text-xs mt-1">{fieldErrors.firstName}</p>}
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                                Last name *
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                onChange={() => clearFieldError("lastName")}
                                className={`w-full border px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black ${fieldErrors.lastName ? "border-red-500" : "border-black"}`}
                            />
                            {fieldErrors.lastName && <p className="text-red-500 font-mono text-xs mt-1">{fieldErrors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                            Email *
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            onChange={() => clearFieldError("email")}
                            className={`w-full border px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black ${fieldErrors.email ? "border-red-500" : "border-black"}`}
                        />
                        {fieldErrors.email && <p className="text-red-500 font-mono text-xs mt-1">{fieldErrors.email}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="phone" className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                                Phone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label htmlFor="linkedinUrl" className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                                LinkedIn URL
                            </label>
                            <input
                                id="linkedinUrl"
                                name="linkedinUrl"
                                type="url"
                                placeholder="https://linkedin.com/in/..."
                                className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="experience" className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                            Why are you a good fit? *
                        </label>
                        <textarea
                            id="experience"
                            name="experience"
                            required
                            rows={4}
                            placeholder="Describe a specific engagement where you drove measurable outcomes through AI tooling — revenue generated, costs reduced, or operational improvements delivered. Include your role, the client context, and the result."
                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="portfolioUrl" className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                            Portfolio or website URL
                        </label>
                        <input
                            id="portfolioUrl"
                            name="portfolioUrl"
                            type="url"
                            placeholder="https://..."
                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label htmlFor="referralSource" className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                            How did you hear about Trackr?
                        </label>
                        <input
                            id="referralSource"
                            name="referralSource"
                            type="text"
                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div className="border-t border-neutral-200 pt-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-0.5 accent-black"
                            />
                            <span className="font-mono text-xs text-neutral-600 leading-relaxed">
                                I agree to the{" "}
                                <Link href="/legal/architect-terms" className="underline hover:text-black" target="_blank" rel="noopener noreferrer">
                                    Architect Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/legal/privacy-policy" className="underline hover:text-black" target="_blank" rel="noopener noreferrer">
                                    Privacy Policy
                                </Link>
                                .
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div className="border border-red-600 bg-red-50 px-4 py-3">
                            <p className="font-mono text-xs text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !agreedToTerms}
                        className="w-full border border-black bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                        {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                </form>
            </div>
        </main>
    );
}
