"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Play, Square, Loader2 } from "lucide-react"

interface VoiceSamplePlayerProps {
  voice: string
  apiKey: string
}

export function VoiceSamplePlayer({ voice, apiKey }: VoiceSamplePlayerProps) {
  const t = useTranslations()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const playSample = async () => {
    if (isPlaying && audio) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      return
    }

    if (!apiKey) {
      alert("Please set your OpenAI API key in settings first")
      return
    }

    setIsLoading(true)

    try {
      const sampleText = `Hello! This is a sample of the ${voice} voice. It gives you an idea of how your podcast will sound.`

      const response = await fetch("/api/voice-sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          voice,
          text: sampleText,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate voice sample")
      }

      const data = await response.json()

      if (audio) {
        audio.pause()
      }

      const newAudio = new Audio(data.audioDataUrl)
      newAudio.onended = () => setIsPlaying(false)
      setAudio(newAudio)
      newAudio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("Error playing voice sample:", error)
      alert("Failed to play voice sample. Please check your API key.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 text-xs text-primary hover:text-primary/80"
      onClick={playSample}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : isPlaying ? (
        <Square className="w-3 h-3 mr-1" />
      ) : (
        <Play className="w-3 h-3 mr-1" />
      )}
      {isPlaying ? t("common.stopSample") : t("common.playSample")}
    </Button>
  )
}
