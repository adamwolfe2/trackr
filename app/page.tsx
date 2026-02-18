import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "@/components/marketing/hero-demo";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Database,
  BarChart3,
  Users,
  Layers,
  Cpu
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
              T
            </div>
            Trackr
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-black dark:hover:text-white transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium hover:text-black dark:hover:text-white text-zinc-600 dark:text-zinc-400">Log in</Link>
            <Link href="/sign-up">
              <Button className="rounded-full px-6 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-8 animate-fade-in-up">
            <Cpu className="w-3 h-3" />
            <span>Powered by Firecrawl Agents</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up stagger-1 text-balance">
            Run All Your Teams <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              In True Parallel
            </span>
          </h1>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12 animate-fade-in-up stagger-2 text-balance leading-relaxed">
            AI operational infrastructure for multi-company founders & builders.
            Trackr automates tool discovery, manages your stack, and keeps every
            entity accountable through unified dashboards.
          </p>

          <div className="animate-fade-in-up stagger-3 mb-24">
            <HeroDemo />
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-4 py-24">
          <div className="mb-16">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Core Capabilities</h2>
            <h3 className="text-3xl font-bold">Everything you need to run on AI</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover-lift card-interactive group">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3">Tool Database</h4>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                A centralized repository for all your AI tools. Track status, pricing, and usage across your entire organization.
              </p>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Automated discovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Usage tracking</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover-lift card-interactive group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3">AI Agents</h4>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                Deploy Firecrawl agents to scout the web for new tools, scrape pricing pages, and generate competitive analysis reports.
              </p>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Deep web scraping</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Auto-summarization</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover-lift card-interactive group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3">Analytics & ROI</h4>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                Measure the impact of your AI stack. Track implementation scores and validte that tools are actually solving pain points.
              </p>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  <span>Performance metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  <span>Team adoption stats</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Agent Section */}
        <section className="bg-zinc-900 text-white py-24 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-emerald-300 mb-6">
                  <Sparkles className="w-3 h-3" />
                  <span>New Intelligence Layer</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Agents for everything</h2>
                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                  Stop manually searching G2 or ProductHunt. Trackr's autonomous agents operate 24/7 to find, vet, and compare tools based on your specific requirements.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-1">1</div>
                    <div>
                      <h4 className="font-bold">Describe your need</h4>
                      <p className="text-sm text-zinc-400">"I need a CRM for a 5-person agency."</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-1">2</div>
                    <div>
                      <h4 className="font-bold">Agents go to work</h4>
                      <p className="text-sm text-zinc-400">They scrape pricing, read docs, and check reviews.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-1">3</div>
                    <div>
                      <h4 className="font-bold">Get a decision matrix</h4>
                      <p className="text-sm text-zinc-400">Receive a scored comparison table, ready for action.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                {/* Abstract Visual representation of agents */}
                <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full group-hover:bg-emerald-500/30 transition-all duration-1000"></div>

                  <div className="relative z-10 grid gap-4">
                    <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 animate-fade-in-up stagger-1">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-white/10 rounded"></div>
                      </div>
                      <div className="ml-auto text-xs text-emerald-400 font-mono">Running...</div>
                    </div>
                    <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 animate-fade-in-up stagger-2 ml-8">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-white/10 rounded"></div>
                      </div>
                      <div className="ml-auto text-xs text-emerald-400 font-mono">Scraping</div>
                    </div>
                    <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 animate-fade-in-up stagger-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-white/10 rounded"></div>
                      </div>
                      <div className="ml-auto text-xs text-emerald-400 font-mono">Indexing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-32 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to organize your AI stack?</h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join hundreds of founders using Trackr to gain visibility and control over their tools.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full px-8 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 h-12 text-base font-semibold">
                Start building with AI agents
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          <p>&copy; 2024 Trackr Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
