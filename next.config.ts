import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { SECURITY_HEADERS, HSTS_HEADER } from "./lib/config/security-headers";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async headers() {
    const headers = [
      ...SECURITY_HEADERS,
      ...(process.env.NODE_ENV === "production" ? [HSTS_HEADER] : []),
    ];
    return [{ source: "/(.*)", headers }];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'cdn.brandfetch.io' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  turbopack: {
    root: __dirname,
  },
};

export default withSentryConfig(withAnalyzer(nextConfig), {
  org: process.env.SENTRY_ORG?.trim(),
  project: process.env.SENTRY_PROJECT?.trim(),
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
