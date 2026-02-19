"use client";

import { useChat } from "@ai-sdk/react";
import { Send, Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";

export default function AskTrackrPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
    });

    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
                        <div className="py-12 text-center">
                            <p className="font-serif text-lg text-neutral-600 mb-2">
                                Ask anything about your tools.
                            </p>
                            <p className="font-mono text-xs text-neutral-400">
                                Example: "What is the cheapest CRM in our stack?"
                            </p>
                            <p className="font-mono text-xs text-neutral-400 mt-1">
                                Example: "Which tools have the best integration support?"
                            </p>
                        </div>
                    )}

                    {messages.map((m) => (
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
                                {m.content}
                            </div>
                            {m.role === "user" && (
                                <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0 mt-0.5 bg-black">
                                    <User className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

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
                            onChange={handleInputChange}
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
