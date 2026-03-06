export type ParsedStackItem = {
    toolName: string;
    category?: string | null;
    vendorUrl?: string | null;
    estimatedSeats?: number | null;
    billingCycle?: string | null;
    notes?: string | null;
    monthlyCost?: number | null;
    renewalDate?: string | null;
    contractLengthMonths?: number | null;
};

/**
 * Parse a JSON string (potentially wrapped in markdown code fences) into
 * an array of stack items. Returns an object with either `items` on success
 * or `error` on failure.
 */
export function parseStackJson(
    raw: string
): { items: ParsedStackItem[]; error?: never } | { items?: never; error: string } {
    const cleaned = raw
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

    let parsed: unknown;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        return { error: "Invalid JSON. Make sure to copy just the raw JSON array from the AI response." };
    }

    if (!Array.isArray(parsed)) {
        return { error: "Expected a JSON array. Make sure the AI returned a list of tools." };
    }

    const items: ParsedStackItem[] = parsed
        .filter(
            (i: unknown) =>
                i && typeof i === "object" && typeof (i as Record<string, unknown>).toolName === "string"
        )
        .map((i: Record<string, unknown>) => {
            // Normalize renewalDate to ISO string
            let renewalDate: string | null = null;
            if (typeof i.renewalDate === "string" && i.renewalDate) {
                const d = new Date(i.renewalDate);
                if (!isNaN(d.getTime())) renewalDate = d.toISOString().slice(0, 10);
            }

            // Parse monthlyCost — convert annual/quarterly if billingCycle hints at it
            let monthlyCost: number | null = null;
            const rawCost = typeof i.monthlyCost === "number" ? i.monthlyCost
                : typeof i.monthlyCost === "string" ? parseFloat(i.monthlyCost) : null;
            if (rawCost !== null && !isNaN(rawCost) && rawCost >= 0) {
                monthlyCost = rawCost;
            }

            return {
                toolName: String(i.toolName),
                category: typeof i.category === "string" ? i.category : null,
                vendorUrl: typeof i.vendorUrl === "string" ? i.vendorUrl : null,
                estimatedSeats: typeof i.estimatedSeats === "number" ? i.estimatedSeats : null,
                billingCycle: typeof i.billingCycle === "string" ? i.billingCycle : "monthly",
                notes: typeof i.notes === "string" ? i.notes : null,
                monthlyCost,
                renewalDate,
                contractLengthMonths: typeof i.contractLengthMonths === "number" ? i.contractLengthMonths : null,
            };
        });

    if (items.length === 0) {
        return { error: "No valid tools found. Each item needs a 'toolName' field." };
    }

    return { items };
}
