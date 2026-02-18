import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";

interface PlanGateProps {
    featureName: string;
    description: string;
}

export function PlanGate({ featureName, description }: PlanGateProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md text-center border-dashed border-2">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Upgrade to Pro</CardTitle>
                    <CardDescription>
                        {featureName} is available exclusively on the Pro plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{description}</p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link href="/settings/billing">
                        <Button className="w-full">
                            Upgrade Workspace
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
