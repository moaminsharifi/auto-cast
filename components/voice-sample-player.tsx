"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface VoiceSamplePlayerProps {
  voiceId: string
  sampleUrl?: string
}

export function VoiceSamplePlayer({ voiceId, sampleUrl }: VoiceSamplePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Default sample URLs for OpenAI voices
  const defaultSamples: Record<string, string> = {
    alloy: "https://cdn.openai.com/API/docs/audio/alloy.wav",
    echo: "https://cdn.openai.com/API/docs/audio/echo.wav",
    fable: "https://cdn.openai.com/API/docs/audio/fable.wav",
    onyx: "https://cdn.openai.com/API/docs/audio/onyx.wav",
    nova: "https://cdn.openai.com/API/docs/audio/nova.wav",
    shimmer: "https://cdn.openai.com/API/docs/audio/shimmer.wav",
  }

  const audioUrl = sampleUrl || defaultSamples[voiceId] || ""

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      setIsPlaying(false)
    }
  }, [audioUrl, voiceId])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div className="flex items-center space-x-2">
      <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={togglePlay}
        className="w-8 h-8 p-0 rounded-full"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={toggleMute}
        className="w-8 h-8 p-0 rounded-full"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
      </Button>
    </div>
  )
}
