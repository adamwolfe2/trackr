import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, vector, numeric, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Workspaces
export const workspaces = pgTable('workspaces', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    scorecardConfig: jsonb('scorecard_config'),
    companyContext: text('company_context'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workspaceMembers = pgTable('workspace_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(),
    userId: text('user_id').notNull(), // Clerk User ID
    role: text('role').notNull().default('member'), // owner | admin | member
    invitedBy: uuid('invited_by'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => [
    index('workspace_members_user_id_idx').on(table.userId),
    index('workspace_members_workspace_id_idx').on(table.workspaceId),
]);

// Tools
export const tools = pgTable('tools', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(),
    name: text('name').notNull(),
    websiteUrl: text('website_url'),
    pricingUrl: text('pricing_url'),
    demoUrl: text('demo_url'),
    category: text('category').array(),
    tags: text('tags').array(),
    status: text('status').default('submitted').notNull(), // submitted | queued | researching | active | testing | archived | failed
    overallScore: numeric('overall_score', { precision: 4, scale: 2 }),
    submittedBy: text('submitted_by'), // Clerk User ID or Member ID
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
    lastResearchedAt: timestamp('last_researched_at'),
    logoUrl: text('logo_url'),
    researchLogs: jsonb('research_logs'), // Array of { message: string, timestamp: string }
    embedding: vector('embedding', { dimensions: 1536 }), // pgvector
}, (table) => [
    index('tools_workspace_id_idx').on(table.workspaceId),
    index('tools_status_idx').on(table.status),
    index('tools_submitted_at_idx').on(table.submittedAt),
]);

// Reports
export const reports = pgTable('reports', {
    id: uuid('id').defaultRandom().primaryKey(),
    toolId: uuid('tool_id').references(() => tools.id).notNull(),
    version: integer('version').default(1).notNull(),
    scorecardSnapshot: jsonb('scorecard_snapshot'),
    summary: text('summary'),
    features: jsonb('features'),
    pricing: jsonb('pricing'),
    isPricingHidden: boolean('is_pricing_hidden').default(false).notNull(),
    pros: text('pros').array(),
    cons: text('cons').array(),
    integrations: text('integrations').array(),
    competitors: text('competitors').array(),
    rawScrapedData: jsonb('raw_scraped_data'),
    sentimentData: jsonb('sentiment_data'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('reports_tool_id_idx').on(table.toolId),
    index('reports_created_at_idx').on(table.createdAt),
]);

// Notes
export const notes = pgTable('notes', {
    id: uuid('id').defaultRandom().primaryKey(),
    toolId: uuid('tool_id').references(() => tools.id).notNull(),
    workspaceMemberId: uuid('workspace_member_id').references(() => workspaceMembers.id).notNull(),
    content: text('content').notNull(),
    noteType: text('note_type').default('general').notNull(), // general | test_result | pricing_update | decision
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pain Points
export const painPoints = pgTable('pain_points', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    category: text('category'),
    active: boolean('active').default(true).notNull(),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Research Jobs
export const researchJobs = pgTable('research_jobs', {
    id: uuid('id').defaultRandom().primaryKey(),
    toolId: uuid('tool_id').references(() => tools.id).notNull(),
    status: text('status').default('queued').notNull(), // queued | running | complete | failed
    n8nExecutionId: text('n8n_execution_id'),
    triggeredBy: text('triggered_by'), // Clerk User ID
    triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    errorMessage: text('error_message'),
}, (table) => [
    index('research_jobs_tool_id_idx').on(table.toolId),
    index('research_jobs_triggered_at_idx').on(table.triggeredAt),
]);

// Relations
export const workspacesRelations = relations(workspaces, ({ many }) => ({
    members: many(workspaceMembers),
    tools: many(tools),
    painPoints: many(painPoints),
    softwareSpend: many(softwareSpend),
}));

export const toolsRelations = relations(tools, ({ one, many }) => ({
    workspace: one(workspaces, {
        fields: [tools.workspaceId],
        references: [workspaces.id],
    }),
    reports: many(reports),
    notes: many(notes),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
    tool: one(tools, {
        fields: [reports.toolId],
        references: [tools.id],
    }),
}));

// Ads (Promoted Tools)
export const ads = pgTable('ads', {
    id: uuid('id').defaultRandom().primaryKey(),
    toolId: uuid('tool_id').references(() => tools.id).notNull(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(), // The workspace promoting the tool
    status: text('status').default('draft').notNull(), // draft | active | paused | completed
    budget: integer('budget').default(0).notNull(), // Total budget in cents
    spent: integer('spent').default(0).notNull(), // Total spent in cents
    cpc: integer('cpc').default(0).notNull(), // Cost per click in cents
    impressions: integer('impressions').default(0).notNull(),
    clicks: integer('clicks').default(0).notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const researchJobsRelations = relations(researchJobs, ({ one }) => ({
    tool: one(tools, {
        fields: [researchJobs.toolId],
        references: [tools.id],
    }),
}));

export const adsRelations = relations(ads, ({ one }) => ({
    tool: one(tools, {
        fields: [ads.toolId],
        references: [tools.id],
    }),
    workspace: one(workspaces, {
        fields: [ads.workspaceId],
        references: [workspaces.id],
    }),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [workspaceMembers.workspaceId],
        references: [workspaces.id],
    }),
}));

// Subscriptions
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    status: text('status').notNull(), // active | trialing | past_due | canceled | incomplete
    planId: text('plan_id').notNull(), // price_...
    currentPeriodEnd: timestamp('current_period_end'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('subscriptions_workspace_id_idx').on(table.workspaceId),
    index('subscriptions_status_idx').on(table.status),
]);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [subscriptions.workspaceId],
        references: [workspaces.id],
    }),
}));

// Software Stack (existing tools the company currently pays for)
export const softwareSpend = pgTable('software_spend', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    toolName: text('tool_name').notNull(),
    category: text('category'),
    vendorUrl: text('vendor_url'),
    monthlyCost: numeric('monthly_cost', { precision: 10, scale: 2 }).default('0'),
    seatCount: integer('seat_count'),
    billingCycle: text('billing_cycle').default('monthly'), // monthly | annual | one-time
    status: text('status').default('active').notNull(), // active | evaluating | canceling | canceled
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('software_spend_workspace_id_idx').on(table.workspaceId),
]);

export const softwareSpendRelations = relations(softwareSpend, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [softwareSpend.workspaceId],
        references: [workspaces.id],
    }),
}));

export * from './referrals-schema';
