"use client";

import { ProcessHero } from "./process-hero";
import { PipelineNode } from "./pipeline-node";
import { PipelineConnector } from "./pipeline-connector";
import { StepMapSite } from "./step-map-site";
import { StepScrapePages } from "./step-scrape-pages";
import { StepReviewSites } from "./step-review-sites";
import { StepTrustReputation } from "./step-trust-reputation";
import { StepRedditDeepDive } from "./step-reddit-deep-dive";
import { StepCompetitiveIntel } from "./step-competitive-intel";
import { StepAiSynthesis } from "./step-ai-synthesis";
import { ReportFinale } from "./report-finale";
import { ProcessCta } from "./process-cta";
import { STEP_DESCRIPTIONS, CONNECTOR_LABELS, DEMO_TOOL } from "./mock-data";
import { motion } from "framer-motion";

export function ProcessPage() {
    return (
        <div>
            <ProcessHero />

            {/* Flowchart start label */}
            <div className="flex flex-col items-center py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black font-mono text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    <img
                        src={`https://www.google.com/s2/favicons?domain=${DEMO_TOOL.domain}&sz=16`}
                        alt=""
                        className="w-4 h-4"
                    />
                    User submits{" "}
                    <span className="font-bold">{DEMO_TOOL.domain}</span>
                </motion.div>
            </div>

            {/* Pipeline: alternating nodes with connectors */}
            <div className="space-y-0">
                {STEP_DESCRIPTIONS.map((step, i) => (
                    <div key={step.stepNumber}>
                        {/* Connector before each node */}
                        <PipelineConnector label={CONNECTOR_LABELS[i]} />

                        <PipelineNode
                            stepNumber={step.stepNumber}
                            stepName={step.stepName}
                            serviceName={step.serviceName}
                            serviceDomain={step.serviceDomain}
                            description={step.description}
                            detail={step.detail}
                            fullWidth={step.stepNumber === 5 || step.stepNumber === 7}
                        >
                            {step.stepNumber === 1 && <StepMapSite />}
                            {step.stepNumber === 2 && <StepScrapePages />}
                            {step.stepNumber === 3 && <StepReviewSites />}
                            {step.stepNumber === 4 && <StepTrustReputation />}
                            {step.stepNumber === 5 && <StepRedditDeepDive />}
                            {step.stepNumber === 6 && <StepCompetitiveIntel />}
                            {step.stepNumber === 7 && <StepAiSynthesis />}
                        </PipelineNode>
                    </div>
                ))}

                {/* Final connector to report */}
                <PipelineConnector label={CONNECTOR_LABELS[CONNECTOR_LABELS.length - 1]} />
            </div>

            {/* Report Finale */}
            <ReportFinale />

            {/* CTA */}
            <ProcessCta />
        </div>
    );
}
