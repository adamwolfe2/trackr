"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ExportButton() {
    const handleExport = (format: string) => {
        toast.success(`Exporting report as ${format}... Check your downloads.`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("PDF")}>
                    Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("CSV")}>
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("JSON")}>
                    Export as JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
