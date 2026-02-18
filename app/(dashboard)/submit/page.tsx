
import { AddToolWizard } from "@/components/tools/add-tool-wizard";

export const dynamic = "force-dynamic";

export default function SubmitPage() {
    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up py-10">
            <AddToolWizard />
        </div>
    );
}
