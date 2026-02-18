import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Newsreader, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { Toaster } from "sonner";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

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
  metadataBase: new URL("https://trytrackr.com"),
  openGraph: {
    title: "Trackr — Stop Researching Tools Manually",
    description: "Research agents evaluate any software tool in under 2 minutes. Scored reports. Shared team database. Always up to date.",
    url: "https://trytrackr.com",
    siteName: "Trackr",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Trackr — AI Tool Research for Ops Teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trackr — AI Tool Research for Ops Teams",
    description: "Stop researching tools manually. Let agents do it for you.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_placeholder"} dynamic>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://clerk.com" crossOrigin="anonymous" />
        </head>
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
                instructions="You are Trackr AI, an intelligent assistant for managing AI tools. Help users discover tools, analyze their stack, and make procurement decisions."
                labels={{
                  title: "Trackr AI",
                  initial: "Hi! I'm Trackr AI. Ask me anything about your tool stack — pricing, scores, comparisons.",
                }}
                defaultOpen={false}
                clickOutsideToClose={false}
              >
                <AnalyticsProvider>
                  {children}
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      duration: 4000,
                      classNames: {
                        toast: "font-mono text-sm border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none",
                        success: "bg-white text-black border-black",
                        error: "bg-white text-red-600 border-red-600",
                        info: "bg-white text-black border-black",
                      },
                    }}
                  />
                </AnalyticsProvider>
              </CopilotSidebar>
            </CopilotKit>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
