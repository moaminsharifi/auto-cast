import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "AutoCast - AI Podcast Generator",
  description: "Transform your text into professional podcasts with AI-powered script generation and voice synthesis.",
  generator: "v0.dev",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://auto-cast.pages.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AutoCast - AI Podcast Generator",
    description:
      "Transform your text into professional podcasts with AI-powered script generation and voice synthesis.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://auto-cast.pages.dev",
    siteName: "AutoCast",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "AutoCast - AI Podcast Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoCast - AI Podcast Generator",
    description:
      "Transform your text into professional podcasts with AI-powered script generation and voice synthesis.",
    images: ["/twitter-image.png"],
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
