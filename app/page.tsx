"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Get the user's preferred language from the browser
    const browserLanguage = navigator.language.split("-")[0] // e.g., "en-US" -> "en"

    let targetLocale = "en" // Default to English

    if (browserLanguage === "ar") {
      targetLocale = "ar"
    } else if (browserLanguage === "fa") {
      targetLocale = "fa"
    }
    // Add more language detections here if needed

    // Redirect to the detected or default locale
    router.replace(`/${targetLocale}`)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20 text-foreground">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg">Detecting language and redirecting...</p>
      </div>
    </div>
  )
}
