import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { apiKey, voice, text } = await req.json()

    if (!apiKey) {
      return Response.json({ error: "OpenAI API key is required." }, { status: 401 })
    }

    if (!voice || !text) {
      return Response.json({ error: "Voice and text are required." }, { status: 400 })
    }

    // Limit sample text length to prevent abuse
    const limitedText = text.substring(0, 100)

    // Call OpenAI TTS API
    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // Use standard model for samples to save credits
        input: limitedText,
        voice: voice,
        response_format: "mp3",
      }),
    })

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json().catch(() => ({}))
      throw new Error(
        `OpenAI TTS API Error: ${errorData.error?.message || ttsResponse.statusText} (Status: ${ttsResponse.status})`,
      )
    }

    const audioBlob = await ttsResponse.blob()
    const audioBuffer = await audioBlob.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`

    return Response.json({ audioDataUrl })
  } catch (error: any) {
    console.error("Error generating voice sample:", error)
    return Response.json(
      {
        error: error.message || "Failed to generate voice sample",
      },
      { status: 500 },
    )
  }
}
