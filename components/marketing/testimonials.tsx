import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Trusted by modern teams</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Join hundreds of high-growth companies using Trackr to optimize their operations.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
                            <p className="text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`} />
                                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-bold text-sm">{testimonial.name}</div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
