import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AutoCast - Convert Text to Professional Podcasts with AI",
  description:
    "Transform your written content into engaging podcast scripts and audio using advanced AI. Support for multiple languages, customizable voices, and professional-quality text-to-speech generation.",
  keywords: [
    "AutoCast",
    "AI podcast generator",
    "text to speech",
    "podcast script generator",
    "AI voice generator",
    "content to podcast",
    "automated podcast creation",
    "OpenAI TTS",
    "podcast automation",
    "voice synthesis",
    "audio content creation",
    "multilingual podcast",
    "Persian podcast generator",
    "English podcast generator",
    "AI content creation",
    "podcast production tool",
  ],
  authors: [{ name: "AutoCast" }],
  creator: "AutoCast",
  publisher: "AutoCast",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    title: "AutoCast - Convert Text to Professional Podcasts with AI",
    description:
      "Transform your written content into engaging podcast scripts and audio using advanced AI. Support for multiple languages and professional-quality voices.",
    siteName: "AutoCast",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AutoCast - Convert Text to Professional Podcasts with AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoCast - Convert Text to Professional Podcasts with AI",
    description: "Transform your written content into engaging podcast scripts and audio using advanced AI.",
    images: ["/og-image.jpg"],
    creator: "@yourhandle",
  },
  alternates: {
    canonical: "https://your-domain.com",
  },
  category: "Technology",
  classification: "AI Tools",
  other: {
    "google-site-verification": "your-google-verification-code",
  },
    generator: 'v0.dev'
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AutoCast",
  description: "Transform your written content into engaging podcast scripts and audio using advanced AI technology",
  url: "https://your-domain.com",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "AI-powered podcast script generation",
    "Text-to-speech conversion",
    "Multiple language support",
    "Customizable voice options",
    "Professional audio quality",
    "Rich text editing",
    "Framework-based structuring",
  ],
  creator: {
    "@type": "Organization",
    name: "AutoCast",
  },
  datePublished: "2024-01-01",
  dateModified: new Date().toISOString().split("T")[0],
  inLanguage: ["en", "fa"],
  isAccessibleForFree: true,
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  softwareVersion: "1.0.0",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" storageKey="podcast-generator-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
