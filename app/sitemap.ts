import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { isNotNull } from 'drizzle-orm';

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
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        ...blogPosts,
        ...sharedReports,
    ];
}
