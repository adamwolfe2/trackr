import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { db } from '@/lib/db';
import { reports, tools } from '@/lib/db/schema';
import { isNotNull, eq, and } from 'drizzle-orm';
import { CURATED_TOOLS } from '@/data/tools.seed';
import { TEMPLATES } from '@/data/templates.seed';
import { COMPARISON_SLUGS } from '@/data/comparisons.seed';
import { ICP_ROLES } from '@/data/icp-pages.seed';
import { VS_COMPETITORS } from '@/data/vs-pages.seed';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://trytrackr.com';
    const posts = getAllPosts();

    const blogPosts = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Shared reports with public tokens
    let sharedReports: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = [];
    try {
        const publicReports = await db.query.reports.findMany({
            where: isNotNull(reports.shareToken),
            columns: { shareToken: true, createdAt: true },
        });
        sharedReports = publicReports.map((r) => ({
            url: `${baseUrl}/share/${r.shareToken}`,
            lastModified: new Date(r.createdAt),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));
    } catch {
        // Non-critical — sitemap still works without shared reports
    }

    // Public tool library pages
    let researchPages: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = [];
    try {
        const publicTools = await db
            .select({ publicSlug: tools.publicSlug, updatedAt: reports.createdAt })
            .from(tools)
            .innerJoin(reports, and(eq(reports.toolId, tools.id), eq(reports.isPublic, true)))
            .where(isNotNull(tools.publicSlug));
        researchPages = publicTools.map((t) => ({
            url: `${baseUrl}/research/${t.publicSlug}`,
            lastModified: new Date(t.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch {
        // Non-critical
    }

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/process`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/audit`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/chrome`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/slack`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/partners`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/security`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/sign-up`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/research`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/research/compare`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/changelog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        // Lead magnet pages
        {
            url: `${baseUrl}/scorecard`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/spend-report`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/playbook`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        // VS hub + competitor displacement pages
        {
            url: `${baseUrl}/vs`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly' as const,
            priority: 0.85,
        },
        ...VS_COMPETITORS.map((competitor) => ({
            url: `${baseUrl}/vs/${competitor}`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
        // ICP hub + landing pages (/for)
        {
            url: `${baseUrl}/for`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        ...ICP_ROLES.map((role) => ({
            url: `${baseUrl}/for/${role}`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly' as const,
            priority: 0.75,
        })),
        // Programmatic comparison pages (/research/compare/[slug])
        ...COMPARISON_SLUGS.map((slug) => ({
            url: `${baseUrl}/research/compare/${slug}`,
            lastModified: new Date('2026-02-25'),
            changeFrequency: 'monthly' as const,
            priority: 0.85,
        })),
        // Curated tool library pages
        ...CURATED_TOOLS.map((t) => ({
            url: `${baseUrl}/research/${t.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.85,
        })),
        // Template pages
        ...TEMPLATES.map((t) => ({
            url: `${baseUrl}/research/templates/${t.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
        ...blogPosts,
        ...sharedReports,
        ...researchPages,
    ];
}
