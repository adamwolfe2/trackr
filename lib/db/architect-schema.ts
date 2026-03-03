import { pgTable, uuid, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces, auditSubmissions } from './schema';

// Architect Applications — submitted via /apply/[roleSlug]
export const architectApplications = pgTable('architect_applications', {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    linkedinUrl: text('linkedin_url'),
    roleSlug: text('role_slug').notNull(),
    experience: text('experience'),
    portfolioUrl: text('portfolio_url'),
    referralSource: text('referral_source'),
    status: text('status').default('pending').notNull(), // pending | approved | rejected
    reviewedAt: timestamp('reviewed_at'),
    reviewNotes: text('review_notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('architect_applications_email_idx').on(table.email),
    index('architect_applications_status_idx').on(table.status),
]);

// Architects — active profiles created when application is approved
export const architects = pgTable('architects', {
    id: uuid('id').defaultRandom().primaryKey(),
    applicationId: uuid('application_id').references(() => architectApplications.id).notNull(),
    userId: text('user_id'), // Clerk user ID, linked after sign up/in
    email: text('email').unique().notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    role: text('role').notNull(), // role slug
    arcCode: text('arc_code').unique().notNull(), // 8-char uppercase referral code
    stripeConnectAccountId: text('stripe_connect_account_id'),
    stripeOnboardingComplete: boolean('stripe_onboarding_complete').default(false).notNull(),
    calendarUrl: text('calendar_url'),
    status: text('status').default('active').notNull(), // active | paused | terminated
    totalEarnings: integer('total_earnings').default(0).notNull(), // cents
    totalClients: integer('total_clients').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('architects_user_id_idx').on(table.userId),
    index('architects_arc_code_idx').on(table.arcCode),
]);

// Architect Referrals — each client referred by an architect
export const architectReferrals = pgTable('architect_referrals', {
    id: uuid('id').defaultRandom().primaryKey(),
    architectId: uuid('architect_id').references(() => architects.id).notNull(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id),
    auditSubmissionId: uuid('audit_submission_id').references(() => auditSubmissions.id),
    status: text('status').default('lead').notNull(), // lead | active | churned
    attributedAt: timestamp('attributed_at').defaultNow().notNull(),
}, (table) => [
    index('architect_referrals_architect_id_idx').on(table.architectId),
]);

// Architect Commissions — one row per commission event
export const architectCommissions = pgTable('architect_commissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    architectId: uuid('architect_id').references(() => architects.id).notNull(),
    referralId: uuid('referral_id').references(() => architectReferrals.id).notNull(),
    stripeInvoiceId: text('stripe_invoice_id').notNull(),
    invoiceAmount: integer('invoice_amount').notNull(), // cents
    commissionRate: integer('commission_rate').default(20).notNull(), // percentage
    commissionAmount: integer('commission_amount').notNull(), // cents
    status: text('status').default('pending').notNull(), // pending | paid | failed
    stripeTransferId: text('stripe_transfer_id'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('architect_commissions_architect_id_idx').on(table.architectId),
]);

// Architect Payouts — monthly payout batches
export const architectPayouts = pgTable('architect_payouts', {
    id: uuid('id').defaultRandom().primaryKey(),
    architectId: uuid('architect_id').references(() => architects.id).notNull(),
    amount: integer('amount').notNull(), // cents
    stripePayoutId: text('stripe_payout_id'),
    status: text('status').default('pending').notNull(), // pending | processing | paid | failed
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('architect_payouts_architect_id_idx').on(table.architectId),
]);

// Relations
export const architectApplicationsRelations = relations(architectApplications, ({ one }) => ({
    architect: one(architects, {
        fields: [architectApplications.id],
        references: [architects.applicationId],
    }),
}));

export const architectsRelations = relations(architects, ({ one, many }) => ({
    application: one(architectApplications, {
        fields: [architects.applicationId],
        references: [architectApplications.id],
    }),
    referrals: many(architectReferrals),
    commissions: many(architectCommissions),
    payouts: many(architectPayouts),
}));

export const architectReferralsRelations = relations(architectReferrals, ({ one, many }) => ({
    architect: one(architects, {
        fields: [architectReferrals.architectId],
        references: [architects.id],
    }),
    workspace: one(workspaces, {
        fields: [architectReferrals.workspaceId],
        references: [workspaces.id],
    }),
    auditSubmission: one(auditSubmissions, {
        fields: [architectReferrals.auditSubmissionId],
        references: [auditSubmissions.id],
    }),
    commissions: many(architectCommissions),
}));

export const architectCommissionsRelations = relations(architectCommissions, ({ one }) => ({
    architect: one(architects, {
        fields: [architectCommissions.architectId],
        references: [architects.id],
    }),
    referral: one(architectReferrals, {
        fields: [architectCommissions.referralId],
        references: [architectReferrals.id],
    }),
}));

export const architectPayoutsRelations = relations(architectPayouts, ({ one }) => ({
    architect: one(architects, {
        fields: [architectPayouts.architectId],
        references: [architects.id],
    }),
}));
