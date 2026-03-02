import type { Metadata } from "next";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
    title: "Privacy Policy — Trackr",
    description: "How Trackr collects, uses, and protects your information, including data related to the AI Architect Program.",
    alternates: { canonical: "https://trytrackr.com/legal/privacy-policy" },
    robots: { index: true },
};

export default function PrivacyPolicyPage() {
    return (
        <>
            <main className="flex-grow w-full max-w-6xl mx-auto px-6">
                <MarketingNavigation isLoggedIn={false} />

                <section className="py-16 border-t border-black/10 max-w-3xl">
                    <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Legal</span>
                    <h1 className="font-serif text-4xl font-normal mb-2">Privacy Policy</h1>
                    <p className="font-mono text-xs text-neutral-400 mb-12">Last updated: March 2026</p>

                    <div className="space-y-10 font-mono text-sm text-neutral-700 leading-relaxed">
                        <div>
                            <h2 className="font-serif text-xl font-normal mb-3 text-black">1. Information We Collect</h2>
                            <p className="mb-3">We collect information you provide directly to us, including when you create an account, submit an audit form, apply to the AI Architect Program, or contact us. This includes:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Account information: name, email address, password (managed by Clerk)</li>
                                <li>Workspace data: company name, tools, research history, configuration</li>
                                <li>Audit submissions: company details, AI readiness responses, tool stack</li>
                                <li>Architect applications: name, email, phone, LinkedIn URL, portfolio, experience</li>
                                <li>Architect program data: referral activity, commission history, payout records</li>
                                <li>Payment information: processed and stored by Stripe; Trackr stores only account identifiers and transaction status</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-serif text-xl font-normal mb-3 text-black">2. How We Use Your Information</h2>
                            <p className="mb-3">We use collected information to:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process audit submissions and generate AI scorecards</li>
                                <li>Administer the AI Architect Program, including referral tracking and commission payments</li>
                                <li>Send transactional emails (account, billing, program updates)</li>
                                <li>Prevent fraud and enforce our terms</li>
                                <li>Analyze usage to improve the product</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-serif text-xl font-normal mb-3 text-black">3. Stripe Connect (AI Architects)</h2>
                            <p>Architect financial data, including bank account details and identity verification, is handled entirely by Stripe per Stripe&rsquo;s own privacy policy. Trackr stores only: Stripe Connect account identifiers, onboarding completion status, transfer identifiers, and payout status. We do not have access to Architects&rsquo; bank account numbers, SSN, or other sensitive financial data collected by Stripe.</p>
                        </div>

                        <div>
                            <h2 className="font-serif text-xl font-normal mb-3 text-black">4. Data Retention</h2>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Active accounts: data retained for the duration of the relationship</li>
                                <li>Deleted accounts: personal data removed within 30 days; anonymized usage data may be retained</li>
                                <li>Architect applications (rejected): retained for 2 years, then deleted</li>
                                <li>Architect program data (active/terminated): retained for the duration of the relationship plus 7 years for tax and legal compliance</li>
                                <li>Audit submissions: retained indefinitely for product improvement (may be anonymized after 2 years)</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-serif text-xl font-normal mb-3 text-black">5. Third-Party Services</h2>
                            <p className="mb-3">We share data with the following service providers, each operating under their own privacy policies:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Stripe — payment processing and Architect payouts</li>
                                <li>Clerk — authentication and user management</li>
                                <li>Resend — transactional email delivery</li>
                                <li>Vercel — hosting and infrastructure</li>
                                <li>Neon — database hosting</li>
                                <li>PostHog — product analytics</li>
                                <li>OpenAI — AI scorecard generation (audit data is processed but not used for training)</li>
                                <li>Firecrawl — website enrichment for audit scorecards</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-serif text-xl font-normal mb-3 text-black">6. Your Rights</h2>
                            <p className="mb-3">You have the right to:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Access the personal data we hold about you</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data (subject to legal retention requirements)</li>
                                <li>Export your data in a portable format</li>
                                <li>Withdraw consent for optional data processing</li>
                            </ul>
                            <p className="mt-3">To exercise these rights, contact us at adamwolfe102@gmail.com.</p>
                        </div>

                        <div>
                            <h2 className="font-serif text-xl font-normal mb-3 text-black">7. CCPA / GDPR</h2>
                            <p>We do not sell personal information. California residents have the right to know what data we collect, request deletion, and opt-out of sale (which we do not engage in). EU residents have additional rights under GDPR including the right to lodge a complaint with a supervisory authority. For data subject requests, contact adamwolfe102@gmail.com.</p>
                        </div>

                        <div>
                            <h2 className="font-serif text-xl font-normal mb-3 text-black">8. Contact</h2>
                            <p>For questions about this privacy policy, contact us at adamwolfe102@gmail.com.</p>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </>
    );
}
