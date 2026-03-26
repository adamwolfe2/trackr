import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, vector, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Workspaces
export const workspaces = pgTable('workspaces', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    scorecardConfig: jsonb('scorecard_config'),
    companyContext: text('company_context'),
    onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
    apiKey: text('api_key').unique(), // For Chrome extension + external integrations
    slackChannelId: text('slack_channel_id'), // Channel to post notifications to (indexed for Slack command lookup)
    slackEnabled: boolean('slack_enabled').default(false).notNull(),
    slackBotToken: text('slack_bot_token'),     // Per-workspace OAuth bot token
    slackTeamId: text('slack_team_id'),         // Slack workspace ID
    slackTeamName: text('slack_team_name'),     // Slack workspace name for display
    inviteCode: text('invite_code').unique(),    // Persistent public invite link token
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('workspaces_slack_channel_id_idx').on(table.slackChannelId),
]);

export const workspaceMembers = pgTable('workspace_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    userId: text('user_id').notNull(), // Clerk User ID
    role: text('role').notNull().default('member'), // owner | admin | member
    invitedBy: uuid('invited_by'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    seenJobIds: text('seen_job_ids').array().default([]).notNull(),
}, (table) => [
    index('workspace_members_user_id_idx').on(table.userId),
    index('workspace_members_workspace_id_idx').on(table.workspaceId),
    uniqueIndex('workspace_members_workspace_user_unique').on(table.workspaceId, table.userId),
]);

// Tools
export const tools = pgTable('tools', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
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
    publicSlug: text('public_slug').unique(), // Set when a report is published to the public library
    researchInterval: text('research_interval').default('manual').notNull(), // manual | weekly | biweekly | monthly
    nextResearchAt: timestamp('next_research_at'), // When next auto-research should trigger
}, (table) => [
    index('tools_workspace_id_idx').on(table.workspaceId),
    index('tools_status_idx').on(table.status),
    index('tools_submitted_at_idx').on(table.submittedAt),
    index('tools_last_researched_at_idx').on(table.lastResearchedAt),
    index('tools_workspace_status_idx').on(table.workspaceId, table.status),
]);

// Reports
export const reports = pgTable('reports', {
    id: uuid('id').defaultRandom().primaryKey(),
    toolId: uuid('tool_id').references(() => tools.id, { onDelete: 'cascade' }).notNull(),
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
    workspaceFitData: jsonb('workspace_fit_data'), // Workspace-specific fit scoring (recipe-dependent)
    shareToken: text('share_token').unique(), // Public sharing URL token
    isPublic: boolean('is_public').default(false).notNull(), // Published to /research/[slug] library
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('reports_tool_id_idx').on(table.toolId),
    index('reports_created_at_idx').on(table.createdAt),
]);

// Notes
export const notes = pgTable('notes', {
    id: uuid('id').defaultRandom().primaryKey(),
    toolId: uuid('tool_id').references(() => tools.id, { onDelete: 'cascade' }).notNull(),
    workspaceMemberId: uuid('workspace_member_id').references(() => workspaceMembers.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    noteType: text('note_type').default('general').notNull(), // general | test_result | pricing_update | decision
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('notes_tool_id_idx').on(table.toolId),
    index('notes_workspace_member_id_idx').on(table.workspaceMemberId),
]);

// Pain Points
export const painPoints = pgTable('pain_points', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    category: text('category'),
    active: boolean('active').default(true).notNull(),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('pain_points_workspace_id_idx').on(table.workspaceId),
]);

// Research Jobs
export const researchJobs = pgTable('research_jobs', {
    id: uuid('id').defaultRandom().primaryKey(),
    toolId: uuid('tool_id').references(() => tools.id, { onDelete: 'cascade' }).notNull(),
    status: text('status').default('queued').notNull(), // queued | running | complete | failed
    n8nExecutionId: text('n8n_execution_id'),
    triggeredBy: text('triggered_by').notNull(), // Clerk User ID
    triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    errorMessage: text('error_message'),
}, (table) => [
    index('research_jobs_tool_id_idx').on(table.toolId),
    index('research_jobs_triggered_at_idx').on(table.triggeredAt),
    index('research_jobs_status_idx').on(table.status),
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
    toolId: uuid('tool_id').references(() => tools.id, { onDelete: 'cascade' }).notNull(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(), // The workspace promoting the tool
    status: text('status').default('draft').notNull(), // draft | active | paused | completed
    budget: integer('budget').default(0).notNull(), // Total budget in cents
    spent: integer('spent').default(0).notNull(), // Total spent in cents
    cpc: integer('cpc').default(0).notNull(), // Cost per click in cents
    impressions: integer('impressions').default(0).notNull(),
    clicks: integer('clicks').default(0).notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('ads_tool_id_idx').on(table.toolId),
    index('ads_workspace_id_idx').on(table.workspaceId),
    index('ads_status_idx').on(table.status),
    index('ads_workspace_status_idx').on(table.workspaceId, table.status),
]);

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

export const notesRelations = relations(notes, ({ one }) => ({
    tool: one(tools, {
        fields: [notes.toolId],
        references: [tools.id],
    }),
    member: one(workspaceMembers, {
        fields: [notes.workspaceMemberId],
        references: [workspaceMembers.id],
    }),
}));

export const painPointsRelations = relations(painPoints, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [painPoints.workspaceId],
        references: [workspaces.id],
    }),
}));

// Subscriptions
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    status: text('status').notNull(), // active | trialing | past_due | canceled | incomplete
    planId: text('plan_id').notNull(), // price_...
    currentPeriodEnd: timestamp('current_period_end'),
    creditBalance: integer('credit_balance').default(0).notNull(),
    autoTopUpEnabled: boolean('auto_top_up_enabled').default(false).notNull(),
    autoTopUpPack: integer('auto_top_up_pack').default(25).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('subscriptions_workspace_id_idx').on(table.workspaceId),
    index('subscriptions_status_idx').on(table.status),
]);

// Pending workspace invitations — used to onboard invited users to the right workspace on sign-up
export const pendingInvitations = pgTable('pending_invitations', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    email: text('email').notNull(),
    invitedByUserId: text('invited_by_user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
}, (table) => [
    index('pending_invitations_email_idx').on(table.email),
    index('pending_invitations_workspace_id_idx').on(table.workspaceId),
]);

export const pendingInvitationsRelations = relations(pendingInvitations, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [pendingInvitations.workspaceId],
        references: [workspaces.id],
    }),
}));

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
    renewalDate: timestamp('renewal_date'),
    contractLength: integer('contract_length_months'), // in months (12, 24, 36, etc.)
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('software_spend_workspace_id_idx').on(table.workspaceId),
    index('software_spend_renewal_date_idx').on(table.renewalDate),
    index('software_spend_status_idx').on(table.status),
    index('spend_workspace_status_idx').on(table.workspaceId, table.status),
]);

export const softwareSpendRelations = relations(softwareSpend, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [softwareSpend.workspaceId],
        references: [workspaces.id],
    }),
}));

// Feed Channels (user-configured news sources)
export const feedChannels = pgTable('feed_channels', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(), // 'topic' | 'rss'
    config: jsonb('config').notNull().default({}), // type-specific config
    enabled: boolean('enabled').default(true).notNull(),
    lastFetchedAt: timestamp('last_fetched_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('feed_channels_workspace_id_idx').on(table.workspaceId),
]);

// Feed Items (aggregated articles)
export const feedItems = pgTable('feed_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    channelId: uuid('channel_id').references(() => feedChannels.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    url: text('url').notNull(),
    source: text('source'),
    publishedAt: timestamp('published_at'),
    summary: text('summary'),
    relevanceScore: numeric('relevance_score', { precision: 3, scale: 2 }),
    categories: text('categories').array().default([]),
    isRead: boolean('is_read').default(false).notNull(),
    isSaved: boolean('is_saved').default(false).notNull(),
    extractedTools: jsonb('extracted_tools').default([]), // Array of { name, url, description, confidence }
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('feed_items_workspace_id_idx').on(table.workspaceId),
    index('feed_items_channel_id_idx').on(table.channelId),
    index('feed_items_relevance_idx').on(table.relevanceScore),
    index('feed_items_created_at_idx').on(table.createdAt),
    uniqueIndex('feed_items_ws_url_idx').on(table.workspaceId, table.url),
    index('feed_workspace_created_idx').on(table.workspaceId, table.createdAt),
]);

// Tool Suggestions (Phase 3 — proactive agent recommendations)
export const toolSuggestions = pgTable('tool_suggestions', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
    toolName: text('tool_name').notNull(),
    websiteUrl: text('website_url'),
    reason: text('reason').notNull(),
    sourceFeedItemId: uuid('source_feed_item_id').references(() => feedItems.id, { onDelete: 'set null' }),
    matchedPainPointId: uuid('matched_pain_point_id').references(() => painPoints.id, { onDelete: 'set null' }),
    confidence: numeric('confidence', { precision: 3, scale: 2 }).notNull(),
    status: text('status').default('new').notNull(), // 'new' | 'queued' | 'dismissed'
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('tool_suggestions_workspace_id_idx').on(table.workspaceId),
]);

export const feedChannelsRelations = relations(feedChannels, ({ one, many }) => ({
    workspace: one(workspaces, {
        fields: [feedChannels.workspaceId],
        references: [workspaces.id],
    }),
    items: many(feedItems),
}));

export const feedItemsRelations = relations(feedItems, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [feedItems.workspaceId],
        references: [workspaces.id],
    }),
    channel: one(feedChannels, {
        fields: [feedItems.channelId],
        references: [feedChannels.id],
    }),
}));

export const toolSuggestionsRelations = relations(toolSuggestions, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [toolSuggestions.workspaceId],
        references: [workspaces.id],
    }),
    sourceFeedItem: one(feedItems, {
        fields: [toolSuggestions.sourceFeedItemId],
        references: [feedItems.id],
    }),
    matchedPainPoint: one(painPoints, {
        fields: [toolSuggestions.matchedPainPointId],
        references: [painPoints.id],
    }),
}));

// API Usage Logs (cost tracking for external services)
export const apiLogs = pgTable('api_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    service: text('service').notNull(), // firecrawl | tavily | perplexity | openai | resend | slack
    endpoint: text('endpoint').notNull(), // e.g. "map", "scrape", "search", "chat.completions", "sonar-reasoning-pro"
    method: text('method').default('POST').notNull(),
    statusCode: integer('status_code'),
    durationMs: integer('duration_ms'),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    estimatedCost: numeric('estimated_cost', { precision: 10, scale: 6 }), // in USD
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'set null' }),
    toolId: uuid('tool_id').references(() => tools.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata'), // flexible extra data
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('api_logs_service_idx').on(table.service),
    index('api_logs_created_at_idx').on(table.createdAt),
    index('api_logs_workspace_id_idx').on(table.workspaceId),
    index('api_logs_workspace_created_idx').on(table.workspaceId, table.createdAt),
    index('api_logs_tool_id_idx').on(table.toolId),
]);

// Webhook event idempotency log — prevents duplicate processing
export const webhookEvents = pgTable('webhook_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    source: text('source').notNull(), // 'clerk' | 'stripe'
    eventId: text('event_id').notNull(), // svix-id or Stripe event.id
    eventType: text('event_type').notNull(),
    processedAt: timestamp('processed_at').defaultNow().notNull(),
    error: text('error'), // non-null if processing failed
}, (table) => [
    uniqueIndex('webhook_events_source_event_id_unique').on(table.source, table.eventId),
    index('webhook_events_processed_at_idx').on(table.processedAt),
]);

// Drip email state — tracks Resend email IDs so we can cancel on upgrade
export const dripEmails = pgTable('drip_emails', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    emailType: text('email_type').notNull(), // 'd1' | 'd3' | 'd7'
    resendEmailId: text('resend_email_id').notNull(),
    scheduledAt: timestamp('scheduled_at').notNull(),
    canceledAt: timestamp('canceled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('drip_emails_email_idx').on(table.email),
]);

// Community Votes — anonymous per-tool like/dislike counts for the curated library
export const communityVotes = pgTable('community_votes', {
    toolSlug: text('tool_slug').primaryKey(),
    upVotes: integer('up_votes').default(0).notNull(),
    downVotes: integer('down_votes').default(0).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Audit Submissions — prospects from /audit form
export const auditSubmissions = pgTable('audit_submissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    // Contact
    contactEmail: text('contact_email').notNull(),
    contactName: text('contact_name').notNull(),
    callOwnerEmail: text('call_owner_email'), // Trackr team member receiving the scorecard
    // Company info
    companyName: text('company_name').notNull(),
    companyWebsite: text('company_website'),
    industry: text('industry'),
    companySize: text('company_size'),
    role: text('role'),
    revenue: text('revenue'),
    // AI readiness
    aiToolCount: text('ai_tool_count'),
    dailyAdoptionPct: text('daily_adoption_pct'),
    hasAIManager: text('has_ai_manager'),
    monthlySpend: text('monthly_spend'),
    biggestBottleneck: text('biggest_bottleneck'),
    teamsNeedingAI: text('teams_needing_ai').array().default([]),
    failedAI: text('failed_ai'),
    successDefinition: text('success_definition'),
    // Current stack
    currentTools: text('current_tools').array().default([]),
    toolFrustrations: text('tool_frustrations'),
    manualProcesses: text('manual_processes'),
    // Scorecard output
    scorecard: jsonb('scorecard'),
    talkingPoints: jsonb('talking_points'), // AI-generated call prep array
    status: text('status').default('pending').notNull(), // pending | processing | complete | failed
    errorMessage: text('error_message'),
    shareToken: text('share_token').unique(), // Set when scorecard completes — enables public share URL
    // CRM fields
    salesRepNotes: text('sales_rep_notes'), // rep's call prep notes, editable
    assignedRep: text('assigned_rep'), // rep email/name who owns this lead
    preBuiltWorkspaceId: uuid('pre_built_workspace_id').references(() => workspaces.id, { onDelete: 'set null' }),
    inviteToken: text('invite_token').unique(), // used to track invite state
    arcCode: text('arc_code'), // architect attribution code
    employeeCount: text('employee_count'), // Used for per-seat cost projections
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
}, (table) => [
    index('audit_submissions_created_at_idx').on(table.createdAt),
    index('audit_submissions_contact_email_idx').on(table.contactEmail),
]);

export * from './referrals-schema';
export * from './architect-schema';
export * from './enterprise-schema';
