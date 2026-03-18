"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    createSurveyFromTemplate,
    createSurvey,
    activateSurvey,
    closeSurvey,
    getSurveyResults,
} from "@/lib/actions/literacy";
import { DEFAULT_SURVEYS } from "@/lib/config/default-surveys";
import type { SurveyQuestion } from "@/lib/config/default-surveys";
import {
    ClipboardList,
    Plus,
    Play,
    Square,
    ExternalLink,
    BarChart3,
    TrendingUp,
    Users,
    X,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────

type SurveyItem = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: string;
    closedAt: string | null;
    responseCount: number;
    avgScore: number | null;
};

type TrendItem = {
    title: string;
    closedAt: string | null;
    averageScore: number;
    responseCount: number;
};

type LiteracyClientProps = {
    surveys: SurveyItem[];
    trend: TrendItem[];
    stats: {
        totalSurveys: number;
        avgTeamScore: number;
        responseRate: number;
    };
    workspaceId: string;
    userId: string;
    userName: string;
};

// ── Results Modal ────────────────────────────────────────────────

type SurveyResults = {
    survey: {
        id: string;
        title: string;
        description: string | null;
        questions: SurveyQuestion[];
    };
    questionAverages: Record<string, number>;
    questionDistributions: Record<string, Record<string, number>>;
    averageScore: number;
    responseCount: number;
};

function ResultsModal({
    results,
    onClose,
}: {
    results: SurveyResults;
    onClose: () => void;
}) {
    const questions = results.survey.questions;
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-black w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-black p-4">
                    <div>
                        <h3 className="font-serif text-xl">{results.survey.title}</h3>
                        <p className="font-mono text-xs text-neutral-500 mt-1">
                            {results.responseCount} response{results.responseCount !== 1 ? "s" : ""} -- Avg score: {results.averageScore}/100
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-neutral-100" aria-label="Close survey results">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 space-y-6">
                    {questions.map((q, i) => (
                        <div key={q.id} className="border border-neutral-200 p-4">
                            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                                Question {i + 1}
                            </p>
                            <p className="font-serif text-sm mb-3">{q.question}</p>

                            {q.type === "rating" && (
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-neutral-100 border border-neutral-200">
                                        <div
                                            className="h-full bg-black"
                                            style={{
                                                width: `${((results.questionAverages[q.id] ?? 0) / 10) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="font-mono text-sm font-bold min-w-[3ch] text-right">
                                        {results.questionAverages[q.id]?.toFixed(1) ?? "0"}
                                    </span>
                                    <span className="font-mono text-xs text-neutral-400">/10</span>
                                </div>
                            )}

                            {q.type === "multiple_choice" && results.questionDistributions[q.id] && (
                                <div className="space-y-2">
                                    {Object.entries(results.questionDistributions[q.id]).map(
                                        ([option, count]) => {
                                            const total = Object.values(
                                                results.questionDistributions[q.id]
                                            ).reduce((a, b) => a + b, 0);
                                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                            return (
                                                <div key={option} className="flex items-center gap-2">
                                                    <div className="flex-1 h-6 bg-neutral-100 border border-neutral-200 relative">
                                                        <div
                                                            className="h-full bg-black/10"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                        <span className="absolute inset-y-0 left-2 flex items-center font-mono text-xs">
                                                            {option}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono text-xs min-w-[4ch] text-right">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}

                            {q.type === "text" && (
                                <p className="font-mono text-xs text-neutral-400 italic">
                                    Free-text responses (view individual submissions)
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main Client ──────────────────────────────────────────────────

export function LiteracyClient({
    surveys,
    trend,
    stats,
    workspaceId,
    userId,
    userName,
}: LiteracyClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showCreate, setShowCreate] = useState(false);
    const [results, setResults] = useState<SurveyResults | null>(null);

    // Custom survey form state
    const [customTitle, setCustomTitle] = useState("");
    const [customDescription, setCustomDescription] = useState("");

    const activeSurveys = surveys.filter((s) => s.status === "active");
    const draftSurveys = surveys.filter((s) => s.status === "draft");
    const closedSurveys = surveys.filter((s) => s.status === "closed");

    function handleCreateFromTemplate(templateIndex: number) {
        startTransition(async () => {
            try {
                await createSurveyFromTemplate(workspaceId, templateIndex, userId);
                toast.success("Survey created as draft");
                setShowCreate(false);
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to create survey");
            }
        });
    }

    function handleCreateCustom() {
        if (!customTitle.trim()) {
            toast.error("Survey title is required");
            return;
        }
        startTransition(async () => {
            try {
                await createSurvey(workspaceId, {
                    title: customTitle.trim(),
                    description: customDescription.trim() || undefined,
                    questions: [
                        { id: "q1", question: "Rate your overall AI tool proficiency", type: "rating" },
                        { id: "q2", question: "What is your biggest challenge with AI tools?", type: "text" },
                    ],
                    createdBy: userId,
                });
                toast.success("Custom survey created as draft");
                setShowCreate(false);
                setCustomTitle("");
                setCustomDescription("");
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to create survey");
            }
        });
    }

    function handleActivate(surveyId: string) {
        startTransition(async () => {
            try {
                await activateSurvey(surveyId, workspaceId);
                toast.success("Survey activated -- share the link with your team");
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to activate survey");
            }
        });
    }

    function handleClose(surveyId: string) {
        startTransition(async () => {
            try {
                await closeSurvey(surveyId, workspaceId);
                toast.success("Survey closed");
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to close survey");
            }
        });
    }

    function handleViewResults(surveyId: string) {
        startTransition(async () => {
            try {
                const data = await getSurveyResults(surveyId, workspaceId);
                if (data) {
                    setResults({
                        survey: {
                            id: data.survey.id,
                            title: data.survey.title,
                            description: data.survey.description,
                            questions: data.survey.questions as SurveyQuestion[],
                        },
                        questionAverages: data.questionAverages,
                        questionDistributions: data.questionDistributions,
                        averageScore: data.averageScore,
                        responseCount: data.responseCount,
                    });
                }
            } catch (e) {
                toast.error("Failed to load results");
            }
        });
    }

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-neutral-100 text-neutral-500 border-neutral-300",
            active: "bg-neutral-100 text-black border-neutral-300",
            closed: "bg-black text-white border-black",
        };
        return (
            <span
                className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest border ${styles[status] ?? styles.draft}`}
            >
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-normal">Team AI Literacy</h1>
                    <p className="font-mono text-sm text-neutral-500 mt-1">
                        Measure and track your team&apos;s AI tool knowledge
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    disabled={isPending}
                    className="flex items-center gap-2 border border-black bg-black text-white px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Create Survey
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-black bg-white p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <ClipboardList className="w-4 h-4 text-neutral-500" />
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                            Total Surveys
                        </span>
                    </div>
                    <p className="text-3xl font-serif">{stats.totalSurveys}</p>
                </div>
                <div className="border border-black bg-white p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-neutral-500" />
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                            Avg Team Score
                        </span>
                    </div>
                    <p className="text-3xl font-serif">
                        {stats.avgTeamScore > 0 ? `${stats.avgTeamScore}/100` : "--"}
                    </p>
                </div>
                <div className="border border-black bg-white p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-neutral-500" />
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                            Response Rate
                        </span>
                    </div>
                    <p className="text-3xl font-serif">
                        {stats.responseRate > 0 ? `${stats.responseRate}%` : "--"}
                    </p>
                </div>
            </div>

            {/* Trend Chart */}
            {trend.length > 0 && (
                <div className="border border-black bg-white p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-neutral-500" />
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                            Literacy Trend
                        </span>
                    </div>
                    <div className="flex items-end gap-3 h-32">
                        {trend
                            .slice()
                            .reverse()
                            .map((t, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="font-mono text-xs">{t.averageScore}</span>
                                    <div className="w-full bg-neutral-100 border border-neutral-200 relative" style={{ height: "100%" }}>
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-black"
                                            style={{ height: `${t.averageScore}%` }}
                                        />
                                    </div>
                                    <span className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                                        {t.title.substring(0, 12)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Active Surveys */}
            {activeSurveys.length > 0 && (
                <div>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
                        Active Surveys
                    </h2>
                    <div className="space-y-3">
                        {activeSurveys.map((s) => (
                            <div
                                key={s.id}
                                className="border border-black bg-white p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    {statusBadge(s.status)}
                                    <div>
                                        <h3 className="font-serif text-lg">{s.title}</h3>
                                        <p className="font-mono text-xs text-neutral-400">
                                            {s.responseCount} response{s.responseCount !== 1 ? "s" : ""}
                                            {s.avgScore !== null && ` -- Avg: ${s.avgScore}/100`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/literacy/take/${s.id}`;
                                            navigator.clipboard.writeText(url);
                                            toast.success("Survey link copied");
                                        }}
                                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Copy Link
                                    </button>
                                    <button
                                        onClick={() => handleViewResults(s.id)}
                                        disabled={isPending}
                                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                    >
                                        <BarChart3 className="w-3 h-3" />
                                        Results
                                    </button>
                                    <button
                                        onClick={() => handleClose(s.id)}
                                        disabled={isPending}
                                        className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                    >
                                        <Square className="w-3 h-3" />
                                        Close
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Draft Surveys */}
            {draftSurveys.length > 0 && (
                <div>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
                        Draft Surveys
                    </h2>
                    <div className="space-y-3">
                        {draftSurveys.map((s) => (
                            <div
                                key={s.id}
                                className="border border-black bg-white p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    {statusBadge(s.status)}
                                    <div>
                                        <h3 className="font-serif text-lg">{s.title}</h3>
                                        {s.description && (
                                            <p className="font-mono text-xs text-neutral-400">
                                                {s.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleActivate(s.id)}
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 border border-black bg-black text-white px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                                >
                                    <Play className="w-3 h-3" />
                                    Activate
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Closed Surveys */}
            {closedSurveys.length > 0 && (
                <div>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
                        Past Surveys
                    </h2>
                    <div className="space-y-3">
                        {closedSurveys.map((s) => (
                            <div
                                key={s.id}
                                className="border border-black bg-white p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    {statusBadge(s.status)}
                                    <div>
                                        <h3 className="font-serif text-lg">{s.title}</h3>
                                        <p className="font-mono text-xs text-neutral-400">
                                            {s.responseCount} response{s.responseCount !== 1 ? "s" : ""}
                                            {s.avgScore !== null && ` -- Avg: ${s.avgScore}/100`}
                                            {s.closedAt &&
                                                ` -- Closed ${new Date(s.closedAt).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleViewResults(s.id)}
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 border border-black px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                >
                                    <BarChart3 className="w-3 h-3" />
                                    Results
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {surveys.length === 0 && (
                <div className="border border-black bg-white p-12 text-center">
                    <ClipboardList className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
                    <h3 className="font-serif text-xl mb-2">No surveys yet</h3>
                    <p className="font-mono text-sm text-neutral-500 mb-6">
                        Create your first AI literacy survey to measure your team&apos;s knowledge
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 border border-black bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Survey
                    </button>
                </div>
            )}

            {/* Create Survey Dialog */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-black w-full max-w-xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-black p-4">
                            <h3 className="font-serif text-xl">Create Survey</h3>
                            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-neutral-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-6">
                            {/* Templates */}
                            <div>
                                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
                                    Start from template
                                </h4>
                                <div className="space-y-3">
                                    {DEFAULT_SURVEYS.map((template, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleCreateFromTemplate(i)}
                                            disabled={isPending}
                                            className="w-full text-left border border-black p-4 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                                        >
                                            <h5 className="font-serif text-base">{template.title}</h5>
                                            <p className="font-mono text-xs text-neutral-500 mt-1">
                                                {template.description}
                                            </p>
                                            <p className="font-mono text-[10px] text-neutral-400 mt-2">
                                                {template.questions.length} questions
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 border-t border-neutral-200" />
                                <span className="font-mono text-xs text-neutral-400">or</span>
                                <div className="flex-1 border-t border-neutral-200" />
                            </div>

                            {/* Custom */}
                            <div>
                                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
                                    Create custom survey
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={customTitle}
                                            onChange={(e) => setCustomTitle(e.target.value)}
                                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                            placeholder="e.g., Q1 Tool Knowledge Check"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-1">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            value={customDescription}
                                            onChange={(e) => setCustomDescription(e.target.value)}
                                            className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none h-20"
                                            placeholder="Brief description of the survey purpose"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateCustom}
                                        disabled={isPending || !customTitle.trim()}
                                        className="w-full border border-black bg-black text-white px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                                    >
                                        Create Custom Survey
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Modal */}
            {results && <ResultsModal results={results} onClose={() => setResults(null)} />}
        </div>
    );
}
