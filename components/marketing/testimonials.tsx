const testimonials = [
    {
        name: "Sarah Chen",
        role: "CTO at TechFlow",
        content: "Trackr completely changed how we manage our SaaS spending. We found $4k/mo in unused subscriptions in the first week.",
        initials: "SC"
    },
    {
        name: "Marcus Rodriguez",
        role: "Founder, GrowthAI",
        content: "The agent-based discovery is magic. I don't look for tools anymore; Trackr just tells me what I should be using.",
        initials: "MR"
    },
    {
        name: "Emily Watson",
        role: "Operations Lead",
        content: "Finally, a single source of truth for our stack. Onboarding new employees is 10x faster now that we know exactly who needs access to what.",
        initials: "EW"
    },
    {
        name: "David Kim",
        role: "Product Manager",
        content: "The ROI analysis features helped us cut 3 redundant analytics tools. It paid for itself instantly.",
        initials: "DK"
    },
    {
        name: "Alice Johnson",
        role: "VP of Engineering",
        content: "Security compliance was a nightmare before Trackr. Now we have visibility into every shadow IT tool being used.",
        initials: "AJ"
    },
    {
        name: "Tom Baker",
        role: "Startup Founder",
        content: "If you're running a lean team, you need this. It's like having a dedicated IT operations manager for a fraction of the cost.",
        initials: "TB"
    }
];

export function Testimonials() {
    return (
        <section className="py-24 border-y border-black bg-[#F3F3EF]">
            <div className="container mx-auto px-4">
                <div className="mb-16">
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">Social Proof</p>
                    <h2 className="font-serif text-4xl font-normal mb-3">Trusted by modern teams</h2>
                    <p className="font-mono text-sm text-neutral-500 max-w-lg">
                        Join hundreds of high-growth companies using Trackr to optimize their operations.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border border-black">
                    {testimonials.map((testimonial, i) => (
                        <div
                            key={i}
                            className={`bg-white p-8 flex flex-col gap-4 ${
                                i % 3 !== 2 ? "lg:border-r border-black" : ""
                            } ${i % 2 === 0 ? "md:border-r border-black lg:border-r-0" : ""} ${
                                i < testimonials.length - 3 ? "border-b border-black" : ""
                            }`}
                        >
                            <p className="font-mono text-sm text-neutral-600 leading-relaxed flex-1">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                                <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <div className="font-mono text-xs font-semibold">{testimonial.name}</div>
                                    <div className="font-mono text-[10px] text-neutral-500">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
