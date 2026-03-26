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
    const securityHeaders = [
      ...SECURITY_HEADERS,
      ...(process.env.NODE_ENV === "production" ? [HSTS_HEADER] : []),
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/:all*(svg|jpg|png|webp|avif|woff2|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'cdn.brandfetch.io' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ]
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@dnd-kit/core',
      '@dnd-kit/utilities',
    ],
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
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
});
