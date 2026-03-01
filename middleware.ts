import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/blog(.*)",
    "/research(.*)",
    "/vs(.*)",
    "/for(.*)",
    "/pricing",
    "/about",
    "/process",
    "/audit",
    "/changelog",
    "/contact(.*)",
    "/terms",
    "/privacy",
    "/security",
    "/partners(.*)",
    "/playbook(.*)",
    "/deck(.*)",
    "/spend-report(.*)",
    "/scorecard(.*)",
    "/slack(.*)",
    "/share/(.*)",
    "/chrome(.*)",
    "/invite(.*)",
    "/api/webhooks/clerk",
    "/api/cron(.*)",
    "/api/slack/commands",
    "/api/chrome/(.*)",
    "/api/share/(.*)",
    "/sitemap.xml",
    "/robots.txt",
    "/apple-icon.png",
    "/favicon.ico",
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
