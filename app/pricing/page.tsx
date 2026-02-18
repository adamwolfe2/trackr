import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/lib/config/subscriptions";

import { Header } from "@/components/marketing/header";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-emerald-500/30">
            <Header />

            <main className="pt-32 pb-16 container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">
                        Start for free, scale as you grow. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
                    {/* Free Plan */}
                    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-zinc-500 mb-2">Free</h3>
                            <div className="text-4xl font-bold">$0<span className="text-lg font-normal text-zinc-500">/mo</span></div>
                            <p className="text-sm text-zinc-500 mt-2">Perfect for side projects and small teams.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>Up to {PLANS.FREE.limits.tools} tools tracked</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>{PLANS.FREE.limits.research} deep research credits</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>Basic analytics</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-400">
                                <X className="w-5 h-5" />
                                <span>Team collaboration</span>
                            </li>
                        </ul>
                        <Link href="/sign-up">
                            <Button variant="outline" className="w-full rounded-xl h-12 text-base">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-50/10 p-8 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-emerald-600 dark:text-emerald-400 mb-2">Pro</h3>
                            <div className="text-4xl font-bold">$19<span className="text-lg font-normal text-zinc-500">/mo</span></div>
                            <p className="text-sm text-zinc-500 mt-2">For growing teams and power users.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>Up to {PLANS.PRO.limits.tools === Infinity ? 'Unlimited' : PLANS.PRO.limits.tools} tools tracked</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>{PLANS.PRO.limits.research === Infinity ? 'Unlimited' : PLANS.PRO.limits.research} deep research credits</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>Advanced analytics & ROI</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>Priority support</span>
                            </li>
                        </ul>
                        <Link href="/sign-up">
                            <Button className="w-full rounded-xl h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white">
                                Upgrade to Pro
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                            <h4 className="font-bold mb-2">Can I cancel anytime?</h4>
                            <p className="text-zinc-600 dark:text-zinc-400">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
                        </div>
                        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                            <h4 className="font-bold mb-2">What counts as a "tool"?</h4>
                            <p className="text-zinc-600 dark:text-zinc-400">Any software or SaaS product you track in your dashboard counts towards your limit.</p>
                        </div>
                        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                            <h4 className="font-bold mb-2">Do you offer enterprise plans?</h4>
                            <p className="text-zinc-600 dark:text-zinc-400">Yes, contact us for custom limits, SSO, and dedicated support.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-900 mt-24">
                <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
                    <p>&copy; 2024 Trackr Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
