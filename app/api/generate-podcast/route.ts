import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Helper to get typed OpenAI model instance
const getOpenAIInstance = (apiKey: string, modelName: string) => {
  const customOpenAI = createOpenAI({ apiKey })
  return customOpenAI(modelName) // This now correctly uses the modelName string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      task,
      apiKey,
      textInput,
      scriptModel,
      language,
      selectedFrameworkPoints,
      frameworkDetails,
      additionalStructurePrompt,
      existingScript,
      refinementPrompt,
      script,
      ttsModel,
      ttsVoice,
      systemPrompt,
      temperature = 0.7,
      maxTokens = 2000,
    } = body

    if (!apiKey) {
      return Response.json({ error: "OpenAI API key is required." }, { status: 401 })
    }

    const openaiInstance = createOpenAI({ apiKey })

    if (task === "summarizeContent") {
      if (!textInput || !scriptModel || !language) {
        return Response.json({ error: "Missing fields for content summarization." }, { status: 400 })
      }

      const languageInstruction =
        language === "fa"
          ? "The summary MUST be written entirely in Persian (Farsi)."
          : "The summary MUST be written entirely in English."

      const prompt = `You are an expert content summarizer. Your task is to create a comprehensive yet concise summary of the following multiple documents/texts that will be used to generate a podcast script.

${languageInstruction}

Please:
1. Identify the main themes and key points across all documents
2. Combine related information from different sources
3. Maintain the most important details and insights
4. Create a coherent narrative that flows well
5. Preserve any important quotes, statistics, or specific examples
6. Ensure the summary is suitable for podcast script generation

Content to summarize:
---
${textInput}
---

Comprehensive Summary:`

      const { text: summary } = await generateText({
        model: openaiInstance(scriptModel),
        prompt: prompt,
        maxTokens: maxTokens,
        temperature: temperature,
      })
      if (!summary) throw new Error("AI returned an empty summary.")
      return Response.json({ summary })
    } else if (task === "generateScript") {
      if (!textInput || !scriptModel || !language) {
        return Response.json({ error: "Missing fields for script generation." }, { status: 400 })
      }

      let frameworkInstructions = ""
      if (selectedFrameworkPoints && selectedFrameworkPoints.length > 0) {
        frameworkInstructions = "Consider the following podcast structure guidelines:\n"

        selectedFrameworkPoints.forEach((pointId: string) => {
          const point = PODCAST_FRAMEWORK.find((p) => p.id === pointId)
          if (point) {
            frameworkInstructions += `- ${point.title}: ${point.description}\n`

            // Add user's specific details if provided
            if (frameworkDetails && frameworkDetails[pointId]) {
              frameworkInstructions += `  User's specific requirements: ${frameworkDetails[pointId]}\n`
            }
          }
        })
        frameworkInstructions += "\n"
      }

      if (additionalStructurePrompt) {
        frameworkInstructions += `Additional structuring notes: ${additionalStructurePrompt}\n`
      }

      const languageInstruction =
        language === "fa"
          ? "The podcast script MUST be written entirely in Persian (Farsi)."
          : "The podcast script MUST be written entirely in English."

      // Use custom system prompt if provided
      const baseSystemPrompt = systemPrompt || "You are an expert podcast scriptwriter."

      const prompt = `${baseSystemPrompt}

Transform the following text into an engaging, conversational podcast script in ${language === "fa" ? "Persian" : "English"}.
${languageInstruction}
${frameworkInstructions}
The script should include a captivating intro, a well-structured main body explaining key points, and a concise conclusion.
Make sure to incorporate the user's specific requirements for each selected framework point.
Ensure the output is ONLY the script itself, without any surrounding explanations or preambles.

Original Text:
---
${textInput}
---
Podcast Script:`

      const { text: generatedScript } = await generateText({
        model: openaiInstance(scriptModel),
        prompt: prompt,
        maxTokens: maxTokens,
        temperature: temperature,
      })
      if (!generatedScript) throw new Error("AI returned an empty script.")
      return Response.json({ script: generatedScript })
    } else if (task === "refineScript") {
      if (!existingScript || !refinementPrompt || !scriptModel || !language) {
        return Response.json({ error: "Missing fields for script refinement." }, { status: 400 })
      }
      const languageInstruction =
        language === "fa"
          ? "The refined podcast script MUST be written entirely in Persian (Farsi)."
          : "The refined podcast script MUST be written entirely in English."

      // Use custom system prompt if provided
      const baseSystemPrompt = systemPrompt || "You are an expert podcast script editor."

      const prompt = `${baseSystemPrompt}

Refine the following podcast script based on the user's feedback.
${languageInstruction}
Ensure the output is ONLY the refined script itself.

Original Script:
---
${existingScript}
---
User Feedback for Refinement:
---
${refinementPrompt}
---
Refined Podcast Script:`

      const { text: refinedScript } = await generateText({
        model: openaiInstance(scriptModel),
        prompt: prompt,
        maxTokens: maxTokens,
        temperature: temperature,
      })
      if (!refinedScript) throw new Error("AI returned an empty refined script.")
      return Response.json({ script: refinedScript })
    } else if (task === "generateAudio") {
      if (!script || !ttsModel || !ttsVoice) {
        return Response.json({ error: "Missing fields for audio generation." }, { status: 400 })
      }

      const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: ttsModel, input: script, voice: ttsVoice, response_format: "mp3" }),
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
    } else {
      return Response.json({ error: "Invalid task specified." }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error in /api/generate-podcast:", error)
    let errorMessage = "An unexpected error occurred."
    let statusCode = 500
    if (error.message) errorMessage = error.message
    if (
      error.message &&
      (error.message.toLowerCase().includes("incorrect api key") || error.message.includes("Status: 401"))
    ) {
      statusCode = 401
      errorMessage = "OpenAI API request failed: Authentication error. Check your API key."
    } else if (error.message && error.message.includes("Status: 429")) {
      statusCode = 429
      errorMessage = "OpenAI API request failed: Rate limit or quota exceeded."
    }
    return Response.json({ error: errorMessage }, { status: statusCode })
  }
}

// Updated PODCAST_FRAMEWORK without the removed items
const PODCAST_FRAMEWORK = [
  {
    id: "purpose_audience",
    title: "Define Your Purpose & Audience",
    description:
      "Decide on the podcast's core message, niche, or theme. Identify who your target listeners are and what value you're providing them.",
  },
  {
    id: "episode_structure",
    title: "Episode Structure & Format",
    description:
      "Determine the format: solo commentary, interviews, panel discussions, storytelling, or a mix. Develop a rough outline for each episode (e.g., introduction, main content, closing remarks).",
  },
  {
    id: "scriptwriting_storyboarding",
    title: "Scriptwriting & Storyboarding",
    description:
      "Create a detailed script or bullet-point outline to ensure a coherent flow. Plan transitions, key stories, questions for interviews, and calls to action.",
  },
  {
    id: "branding_identity",
    title: "Branding & Identity",
    description:
      "Design a podcast name, logo, and introductory music that resonate with your concept. Create an engaging intro and outro that set the tone for each episode.",
  },
  {
    id: "marketing_engagement",
    title: "Marketing & Audience Engagement",
    description:
      "Develop a launch strategy including social media campaigns, show notes, and a dedicated website or blog. Engage with your audience through social media, listener feedback, and Q&A sessions.",
  },
  {
    id: "schedule_improvement",
    title: "Consistent Schedule & Continuous Improvement",
    description:
      "Establish a regular release schedule to build listener trust. Gather feedback, track analytics, and refine your content and delivery over time.",
  },
]
