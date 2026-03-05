export type SurveyQuestionType = "rating" | "multiple_choice" | "text";

export type SurveyQuestion = {
    id: string;
    question: string;
    type: SurveyQuestionType;
    options?: string[];
};

export type SurveyTemplate = {
    title: string;
    description: string;
    questions: SurveyQuestion[];
};

export const DEFAULT_SURVEYS: SurveyTemplate[] = [
    {
        title: "AI Tool Awareness",
        description: "How well does your team understand the AI tools in your stack?",
        questions: [
            { id: "q1", question: "Can you name 3 AI-native tools your team uses daily?", type: "rating" as const },
            { id: "q2", question: "Do you know the difference between AI-native and AI-enabled tools?", type: "rating" as const },
            { id: "q3", question: "How confident are you evaluating new AI tools?", type: "rating" as const },
            { id: "q4", question: "Which AI tools do you use most?", type: "text" as const },
        ],
    },
    {
        title: "Tool Proficiency",
        description: "How effectively is your team using current tools?",
        questions: [
            { id: "q1", question: "How often do you use advanced features of your primary tools?", type: "rating" as const },
            { id: "q2", question: "Have you completed any tool-specific training in the last quarter?", type: "multiple_choice" as const, options: ["Yes, formal training", "Yes, self-guided", "No"] },
            { id: "q3", question: "Rate your overall productivity with your current tool stack", type: "rating" as const },
            { id: "q4", question: "Which tool do you struggle with most?", type: "text" as const },
        ],
    },
    {
        title: "Security Awareness",
        description: "Does your team understand AI data sharing risks?",
        questions: [
            { id: "q1", question: "Do you know what data your AI tools send to external servers?", type: "rating" as const },
            { id: "q2", question: "Are you aware of your company's AI usage policy?", type: "multiple_choice" as const, options: ["Yes, fully aware", "Somewhat aware", "No policy exists", "Not sure"] },
            { id: "q3", question: "How confident are you in identifying AI-related security risks?", type: "rating" as const },
            { id: "q4", question: "What security concern do you have about AI tools?", type: "text" as const },
        ],
    },
];
