"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, User, Trash2, Check, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CHAT_STORAGE_KEY as STORAGE_KEY } from "@/lib/constants/app";

function TrackrIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="0" y="0" width="12" height="2" fill="white" />
            <rect x="0" y="4" width="12" height="2" fill="white" />
            <rect x="0" y="8" width="12" height="2" fill="white" />
        </svg>
    );
}

type ToolProgress = { name: string; label: string; done: boolean };

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    toolCalls?: ToolProgress[];
};

function loadStoredMessages(): ChatMessage[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
        return [];
    }
}

function saveMessages(msgs: ChatMessage[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch {
        // quota exceeded
    }
}

export default function AskTrackrPage() {
    const [messages, setMessages] = useState<ChatMessage[]>(loadStoredMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTools, setActiveTools] = useState<ToolProgress[]>([]);
    const [streamingText, setStreamingText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Persist messages
    useEffect(() => {
        if (messages.length > 0) saveMessages(messages);
    }, [messages]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTools, streamingText]);

    const handleNewChat = () => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([]);
        setActiveTools([]);
        setStreamingText("");
        setError(null);
    };

    const sendMessage = useCallback(async (text: string) => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);
        setActiveTools([]);
        setStreamingText("");

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);

        // Build API payload — only role + content
        const apiMessages = updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
        }));

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: apiMessages }),
                signal: controller.signal,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const msg = res.status === 429
                    ? "Too many requests — please wait a moment and try again."
                    : (data as { error?: string }).error || "Something went wrong. Please try again.";
                setError(msg);
                setIsLoading(false);
                return;
            }

            if (!res.body) {
                setError("No response received.");
                setIsLoading(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let finalText = "";
            const toolProgress: ToolProgress[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split("\n\n");
                buffer = parts.pop() || "";

                for (const part of parts) {
                    const eventMatch = part.match(/^event: (.+)$/m);
                    const dataMatch = part.match(/^data: (.+)$/m);
                    if (!eventMatch || !dataMatch) continue;

                    const event = eventMatch[1];
                    let data: Record<string, unknown>;
                    try {
                        data = JSON.parse(dataMatch[1]);
                    } catch {
                        continue;
                    }

                    switch (event) {
                        case "tool_start": {
                            const tool: ToolProgress = {
                                name: data.name as string,
                                label: data.label as string,
                                done: false,
                            };
                            toolProgress.push(tool);
                            setActiveTools([...toolProgress]);
                            break;
                        }
                        case "tool_done": {
                            const t = toolProgress.find((tp) => tp.name === data.name && !tp.done);
                            if (t) t.done = true;
                            setActiveTools([...toolProgress]);
                            break;
                        }
                        case "text": {
                            finalText += data.text as string;
                            setStreamingText(finalText);
                            break;
                        }
                        case "error": {
                            setError(data.message as string);
                            break;
                        }
                        case "done": {
                            // Finalize assistant message
                            if (finalText) {
                                const assistantMsg: ChatMessage = {
                                    id: crypto.randomUUID(),
                                    role: "assistant",
                                    content: finalText,
                                    toolCalls: toolProgress.length > 0 ? [...toolProgress] : undefined,
                                };
                                setMessages((prev) => [...prev, assistantMsg]);
                            }
                            break;
                        }
                    }
                }
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
            setActiveTools([]);
            setStreamingText("");
            abortRef.current = null;
        }
    }, [isLoading, messages]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput("");
        sendMessage(trimmed);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="mb-4">
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-1">AI Assistant</p>
                <h1 className="font-serif text-2xl font-normal">Ask Trackr</h1>
                <p className="font-mono text-xs text-neutral-500 mt-1">
                    Query your workspace knowledge base with natural language.
                </p>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col border border-black overflow-hidden">
                {/* Chat Header */}
                <div className="border-b border-black px-5 py-3 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-black flex items-center justify-center">
                            <TrackrIcon className="w-3 h-3" />
                        </div>
                        <span className="font-mono text-xs uppercase tracking-widest">Trackr Assistant</span>
                    </div>
                    {messages.length > 0 && (
                        <button
                            onClick={handleNewChat}
                            className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400 hover:text-black transition-colors border border-transparent hover:border-black px-2 py-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            New Chat
                        </button>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F3F3EF]">
                    {messages.length === 0 && !isLoading && (
                        <div className="py-12 text-center space-y-6">
                            <div>
                                <p className="font-serif text-lg text-neutral-600 mb-1">
                                    Ask anything about your tools.
                                </p>
                                <p className="font-mono text-[10px] text-neutral-400">
                                    Powered by your workspace research data.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                                {[
                                    "What's my total software spend this month?",
                                    "Compare Slack vs Microsoft Teams",
                                    "Which tools are up for renewal soon?",
                                    "Show me tools with high risk alerts",
                                    "What are our team's biggest pain points?",
                                    "What's our stack health score?",
                                ].map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => sendMessage(prompt)}
                                        disabled={isLoading}
                                        className="border border-black bg-white px-3 py-1.5 font-mono text-[10px] hover:bg-black hover:text-white transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {m.role !== "user" && (
                                <div className="w-6 h-6 bg-black flex items-center justify-center shrink-0 mt-0.5">
                                    <TrackrIcon className="w-3.5 h-3.5" />
                                </div>
                            )}
                            <div
                                className={`max-w-[75%] border border-black px-4 py-3 font-mono text-xs leading-relaxed ${
                                    m.role === "user"
                                        ? "bg-black text-white"
                                        : "bg-white text-black"
                                }`}
                            >
                                {m.role === "user" ? (
                                    m.content
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                                            li: ({ children }) => <li className="ml-2">{children}</li>,
                                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                            em: ({ children }) => <em className="italic">{children}</em>,
                                            code: ({ children }) => <code className="bg-neutral-100 border border-neutral-200 px-1 py-0.5 text-[10px] rounded-none">{children}</code>,
                                            h1: ({ children }) => <p className="font-bold text-sm mb-1">{children}</p>,
                                            h2: ({ children }) => <p className="font-bold mb-1">{children}</p>,
                                            h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                                            table: ({ children }) => <div className="overflow-x-auto mb-2"><table className="border border-black text-[10px] w-full">{children}</table></div>,
                                            th: ({ children }) => <th className="border border-black px-2 py-1 bg-black text-white text-left font-mono font-bold">{children}</th>,
                                            td: ({ children }) => <td className="border border-black px-2 py-1">{children}</td>,
                                            hr: () => <hr className="border-black/20 my-2" />,
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                            {m.role === "user" && (
                                <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 mt-0.5 bg-black">
                                    <User className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Tool progress + streaming text during loading */}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-6 h-6 bg-black flex items-center justify-center shrink-0 mt-0.5">
                                <TrackrIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="max-w-[75%] space-y-2">
                                {activeTools.length > 0 && (
                                    <div className="border border-black px-4 py-3 bg-white font-mono text-[10px] space-y-1.5">
                                        {activeTools.map((t, i) => (
                                            <div key={`${t.name}-${i}`} className="flex items-center gap-2">
                                                {t.done ? (
                                                    <Check className="w-3 h-3 text-neutral-400" />
                                                ) : (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                )}
                                                <span className={t.done ? "text-neutral-400" : ""}>{t.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {streamingText ? (
                                    <div className="border border-black px-4 py-3 bg-white font-mono text-xs leading-relaxed text-black">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                                                li: ({ children }) => <li className="ml-2">{children}</li>,
                                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                                em: ({ children }) => <em className="italic">{children}</em>,
                                                code: ({ children }) => <code className="bg-neutral-100 border border-neutral-200 px-1 py-0.5 text-[10px] rounded-none">{children}</code>,
                                                h1: ({ children }) => <p className="font-bold text-sm mb-1">{children}</p>,
                                                h2: ({ children }) => <p className="font-bold mb-1">{children}</p>,
                                                h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                                                table: ({ children }) => <div className="overflow-x-auto mb-2"><table className="border border-black text-[10px] w-full">{children}</table></div>,
                                                th: ({ children }) => <th className="border border-black px-2 py-1 bg-black text-white text-left font-mono font-bold">{children}</th>,
                                                td: ({ children }) => <td className="border border-black px-2 py-1">{children}</td>,
                                                hr: () => <hr className="border-black/20 my-2" />,
                                            }}
                                        >
                                            {streamingText}
                                        </ReactMarkdown>
                                    </div>
                                ) : activeTools.length === 0 ? (
                                    <div className="border border-black px-4 py-3 bg-white font-mono text-xs text-neutral-400 flex items-center gap-2">
                                        <span className="inline-block w-1.5 h-1.5 bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="inline-block w-1.5 h-1.5 bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="inline-block w-1.5 h-1.5 bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && !isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-6 h-6 bg-black flex items-center justify-center shrink-0 mt-0.5">
                                <TrackrIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="border border-black bg-red-50 px-4 py-3 font-mono text-xs text-red-800 space-y-2">
                                <p>{error}</p>
                                <button
                                    onClick={() => {
                                        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                                        if (lastUserMsg) sendMessage(lastUserMsg.content);
                                    }}
                                    className="border border-black bg-white text-black px-3 py-1 font-mono text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-black bg-white">
                    <form onSubmit={handleSubmit} className="flex">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your tools..."
                            className="flex-1 px-5 py-4 font-mono text-sm bg-transparent focus:outline-none border-0"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="border-l border-black px-5 py-4 bg-white hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-mono text-xs"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
