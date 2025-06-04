import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales } from "@/i18n/request"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://autocast.vercel.app"),
  title: "AutoCast - AI Podcast Generator",
  description:
    "Transform your written content into professional podcast scripts and high-quality audio using advanced AI technology. Support for multiple languages with natural-sounding voices.",
  keywords: ["AI", "podcast", "text-to-speech", "script generation", "OpenAI", "automation", "content creation"],
  authors: [{ name: "AutoCast Team" }],
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
    url: "https://autocast.vercel.app",
    title: "AutoCast - AI Podcast Generator",
    description:
      "Transform your written content into professional podcast scripts and high-quality audio using advanced AI technology.",
    siteName: "AutoCast",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoCast - AI Podcast Generator",
    description:
      "Transform your written content into professional podcast scripts and high-quality audio using advanced AI technology.",
    creator: "@autocast",
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
