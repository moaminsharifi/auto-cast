"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, Loader2 } from "lucide-react"

interface VoiceSamplePlayerProps {
  voice: string
  apiKey: string
  endpointUrl: string
}

export function VoiceSamplePlayer({ voice, apiKey, endpointUrl }: VoiceSamplePlayerProps) {
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
      const normalizedUrl = endpointUrl.endsWith("/") ? endpointUrl.slice(0, -1) : endpointUrl

      const response = await fetch(`${normalizedUrl}/v1/audio/speech`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1", // Use standard model for samples to save credits
          input: sampleText.substring(0, 100), // Limit sample text length
          voice: voice,
          response_format: "mp3",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `OpenAI TTS API Error: ${errorData.error?.message || response.statusText} (Status: ${response.status})`,
        )
      }

      const audioBlob = await response.blob()
      const audioBuffer = await audioBlob.arrayBuffer()
      const audioBase64 = Buffer.from(audioBuffer).toString("base64")
      const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`

      if (audio) {
        audio.pause()
      }

      const newAudio = new Audio(audioDataUrl)
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
      {isPlaying ? "Stop" : "Play sample"}
    </Button>
  )
}
