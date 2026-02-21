"use client";

import { useChat } from "@ai-sdk/react";
import type { TextUIPart } from "ai";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AskTrackrPage() {
    const [input, setInput] = useState("");
    // AI SDK v6: useChat defaults to POST /api/chat — no api option needed.
    // Returns sendMessage (not append), status (not isLoading), parts (not content).
    const { messages, sendMessage, status } = useChat();

    const isLoading = status === "submitted" || status === "streaming";

    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput("");
        sendMessage({ text: trimmed });
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
                <div className="border-b border-black px-5 py-3 flex items-center gap-2 bg-white">
                    <div className="w-5 h-5 bg-black flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest">Trackr Assistant</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F3F3EF]">
                    {messages.length === 0 && (
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
                                    "What are the top-rated tools in my stack?",
                                    "Which tools have the worst reviews on Reddit?",
                                    "Compare pricing across my CRM tools",
                                    "What tools have security compliance certifications?",
                                    "Which tools are missing integrations with Slack?",
                                    "Summarize the pros and cons of my most recent research",
                                ].map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => {
                                            sendMessage({ text: prompt });
                                        }}
                                        className="border border-black bg-white px-3 py-1.5 font-mono text-[10px] hover:bg-black hover:text-white transition-colors text-left"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m) => {
                        const text = m.parts
                            .filter((p): p is TextUIPart => p.type === "text")
                            .map((p) => p.text)
                            .join("");
                        // Skip assistant messages that have no text yet (e.g. tool-only steps)
                        if (!text && m.role !== "user") return null;
                        return (
                            <div
                                key={m.id}
                                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {m.role !== "user" && (
                                    <div className="w-6 h-6 bg-black flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot className="w-3.5 h-3.5 text-white" />
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
                                        text
                                    ) : (
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
                                            {text}
                                        </ReactMarkdown>
                                    )}
                                </div>
                                {m.role === "user" && (
                                    <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 mt-0.5 bg-black">
                                        <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-6 h-6 bg-black flex items-center justify-center shrink-0 mt-0.5">
                                <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="border border-black px-4 py-3 bg-white font-mono text-xs text-neutral-400 flex items-center gap-2">
                                <span className="inline-block w-1.5 h-1.5 bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="inline-block w-1.5 h-1.5 bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="inline-block w-1.5 h-1.5 bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
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
