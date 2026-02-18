"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="max-w-[500px] text-muted-foreground">
                    We apologize for the inconvenience. The error has been logged and our team has been notified.
                </p>
                <div className="mt-4 flex gap-2">
                    <Button onClick={() => window.location.href = '/'} variant="outline">
                        Go Home
                    </Button>
                    <Button onClick={() => reset()}>
                        Try again
                    </Button>
                </div>
            </div>
        </div>
    );
}
