import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/'],
                disallow: [
                    '/api/',
                    '/sign-in',
                    '/sign-up',
                    '/onboarding',
                    '/tools/',
                    '/queue',
                    '/discover',
                    '/workspace',
                    '/settings/',
                    '/referrals',
                    '/advertise',
                    '/submit',
                    '/ask',
                    '/compare',
                    '/pain-points',
                    '/dashboard',
                    '/stack',
                    '/feed',
                    '/analytics',
                    '/admin',
                ],
            },
        ],
        sitemap: 'https://trytrackr.com/sitemap.xml',
    };
}
