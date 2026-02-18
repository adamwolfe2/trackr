import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Trackr - AI Tool Intelligence",
    template: "%s | Trackr"
  },
  description: "Collaborative AI tool intelligence platform. Discover, manage, and analyze your company's AI stack.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://trackr.so",
    title: "Trackr - AI Tool Intelligence",
    description: "Collaborative AI tool intelligence platform. Discover, manage, and analyze your company's AI stack.",
    siteName: "Trackr",
    images: [
      {
        url: "https://trackr.so/og-image.jpg", // Placeholder
        width: 1200,
        height: 630,
        alt: "Trackr Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trackr - AI Tool Intelligence",
    description: "Collaborative AI tool intelligence platform.",
    images: ["https://trackr.so/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { AnalyticsProvider } from "@/components/analytics-provider";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(inter.className, "font-sans antialiased min-h-screen bg-background")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnalyticsProvider>
              {children}
              <Toaster />
            </AnalyticsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
