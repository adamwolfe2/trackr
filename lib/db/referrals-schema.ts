import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './schema';

export const referrals = pgTable('referrals', {
    id: uuid('id').defaultRandom().primaryKey(),
    referrerWorkspaceId: uuid('referrer_workspace_id').references(() => workspaces.id).notNull(),
    code: text('code').unique().notNull(),
    clicks: integer('clicks').default(0).notNull(),
    signups: integer('signups').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const referralsRelations = relations(referrals, ({ one }) => ({
    referrer: one(workspaces, {
        fields: [referrals.referrerWorkspaceId],
        references: [workspaces.id],
    }),
}));
