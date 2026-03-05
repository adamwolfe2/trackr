"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitResponse } from "@/lib/actions/literacy";
import type { SurveyQuestion } from "@/lib/config/default-surveys";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Send, CheckCircle2 } from "lucide-react";

type SurveyFormProps = {
    surveyId: string;
    questions: SurveyQuestion[];
    respondentId: string;
    respondentName: string;
};

export function SurveyForm({
    surveyId,
    questions,
    respondentId,
    respondentName,
}: SurveyFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [submitted, setSubmitted] = useState(false);

    const currentQuestion = questions[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === questions.length - 1;
    const hasAnswer = answers[currentQuestion?.id] !== undefined && answers[currentQuestion?.id] !== "";

    function setAnswer(value: string | number) {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    }

    function handleNext() {
        if (isLast) return;
        setCurrentIndex((i) => i + 1);
    }

    function handlePrev() {
        if (isFirst) return;
        setCurrentIndex((i) => i - 1);
    }

    function handleSubmit() {
        startTransition(async () => {
            try {
                await submitResponse(surveyId, {
                    respondentId,
                    respondentName,
                    answers,
                });
                setSubmitted(true);
                toast.success("Survey submitted");
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to submit survey");
            }
        });
    }

    if (submitted) {
        return (
            <div className="border border-black bg-white p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-black mx-auto mb-4" strokeWidth={1} />
                <h2 className="text-2xl font-serif mb-3">Thank you</h2>
                <p className="font-mono text-sm text-neutral-500 mb-8">
                    Your responses have been recorded.
                </p>
                <a
                    href="/literacy"
                    className="inline-block border border-black bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                    Back to Surveys
                </a>
            </div>
        );
    }

    return (
        <div className="border border-black bg-white">
            {/* Progress */}
            <div className="border-b border-black p-4 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                    Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex gap-1">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`w-6 h-1 ${
                                i <= currentIndex ? "bg-black" : "bg-neutral-200"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Question */}
            <div className="p-6 min-h-[300px] flex flex-col">
                <h3 className="font-serif text-xl mb-6">{currentQuestion.question}</h3>

                <div className="flex-1">
                    {/* Rating Question */}
                    {currentQuestion.type === "rating" && (
                        <div>
                            <p className="font-mono text-xs text-neutral-400 mb-4">
                                Select a rating from 1 (lowest) to 10 (highest)
                            </p>
                            <div className="grid grid-cols-10 gap-2">
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setAnswer(n)}
                                        className={`h-12 border font-mono text-sm transition-colors ${
                                            answers[currentQuestion.id] === n
                                                ? "border-black bg-black text-white"
                                                : "border-black bg-white text-black hover:bg-neutral-50"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="font-mono text-[10px] text-neutral-400">Low</span>
                                <span className="font-mono text-[10px] text-neutral-400">High</span>
                            </div>
                        </div>
                    )}

                    {/* Multiple Choice Question */}
                    {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                        <div className="space-y-3">
                            {currentQuestion.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setAnswer(option)}
                                    className={`w-full text-left border px-4 py-3 font-mono text-sm transition-colors ${
                                        answers[currentQuestion.id] === option
                                            ? "border-black bg-black text-white"
                                            : "border-black bg-white text-black hover:bg-neutral-50"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Text Question */}
                    {currentQuestion.type === "text" && (
                        <textarea
                            value={(answers[currentQuestion.id] as string) ?? ""}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full h-32 border border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                            placeholder="Type your answer here..."
                        />
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="border-t border-black p-4 flex items-center justify-between">
                <button
                    onClick={handlePrev}
                    disabled={isFirst}
                    className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-30 hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                </button>

                {isLast ? (
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !hasAnswer}
                        className="flex items-center gap-2 border border-black bg-black text-white px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        Submit
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={!hasAnswer}
                        className="flex items-center gap-2 border border-black bg-black text-white px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
