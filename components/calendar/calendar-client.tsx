"use client";

import { useState, useTransition } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Calendar as CalendarIcon,
    Check,
} from "lucide-react";
import {
    createCalendarEvent,
    deleteCalendarEvent,
    getMonthEvents,
} from "@/lib/actions/calendar";

type CalendarEvent = {
    id: string;
    title: string;
    description: string | null;
    eventDate: string;
    endDate: string | null;
    eventType: string;
    isCompleted: boolean;
    relatedToolId: string | null;
    relatedToolName: string | null;
    createdBy: string | null;
};

const EVENT_TYPE_STYLES: Record<string, { bg: string; border: string; label: string }> = {
    renewal: { bg: "bg-red-50", border: "border-red-400", label: "RENEWAL" },
    review: { bg: "bg-blue-50", border: "border-blue-400", label: "REVIEW" },
    deadline: { bg: "bg-yellow-50", border: "border-yellow-500", label: "DEADLINE" },
    procurement: { bg: "bg-purple-50", border: "border-purple-400", label: "PROCUREMENT" },
    custom: { bg: "bg-neutral-50", border: "border-neutral-400", label: "CUSTOM" },
};

const EVENT_DOT_COLORS: Record<string, string> = {
    renewal: "bg-red-500",
    review: "bg-blue-500",
    deadline: "bg-yellow-500",
    procurement: "bg-purple-500",
    custom: "bg-neutral-500",
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarClientProps {
    workspaceId: string;
    initialEvents: CalendarEvent[];
    initialYear: number;
    initialMonth: number;
    upcomingEvents: CalendarEvent[];
}

export function CalendarClient({
    workspaceId,
    initialEvents,
    initialYear,
    initialMonth,
    upcomingEvents: initialUpcoming,
}: CalendarClientProps) {
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Upcoming events (static from server)
    const [upcoming] = useState(initialUpcoming);

    // Calendar grid
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    function eventsForDay(day: number) {
        return events.filter((e) => {
            const d = new Date(e.eventDate);
            return d.getDate() === day && d.getMonth() + 1 === month && d.getFullYear() === year;
        });
    }

    function navigateMonth(direction: -1 | 1) {
        let newMonth = month + direction;
        let newYear = year;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        setMonth(newMonth);
        setYear(newYear);
        setSelectedDay(null);

        startTransition(async () => {
            const fetched = await getMonthEvents(workspaceId, newYear, newMonth);
            setEvents(fetched);
        });
    }

    // Selected day events
    const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

    return (
        <div className="space-y-6">
            {/* Month Header */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="border border-black p-1.5 hover:bg-black hover:text-white transition-colors"
                        disabled={isPending}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h2 className="font-mono text-xs uppercase tracking-widest">
                        {MONTH_NAMES[month - 1]} {year}
                    </h2>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="border border-black p-1.5 hover:bg-black hover:text-white transition-colors"
                        disabled={isPending}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-neutral-200">
                    {DAY_HEADERS.map((d) => (
                        <div key={d} className="py-1.5 sm:py-2 text-center font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-neutral-400">
                            <span className="sm:hidden">{d.charAt(0)}</span>
                            <span className="hidden sm:inline">{d}</span>
                        </div>
                    ))}
                </div>

                {/* Event type legend */}
                <div className="border-b border-neutral-200 px-3 py-2 flex items-center gap-4 flex-wrap">
                    {Object.entries(EVENT_TYPE_STYLES).map(([type, style]) => (
                        <div key={type} className="inline-flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${EVENT_DOT_COLORS[type] ?? "bg-neutral-400"}`} />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">{style.label}</span>
                        </div>
                    ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7">
                    {cells.map((day, i) => {
                        const dayEvents = day ? eventsForDay(day) : [];
                        const isToday = isCurrentMonth && day === today.getDate();
                        const isSelected = day === selectedDay;

                        return (
                            <button
                                key={i}
                                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                                disabled={!day}
                                className={`
                                    relative h-12 sm:h-20 border-b border-r border-neutral-100 p-1 sm:p-1.5 text-left
                                    ${!day ? "bg-neutral-50" : "hover:bg-neutral-50"}
                                    ${isSelected ? "bg-neutral-100 ring-1 ring-black ring-inset" : ""}
                                    transition-colors
                                `}
                            >
                                {day && (
                                    <>
                                        <span
                                            className={`
                                                font-mono text-xs
                                                ${isToday ? "bg-black text-white px-1.5 py-0.5" : "text-neutral-700"}
                                            `}
                                        >
                                            {day}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {dayEvents.slice(0, 3).map((evt) => (
                                                    <div
                                                        key={evt.id}
                                                        className={`w-1.5 h-1.5 rounded-full ${EVENT_DOT_COLORS[evt.eventType] ?? "bg-neutral-400"}`}
                                                    />
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <span className="font-mono text-[8px] text-neutral-400">
                                                        +{dayEvents.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Events */}
            {selectedDay !== null && (
                <div className="border border-black bg-white">
                    <div className="border-b border-black px-5 py-3 flex items-center justify-between">
                        <h3 className="font-mono text-xs uppercase tracking-widest">
                            {MONTH_NAMES[month - 1]} {selectedDay}, {year}
                        </h3>
                        <button
                            onClick={() => setSelectedDay(null)}
                            className="border border-black p-1 hover:bg-black hover:text-white transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                    {selectedEvents.length === 0 ? (
                        <div className="px-5 py-6 text-center">
                            <p className="font-mono text-sm text-neutral-400">No events on this day.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {selectedEvents.map((evt) => {
                                const style = EVENT_TYPE_STYLES[evt.eventType] ?? EVENT_TYPE_STYLES.custom;
                                return (
                                    <div key={evt.id} className="px-5 py-3 flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase tracking-wide ${style.border} ${style.bg}`}>
                                                    {style.label}
                                                </span>
                                                {evt.isCompleted && (
                                                    <Check className="h-3 w-3 text-neutral-400" />
                                                )}
                                            </div>
                                            <p className="font-mono text-sm font-medium">{evt.title}</p>
                                            {evt.description && (
                                                <p className="font-mono text-[11px] text-neutral-500 mt-0.5">{evt.description}</p>
                                            )}
                                            {evt.relatedToolName && (
                                                <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                                                    Tool: {evt.relatedToolName}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                startTransition(async () => {
                                                    await deleteCalendarEvent(evt.id, workspaceId);
                                                    const fetched = await getMonthEvents(workspaceId, year, month);
                                                    setEvents(fetched);
                                                });
                                            }}
                                            className="border border-neutral-300 p-1 hover:border-black hover:bg-black hover:text-white transition-colors shrink-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Add Event Button + Form */}
            <div className="border border-black bg-white">
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full border-b border-black px-5 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                    <span className="font-mono text-xs uppercase tracking-widest">Add Event</span>
                    <Plus className={`h-4 w-4 transition-transform ${showAddForm ? "rotate-45" : ""}`} />
                </button>

                {showAddForm && (
                    <AddEventForm
                        workspaceId={workspaceId}
                        year={year}
                        month={month}
                        selectedDay={selectedDay}
                        onCreated={() => {
                            setShowAddForm(false);
                            startTransition(async () => {
                                const fetched = await getMonthEvents(workspaceId, year, month);
                                setEvents(fetched);
                            });
                        }}
                    />
                )}
            </div>

            {/* Upcoming Events (next 30 days) */}
            <div className="border border-black bg-white">
                <div className="border-b border-black px-5 py-3 flex items-center gap-2">
                    <CalendarIcon className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
                    <h2 className="font-mono text-xs uppercase tracking-widest">Upcoming (30 Days)</h2>
                </div>
                {upcoming.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                        <p className="font-mono text-sm text-neutral-400">No upcoming events.</p>
                        <p className="font-mono text-[10px] text-neutral-400 mt-1">
                            Add events or generate renewal events from your stack.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {upcoming.map((evt) => {
                            const style = EVENT_TYPE_STYLES[evt.eventType] ?? EVENT_TYPE_STYLES.custom;
                            const d = new Date(evt.eventDate);
                            return (
                                <div key={evt.id} className="flex items-center gap-4 px-5 py-3">
                                    <div className="w-12 text-center shrink-0">
                                        <div className="font-mono text-lg font-bold leading-none">{d.getDate()}</div>
                                        <div className="font-mono text-[9px] text-neutral-400 uppercase">
                                            {d.toLocaleDateString("en-US", { month: "short" })}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-mono text-sm font-medium truncate">{evt.title}</p>
                                        {evt.relatedToolName && (
                                            <p className="font-mono text-[10px] text-neutral-400">{evt.relatedToolName}</p>
                                        )}
                                    </div>
                                    <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase tracking-wide shrink-0 ${style.border} ${style.bg}`}>
                                        {style.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Add Event Form ────────────────────────────────────────────────────────

function AddEventForm({
    workspaceId,
    year,
    month,
    selectedDay,
    onCreated,
}: {
    workspaceId: string;
    year: number;
    month: number;
    selectedDay: number | null;
    onCreated: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Default date to selected day or first of month
    const defaultDate = selectedDay
        ? `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
        : `${year}-${String(month).padStart(2, "0")}-01`;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const title = (formData.get("title") as string)?.trim();
        const eventDate = formData.get("eventDate") as string;
        const eventType = formData.get("eventType") as string;
        const description = (formData.get("description") as string)?.trim();

        if (!title) {
            setError("Title is required");
            return;
        }

        startTransition(async () => {
            try {
                await createCalendarEvent(workspaceId, {
                    title,
                    eventDate: new Date(eventDate).toISOString(),
                    eventType,
                    description: description || undefined,
                });
                form.reset();
                onCreated();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to create event");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
                <div className="border border-red-300 bg-red-50 px-3 py-2">
                    <p className="font-mono text-xs text-red-600">{error}</p>
                </div>
            )}

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                    Title
                </label>
                <input
                    name="title"
                    type="text"
                    required
                    maxLength={200}
                    className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Event title"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                        Date
                    </label>
                    <input
                        name="eventDate"
                        type="date"
                        required
                        defaultValue={defaultDate}
                        className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                </div>
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                        Type
                    </label>
                    <select
                        name="eventType"
                        defaultValue="custom"
                        className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    >
                        <option value="renewal">Renewal</option>
                        <option value="review">Review</option>
                        <option value="deadline">Deadline</option>
                        <option value="procurement">Procurement</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                    Description (Optional)
                </label>
                <textarea
                    name="description"
                    rows={2}
                    className="w-full border border-black px-3 py-2 font-mono text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                    placeholder="Additional details..."
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="border border-black bg-black text-white px-5 py-2 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
            >
                {isPending ? "Creating..." : "Create Event"}
            </button>
        </form>
    );
}
