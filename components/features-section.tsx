"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { Mic, Wand2, Globe, Shield } from "lucide-react"

export default function FeaturesSection() {
  const t = useTranslations()

  return (
    <div className="w-full max-w-4xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-card/70 backdrop-blur-sm border-border text-foreground">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Wand2 className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("features.ai.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("features.ai.description")}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm border-border text-foreground">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Mic className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("features.voice.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("features.voice.description")}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm border-border text-foreground">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Globe className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("features.language.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("features.language.description")}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm border-border text-foreground">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Shield className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("features.privacy.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("features.privacy.description")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
