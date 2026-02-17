import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 animate-fade-in-scale">
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                    <HelpCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        We searched our entire vector database, but we couldn't find the page you're looking for.
                    </p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/">
                        <MoveLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
