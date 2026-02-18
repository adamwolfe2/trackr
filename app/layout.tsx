import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

import { Newsreader, Geist_Mono } from "next/font/google";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trackr — AI Tool Research for Ops Teams",
    template: "%s | Trackr",
  },
  description: "Submit any software tool. Get a scored research report in under 2 minutes. Your team's shared tool database, always up to date.",
  openGraph: {
    title: "Trackr — Stop Researching Tools Manually",
    description: "Research agents evaluate any software tool in under 2 minutes. Scored reports. Shared team database. Always up to date.",
    url: "https://trackr.so",
    siteName: "Trackr",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trackr — AI Tool Research for Ops Teams",
    description: "Stop researching tools manually. Let agents do it for you.",
  },
};

import { AnalyticsProvider } from "@/components/analytics-provider";
import { Toaster } from "@/components/ui/toaster";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(newsreader.variable, geistMono.variable, "font-serif antialiased min-h-screen bg-background text-foreground selection:bg-black selection:text-white")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            forcedTheme="light"
          >
            <CopilotKit runtimeUrl="/api/copilotkit">
              <CopilotSidebar
                instructions="You are Trackr AI, an intelligent assistant for managing AI tools. Help users discover tools, analyze their stack, and optimize costs."
                labels={{
                  title: "Trackr AI",
                  initial: "Hi! I'm Trackr AI. How can I help you manage your tool stack today?",
                }}
                defaultOpen={false}
                clickOutsideToClose={false}
              >
                <AnalyticsProvider>
                  {children}
                  <Toaster />
                </AnalyticsProvider>
              </CopilotSidebar>
            </CopilotKit>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
