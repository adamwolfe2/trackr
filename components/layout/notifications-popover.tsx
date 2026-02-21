"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, XCircle, CalendarClock, Sparkles, Gift, CreditCard, CheckCheck } from "lucide-react";
import { getNotifications, markNotificationsRead, type Notification, type NotificationType } from "@/lib/actions/notifications";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;
        await markNotificationsRead(unreadIds);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getNotifications();
            setNotifications(data);
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Mark visible unread notifications as read when popover opens
    useEffect(() => {
        if (!isOpen) return;
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        markNotificationsRead(unreadIds).then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        });
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="relative border border-black p-2 bg-white hover:bg-black hover:text-white transition-colors"
            >
                <Bell className="h-4 w-4" strokeWidth={1.5} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
                <span className="sr-only">Notifications</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 border border-black bg-white z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b border-black px-4 py-3 flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-widest">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 font-mono text-xs border border-black px-1.5 py-0.5 hover:bg-black hover:text-white transition-colors"
                                title="Mark all as read"
                            >
                                <CheckCheck className="h-3 w-3" strokeWidth={1.5} />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-neutral-100">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center font-mono text-xs text-neutral-400">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.link}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-start gap-3 p-4 hover:bg-neutral-100 transition-colors ${notification.read ? "opacity-60" : ""}`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {notification.type === "job_complete" ? (
                                            <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                                        ) : notification.type === "job_failed" ? (
                                            <XCircle className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                                        ) : notification.type === "renewal_soon" ? (
                                            <CalendarClock className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                                                        ) : notification.type === "new_suggestion" ? (
                                            <Sparkles className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                                        ) : notification.type === "referral_signup" ? (
                                            <Gift className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                                        ) : notification.type === "subscription_change" ? (
                                            <CreditCard className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                                        ) : (
                                            <Bell className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-mono text-xs font-semibold mb-0.5">{notification.title}</div>
                                        <div className="font-mono text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </div>
                                        <div className="font-mono text-[10px] text-neutral-400 mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
