import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default: "CultureLens — Understanding Through Listening",
    template: "%s | CultureLens",
  },
  description:
    "A consent-based conversation mirror that analyzes communication patterns with cultural awareness, delivering neutral audio insights without judgment.",
  keywords: [
    "conversation analysis",
    "cultural awareness",
    "communication patterns",
    "AI mediator",
    "relationship insights",
    "conversation mirror",
    "cultural sensitivity",
    "communication tools",
  ],
  authors: [{ name: "CultureLens Team" }],
  creator: "CultureLens",
  publisher: "CultureLens",
  applicationName: "CultureLens",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CultureLens",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "CultureLens — Understanding Through Listening",
    description:
      "A consent-based conversation mirror that analyzes communication patterns with cultural awareness, delivering neutral audio insights without judgment.",
    siteName: "CultureLens",
  },
  twitter: {
    card: "summary_large_image",
    title: "CultureLens — Understanding Through Listening",
    description:
      "A consent-based conversation mirror that analyzes communication patterns with cultural awareness, delivering neutral audio insights without judgment.",
    creator: "@culturelens",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
