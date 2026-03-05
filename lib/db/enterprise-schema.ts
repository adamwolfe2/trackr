import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces, workspaceMembers, tools, softwareSpend } from './schema';

// ─── Stack Health Scores ───────────────────────────────────────────────────────
// Workspace-level health score snapshots (Feature 2)
export const stackHealthScores = pgTable('stack_health_scores', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    score: integer('score').notNull(), // 0-100
    breakdown: jsonb('breakdown').notNull(), // { toolQuality, spendEfficiency, coverageGaps, riskExposure, renewalHealth, teamUtilization }
    recommendations: jsonb('recommendations'), // AI-generated array of suggestions
    computedAt: timestamp('computed_at').defaultNow().notNull(),
}, (table) => [
    index('stack_health_scores_workspace_id_idx').on(table.workspaceId),
    index('stack_health_scores_computed_at_idx').on(table.computedAt),
]);

// ─── Board Reports ─────────────────────────────────────────────────────────────
// Generated board-ready executive reports (Feature 3)
export const boardReports = pgTable('board_reports', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    period: text('period').notNull(), // monthly | quarterly | annual | custom
    periodStart: timestamp('period_start'),
    periodEnd: timestamp('period_end'),
    data: jsonb('data').notNull(), // Full snapshot: health, spend, decisions, risks, recommendations
    shareToken: text('share_token').unique(),
    createdBy: text('created_by').notNull(), // Clerk user ID
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('board_reports_workspace_id_idx').on(table.workspaceId),
    index('board_reports_created_at_idx').on(table.createdAt),
]);

// ─── Competitor Intel ──────────────────────────────────────────────────────────
// Tracked competitor stacks + intelligence items (Feature 4)
export const competitorIntel = pgTable('competitor_intel', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    competitorName: text('competitor_name').notNull(),
    competitorDomain: text('competitor_domain').notNull(),
    discoveredTools: jsonb('discovered_tools').default([]), // [{ name, url, category, confidence, source }]
    lastScannedAt: timestamp('last_scanned_at'),
    status: text('status').default('tracking').notNull(), // tracking | paused
    createdBy: text('created_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('competitor_intel_workspace_id_idx').on(table.workspaceId),
    uniqueIndex('competitor_intel_ws_domain_idx').on(table.workspaceId, table.competitorDomain),
]);

// ─── Contracts ─────────────────────────────────────────────────────────────────
// Uploaded contract documents with AI-extracted terms (Feature 5)
export const contracts = pgTable('contracts', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    softwareSpendId: uuid('software_spend_id').references(() => softwareSpend.id, { onDelete: 'set null' }),
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(), // Vercel Blob URL
    fileSize: integer('file_size'),
    mimeType: text('mime_type'),
    extractedTerms: jsonb('extracted_terms'), // { renewalDate, autoRenew, noticePeriodDays, priceEscalation, termMonths, cancellationTerms, paymentTerms }
    status: text('status').default('processing').notNull(), // processing | active | expired
    uploadedBy: text('uploaded_by').notNull(), // Clerk user ID
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('contracts_workspace_id_idx').on(table.workspaceId),
    index('contracts_software_spend_id_idx').on(table.softwareSpendId),
]);

// ─── Calendar Events ───────────────────────────────────────────────────────────
// Internal calendar for renewals, reviews, deadlines (Features 5, 8)
export const calendarEvents = pgTable('calendar_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    eventDate: timestamp('event_date').notNull(),
    endDate: timestamp('end_date'), // For multi-day events
    eventType: text('event_type').notNull(), // renewal | review | deadline | procurement | custom
    relatedToolId: uuid('related_tool_id').references(() => tools.id, { onDelete: 'set null' }),
    relatedContractId: uuid('related_contract_id').references(() => contracts.id, { onDelete: 'set null' }),
    relatedSpendId: uuid('related_spend_id').references(() => softwareSpend.id, { onDelete: 'set null' }),
    reminderDays: integer('reminder_days').array().default([7, 30]), // Days before event to send reminders
    isCompleted: boolean('is_completed').default(false).notNull(),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('calendar_events_workspace_id_idx').on(table.workspaceId),
    index('calendar_events_event_date_idx').on(table.eventDate),
    index('calendar_events_event_type_idx').on(table.eventType),
]);

// ─── Procurement Requests ──────────────────────────────────────────────────────
// Tool request → research → approve/reject workflow (Feature 6)
export const procurementRequests = pgTable('procurement_requests', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    requestedBy: text('requested_by').notNull(), // Clerk user ID
    requestedByName: text('requested_by_name'),
    toolName: text('tool_name').notNull(),
    toolUrl: text('tool_url'),
    justification: text('justification').notNull(),
    urgency: text('urgency').default('medium').notNull(), // low | medium | high | critical
    category: text('category'),
    estimatedBudget: numeric('estimated_budget', { precision: 10, scale: 2 }),
    status: text('status').default('pending').notNull(), // pending | researching | reviewed | approved | rejected | purchased
    reviewedBy: text('reviewed_by'), // Clerk user ID
    reviewedByName: text('reviewed_by_name'),
    reviewNotes: text('review_notes'),
    approvedBudget: numeric('approved_budget', { precision: 10, scale: 2 }),
    toolId: uuid('tool_id').references(() => tools.id, { onDelete: 'set null' }), // Linked after research
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('procurement_requests_workspace_id_idx').on(table.workspaceId),
    index('procurement_requests_status_idx').on(table.status),
]);

// ─── Integrations ──────────────────────────────────────────────────────────────
// Connected third-party accounts (Features 7, 12)
export const integrations = pgTable('integrations', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    provider: text('provider').notNull(), // ramp | brex | billcom | notion | confluence
    status: text('status').default('connected').notNull(), // connected | disconnected | error
    accessToken: text('access_token'), // Encrypted
    refreshToken: text('refresh_token'), // Encrypted
    externalAccountId: text('external_account_id'), // ID on the provider side
    metadata: jsonb('metadata'), // Provider-specific config (e.g., Notion page ID, Confluence space key)
    lastSyncAt: timestamp('last_sync_at'),
    errorMessage: text('error_message'),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('integrations_workspace_id_idx').on(table.workspaceId),
    uniqueIndex('integrations_ws_provider_idx').on(table.workspaceId, table.provider),
]);

// ─── Risk Assessments ──────────────────────────────────────────────────────────
// Per-tool security/compliance risk scoring (Feature 11)
export const riskAssessments = pgTable('risk_assessments', {
    id: uuid('id').defaultRandom().primaryKey(),
    toolId: uuid('tool_id').references(() => tools.id, { onDelete: 'cascade' }).notNull(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    overallRisk: integer('overall_risk').notNull(), // 0-100 (higher = riskier)
    breakdown: jsonb('breakdown').notNull(), // { securityPosture, complianceCerts, dataBreaches, vendorStability, privacyPolicy }
    alertLevel: text('alert_level').default('low').notNull(), // low | medium | high | critical
    findings: jsonb('findings'), // Array of { category, finding, severity, source }
    assessedAt: timestamp('assessed_at').defaultNow().notNull(),
}, (table) => [
    index('risk_assessments_tool_id_idx').on(table.toolId),
    index('risk_assessments_workspace_id_idx').on(table.workspaceId),
    index('risk_assessments_alert_level_idx').on(table.alertLevel),
]);

// ─── Decision Log ──────────────────────────────────────────────────────────────
// Audit trail for all tool decisions (Feature 10)
export const decisionLog = pgTable('decision_log', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    toolId: uuid('tool_id').references(() => tools.id, { onDelete: 'set null' }),
    action: text('action').notNull(), // tool_added | tool_archived | tool_researched | score_changed | spend_added | spend_updated | contract_uploaded | procurement_approved | procurement_rejected | risk_alert | custom
    actorId: text('actor_id').notNull(), // Clerk user ID or 'system'
    actorName: text('actor_name'),
    details: jsonb('details'), // Action-specific metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('decision_log_workspace_id_idx').on(table.workspaceId),
    index('decision_log_tool_id_idx').on(table.toolId),
    index('decision_log_created_at_idx').on(table.createdAt),
    index('decision_log_action_idx').on(table.action),
]);

// ─── Literacy Surveys ──────────────────────────────────────────────────────────
// Team AI knowledge pulse surveys (Feature 13)
export const literacySurveys = pgTable('literacy_surveys', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    questions: jsonb('questions').notNull(), // [{ id, question, type: 'multiple_choice' | 'rating' | 'text', options?: string[] }]
    status: text('status').default('draft').notNull(), // draft | active | closed
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    closedAt: timestamp('closed_at'),
}, (table) => [
    index('literacy_surveys_workspace_id_idx').on(table.workspaceId),
]);

// ─── Literacy Responses ────────────────────────────────────────────────────────
// Individual survey answers (Feature 13)
export const literacyResponses = pgTable('literacy_responses', {
    id: uuid('id').defaultRandom().primaryKey(),
    surveyId: uuid('survey_id').references(() => literacySurveys.id, { onDelete: 'cascade' }).notNull(),
    respondentId: text('respondent_id').notNull(), // Clerk user ID
    respondentName: text('respondent_name'),
    answers: jsonb('answers').notNull(), // { [questionId]: answer }
    score: integer('score'), // Computed overall score 0-100
    completedAt: timestamp('completed_at').defaultNow().notNull(),
}, (table) => [
    index('literacy_responses_survey_id_idx').on(table.surveyId),
    uniqueIndex('literacy_responses_survey_respondent_idx').on(table.surveyId, table.respondentId),
]);

// ─── Public Profiles ───────────────────────────────────────────────────────────
// Public workspace stack profile pages + embeddable widgets (Feature 15)
export const publicProfiles = pgTable('public_profiles', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    slug: text('slug').unique().notNull(),
    headline: text('headline'),
    description: text('description'),
    showScores: boolean('show_scores').default(true).notNull(),
    showSpend: boolean('show_spend').default(false).notNull(),
    showHealth: boolean('show_health').default(true).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('public_profiles_workspace_id_idx').on(table.workspaceId),
]);

// ─── Relations ─────────────────────────────────────────────────────────────────

export const stackHealthScoresRelations = relations(stackHealthScores, ({ one }) => ({
    workspace: one(workspaces, { fields: [stackHealthScores.workspaceId], references: [workspaces.id] }),
}));

export const boardReportsRelations = relations(boardReports, ({ one }) => ({
    workspace: one(workspaces, { fields: [boardReports.workspaceId], references: [workspaces.id] }),
}));

export const competitorIntelRelations = relations(competitorIntel, ({ one }) => ({
    workspace: one(workspaces, { fields: [competitorIntel.workspaceId], references: [workspaces.id] }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
    workspace: one(workspaces, { fields: [contracts.workspaceId], references: [workspaces.id] }),
    spend: one(softwareSpend, { fields: [contracts.softwareSpendId], references: [softwareSpend.id] }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
    workspace: one(workspaces, { fields: [calendarEvents.workspaceId], references: [workspaces.id] }),
    tool: one(tools, { fields: [calendarEvents.relatedToolId], references: [tools.id] }),
    contract: one(contracts, { fields: [calendarEvents.relatedContractId], references: [contracts.id] }),
    spend: one(softwareSpend, { fields: [calendarEvents.relatedSpendId], references: [softwareSpend.id] }),
}));

export const procurementRequestsRelations = relations(procurementRequests, ({ one }) => ({
    workspace: one(workspaces, { fields: [procurementRequests.workspaceId], references: [workspaces.id] }),
    tool: one(tools, { fields: [procurementRequests.toolId], references: [tools.id] }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
    workspace: one(workspaces, { fields: [integrations.workspaceId], references: [workspaces.id] }),
}));

export const riskAssessmentsRelations = relations(riskAssessments, ({ one }) => ({
    tool: one(tools, { fields: [riskAssessments.toolId], references: [tools.id] }),
    workspace: one(workspaces, { fields: [riskAssessments.workspaceId], references: [workspaces.id] }),
}));

export const decisionLogRelations = relations(decisionLog, ({ one }) => ({
    workspace: one(workspaces, { fields: [decisionLog.workspaceId], references: [workspaces.id] }),
    tool: one(tools, { fields: [decisionLog.toolId], references: [tools.id] }),
}));

export const literacySurveysRelations = relations(literacySurveys, ({ one, many }) => ({
    workspace: one(workspaces, { fields: [literacySurveys.workspaceId], references: [workspaces.id] }),
    responses: many(literacyResponses),
}));

export const literacyResponsesRelations = relations(literacyResponses, ({ one }) => ({
    survey: one(literacySurveys, { fields: [literacyResponses.surveyId], references: [literacySurveys.id] }),
}));

export const publicProfilesRelations = relations(publicProfiles, ({ one }) => ({
    workspace: one(workspaces, { fields: [publicProfiles.workspaceId], references: [workspaces.id] }),
}));
