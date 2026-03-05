"use client";

import { useState, useTransition } from "react";
import { connectIntegration, disconnectIntegration, type IntegrationProvider } from "@/lib/actions/integrations";
import { toast } from "sonner";
import { Loader2, Link2, Unlink, CreditCard, FileText } from "lucide-react";

interface Integration {
    id: string;
    provider: string;
    status: string;
    lastSyncAt: Date | null;
    metadata: unknown;
}

interface IntegrationsClientProps {
    connectedIntegrations: Integration[];
}

const PROVIDERS: Array<{
    provider: IntegrationProvider;
    name: string;
    description: string;
    category: string;
    icon: typeof CreditCard;
}> = [
    { provider: "ramp", name: "Ramp", description: "Auto-sync SaaS transactions from your Ramp corporate card", category: "Spend Management", icon: CreditCard },
    { provider: "brex", name: "Brex", description: "Import software spend from Brex card transactions", category: "Spend Management", icon: CreditCard },
    { provider: "billcom", name: "Bill.com", description: "Sync vendor payments and invoices from Bill.com", category: "Spend Management", icon: CreditCard },
    { provider: "notion", name: "Notion", description: "Push tool reports and decision logs to your Notion workspace", category: "Knowledge Base", icon: FileText },
    { provider: "confluence", name: "Confluence", description: "Push reports and board summaries to Confluence spaces", category: "Knowledge Base", icon: FileText },
];

export function IntegrationsClient({ connectedIntegrations }: IntegrationsClientProps) {
    const [isPending, startTransition] = useTransition();
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const connectedMap = new Map(
        connectedIntegrations.map((i) => [i.provider, i])
    );

    const handleConnect = (provider: IntegrationProvider) => {
        setLoadingProvider(provider);
        startTransition(async () => {
            try {
                await connectIntegration(provider);
                toast.success(`${provider} connected. Configure sync settings below.`);
            } catch {
                toast.error(`Failed to connect ${provider}.`);
            } finally {
                setLoadingProvider(null);
            }
        });
    };

    const handleDisconnect = (provider: IntegrationProvider) => {
        setLoadingProvider(provider);
        startTransition(async () => {
            try {
                await disconnectIntegration(provider);
                toast.success(`${provider} disconnected.`);
            } catch {
                toast.error(`Failed to disconnect ${provider}.`);
            } finally {
                setLoadingProvider(null);
            }
        });
    };

    const categories = [...new Set(PROVIDERS.map((p) => p.category))];

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">Settings</p>
                <h1 className="font-serif text-2xl font-normal">Integrations</h1>
                <p className="font-mono text-xs text-neutral-500 mt-1">
                    Connect third-party services to automate spend tracking and push reports.
                </p>
            </div>

            {categories.map((category) => (
                <div key={category}>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-3">{category}</p>
                    <div className="border border-black divide-y divide-neutral-100">
                        {PROVIDERS.filter((p) => p.category === category).map((p) => {
                            const connection = connectedMap.get(p.provider);
                            const isConnected = connection?.status === "connected";
                            const isLoading = loadingProvider === p.provider && isPending;

                            return (
                                <div key={p.provider} className="bg-white p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 border border-black flex items-center justify-center flex-shrink-0">
                                        <p.icon className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-mono text-sm font-bold">{p.name}</h3>
                                            {isConnected && (
                                                <span className="font-mono text-[9px] uppercase tracking-widest border border-black px-2 py-0.5">
                                                    Connected
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-mono text-xs text-neutral-500 leading-relaxed">{p.description}</p>
                                        {isConnected && connection?.lastSyncAt && (
                                            <p className="font-mono text-[10px] text-neutral-400 mt-1">
                                                Last synced: {new Date(connection.lastSyncAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        {isConnected ? (
                                            <button
                                                onClick={() => handleDisconnect(p.provider)}
                                                disabled={isLoading}
                                                className="flex items-center gap-1.5 border border-black px-3 py-2 font-mono text-[10px] uppercase tracking-wide hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                            >
                                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                                                Disconnect
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleConnect(p.provider)}
                                                disabled={isLoading}
                                                className="flex items-center gap-1.5 bg-black text-white px-3 py-2 font-mono text-[10px] uppercase tracking-wide border border-black disabled:opacity-50 hover:bg-neutral-800 transition-colors"
                                            >
                                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                                                Connect
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="border border-black bg-[#F3F3EF] p-5 max-w-2xl">
                <p className="font-mono text-xs font-bold mb-2">Coming Soon</p>
                <p className="font-mono text-[10px] text-neutral-500 leading-relaxed">
                    OAuth-based connections for Ramp, Brex, and Bill.com are in development. For now, connect to enable the sync framework — automatic transaction import will be available soon. Notion and Confluence push is available now for connected workspaces.
                </p>
            </div>
        </div>
    );
}
