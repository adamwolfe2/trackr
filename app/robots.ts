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
                    '/scorecard',
                    '/pain-points',
                    '/dashboard',
                    '/stack',
                    '/feed',
                ],
            },
        ],
        sitemap: 'https://trytrackr.com/sitemap.xml',
    };
}
