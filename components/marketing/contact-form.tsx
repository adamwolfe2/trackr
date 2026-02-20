"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/actions/contact";
import { Loader2, Check } from "lucide-react";

const TYPES = [
    { value: "general" as const, label: "General" },
    { value: "sales" as const, label: "Sales / Enterprise" },
    { value: "support" as const, label: "Support" },
];

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [type, setType] = useState<"general" | "sales" | "support">("general");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const result = await submitContactForm({ name, email, type, message });

        setSubmitting(false);
        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error ?? "Something went wrong.");
        }
    };

    if (submitted) {
        return (
            <div className="border border-black p-8 text-center space-y-3">
                <div className="w-10 h-10 bg-black text-white mx-auto flex items-center justify-center">
                    <Check className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl">Message sent.</h3>
                <p className="font-mono text-xs text-neutral-500">
                    We&apos;ll get back to you within 1 business day.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="border border-black">
            <div className="border-b border-black px-6 py-4">
                <span className="font-mono text-xs uppercase tracking-widest font-bold">Send a Message</span>
            </div>

            <div className="p-6 space-y-5">
                {/* Type selector */}
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
                        What can we help with?
                    </label>
                    <div className="flex gap-0 border border-black w-fit">
                        {TYPES.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
                                className={`px-4 py-2 font-mono text-xs transition-colors border-r last:border-r-0 border-black ${
                                    type === t.value
                                        ? "bg-black text-white"
                                        : "bg-white text-black hover:bg-neutral-100"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border border-black px-3 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-black px-3 py-2.5 font-mono text-sm bg-white focus:outline-none"
                            placeholder="you@company.com"
                        />
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        minLength={10}
                        maxLength={2000}
                        className="w-full border border-black px-3 py-2.5 font-mono text-sm bg-white focus:outline-none resize-none"
                        placeholder="Tell us how we can help..."
                    />
                </div>

                {error && (
                    <p className="font-mono text-xs text-red-600">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest border border-black hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Sending...
                        </span>
                    ) : (
                        "Send Message"
                    )}
                </button>
            </div>
        </form>
    );
}
