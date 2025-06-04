"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { RichTextEditor } from "@/components/rich-text-editor"
import {
  Loader2,
  AlertCircle,
  Wand2,
  Volume2,
  Download,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Settings,
  X,
  Files,
  FileText,
  Zap,
  Globe,
  Shield,
  Clock,
} from "lucide-react"
import { VoiceSamplePlayer } from "@/components/voice-sample-player"
import { SettingsModal } from "@/components/settings-modal"

const TTS_VOICES = [
  { id: "alloy", name: "Alloy", description: "Neutral, balanced voice with clear articulation" },
  { id: "echo", name: "Echo", description: "Male voice with deep, resonant tone and clear delivery" },
  { id: "fable", name: "Fable", description: "Female voice with soft, warm, and engaging qualities" },
  { id: "onyx", name: "Onyx", description: "Male voice with authoritative, deep, and professional tone" },
  { id: "nova", name: "Nova", description: "Female voice with energetic, professional, and confident delivery" },
  { id: "shimmer", name: "Shimmer", description: "Female voice with conversational, friendly, and approachable style" },
]
const TTS_MODELS = [
  { id: "tts-1", name: "Standard Quality", description: "Good quality voice with lower API usage" },
  { id: "tts-1-hd", name: "HD Quality", description: "Higher fidelity voice with more natural intonation" },
]
const LOCAL_STORAGE_API_KEY = "openaiApiKey_autocast_v2"
const LOCAL_STORAGE_ENDPOINT_KEY = "openaiEndpoint_autocast_v1"

// Pre-configured OpenAI-compatible endpoints

const PODCAST_FRAMEWORK = [
  {
    id: "purpose_audience",
    title: "Define Your Purpose & Audience",
    description:
      "Decide on the podcast's core message, niche, or theme. Identify who your target listeners are and what value you're providing them.",
    placeholder: "e.g., 'Educational podcast for young entrepreneurs about startup strategies and mindset'",
  },
  {
    id: "episode_structure",
    title: "Episode Structure & Format",
    description:
      "Determine the format: solo commentary, interviews, panel discussions, storytelling, or a mix. Develop a rough outline for each episode (e.g., introduction, main content, closing remarks).",
    placeholder: "e.g., 'Solo commentary format with 2-minute intro, 15-minute main content, 3-minute conclusion'",
  },
  {
    id: "scriptwriting_storyboarding",
    title: "Scriptwriting & Storyboarding",
    description:
      "Create a detailed script or bullet-point outline to ensure a coherent flow. Plan transitions, key stories, questions for interviews, and calls to action.",
    placeholder: "e.g., 'Use storytelling approach with personal anecdotes, smooth transitions between points'",
  },
  {
    id: "branding_identity",
    title: "Branding & Identity",
    description:
      "Design a podcast name, logo, and introductory music that resonate with your concept. Create an engaging intro and outro that set the tone for each episode.",
    placeholder: "e.g., 'Professional yet friendly tone, include branded intro/outro, mention social media handles'",
  },
  {
    id: "marketing_engagement",
    title: "Marketing & Audience Engagement",
    description:
      "Develop a launch strategy including social media campaigns, show notes, and a dedicated website or blog. Engage with your audience through social media, listener feedback, and Q&A sessions.",
    placeholder: "e.g., 'Include call-to-action for social media, encourage listener feedback, mention website'",
  },
  {
    id: "schedule_improvement",
    title: "Consistent Schedule & Continuous Improvement",
    description:
      "Establish a regular release schedule to build listener trust. Gather feedback, track analytics, and refine your content and delivery over time.",
    placeholder: "e.g., 'Weekly episodes, mention next episode topic, ask for listener suggestions'",
  },
]

const SYSTEM_PROMPT_TEMPLATES = [
  {
    id: "default",
    name: "Default",
    description: "Balanced approach for general podcast content",
    prompt:
      "You are an expert podcast scriptwriter. Create engaging, conversational content that flows naturally and keeps listeners interested.",
  },
  {
    id: "educational",
    name: "Educational",
    description: "Focus on clear explanations and learning outcomes",
    prompt:
      "You are an educational content expert. Break down complex topics into digestible segments, use analogies and examples, and ensure key concepts are clearly explained for learners.",
  },
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Narrative-driven approach with compelling stories",
    prompt:
      "You are a master storyteller. Weave compelling narratives, use vivid descriptions, create emotional connections, and structure content like an engaging story with clear beginning, middle, and end.",
  },
  {
    id: "conversational",
    name: "Conversational",
    description: "Casual, friendly tone like talking to a friend",
    prompt:
      "You are a friendly conversationalist. Write in a casual, approachable tone as if talking to a close friend. Use everyday language, personal anecdotes, and create an intimate listening experience.",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Authoritative and credible business content",
    prompt:
      "You are a business communication expert. Maintain a professional, authoritative tone while being accessible. Focus on credibility, data-driven insights, and actionable business advice.",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Define your own system prompt",
    prompt: "",
  },
]

type FrameworkPoint = (typeof PODCAST_FRAMEWORK)[0]

interface UploadedFile {
  name: string
  content: string
  size: number
  type: string
}

interface ApiEndpoint {
  id: string
  name: string
  url: string
}

export default function PodcastGeneratorPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // API Key State
  const [apiKey, setApiKey] = useState("")
  const [saveApiKey, setSaveApiKey] = useState(false)
  const [isApiKeyFromStorage, setIsApiKeyFromStorage] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(true)

  // API Endpoint State
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>({
    id: "openai",
    name: "OpenAI (Default)",
    url: "https://api.openai.com",
  })
  const [customEndpointUrl, setCustomEndpointUrl] = useState("")
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false)
  const [endpointStatus, setEndpointStatus] = useState<"untested" | "success" | "error">("untested")
  const [endpointStatusMessage, setEndpointStatusMessage] = useState("")

  // Step 1 State
  const [textInput, setTextInput] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [shouldSummarize, setShouldSummarize] = useState(false)
  const [scriptModel, setScriptModel] = useState("gpt-4o-mini")
  const [language, setLanguage] = useState("en")

  // Drag and Drop State
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  // Step 2 State
  const [selectedFrameworkPoints, setSelectedFrameworkPoints] = useState<string[]>([])
  const [frameworkDetails, setFrameworkDetails] = useState<Record<string, string>>({})
  const [additionalStructurePrompt, setAdditionalStructurePrompt] = useState("")

  // Step 3 State
  const [podcastScript, setPodcastScript] = useState<string | null>(null)
  const [refinementPrompt, setRefinementPrompt] = useState("")

  // Step 4 State
  const [ttsModel, setTtsModel] = useState(TTS_MODELS[0].id)
  const [ttsVoice, setTtsVoice] = useState(TTS_VOICES[0].id)
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null)
  const [audioGenerationProgress, setAudioGenerationProgress] = useState(0)

  // Advanced Settings State
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [systemPromptTemplate, setSystemPromptTemplate] = useState("default")
  const [customSystemPrompt, setCustomSystemPrompt] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<string>("")

  const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "fa", label: "Persian (فارسی)" },
  ]

  // API Key Management
  useEffect(() => {
    const storedApiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY)
    if (storedApiKey) {
      setApiKey(storedApiKey)
      setIsApiKeyFromStorage(true)
      setShowApiKeyInput(false)
      setSaveApiKey(true)
    }

    // Load API endpoint from localStorage
    const storedEndpoint = localStorage.getItem(LOCAL_STORAGE_ENDPOINT_KEY)
    if (storedEndpoint) {
      try {
        const parsedEndpoint = JSON.parse(storedEndpoint)
        if (parsedEndpoint.id === "custom") {
          setCustomEndpointUrl(parsedEndpoint.url)
        }
        setSelectedEndpoint(parsedEndpoint)
      } catch (e) {
        console.error("Failed to parse stored endpoint:", e)
        setSelectedEndpoint({ id: "openai", name: "OpenAI (Default)", url: "https://api.openai.com" })
      }
    }
  }, [])

  const handleApiKeyInputChange = useCallback(
    (value: string) => {
      setApiKey(value)
      if (isApiKeyFromStorage && showApiKeyInput) setIsApiKeyFromStorage(false)
    },
    [isApiKeyFromStorage, showApiKeyInput],
  )

  const handleClearAndEditApiKey = () => {
    localStorage.removeItem(LOCAL_STORAGE_API_KEY)
    setApiKey("")
    setIsApiKeyFromStorage(false)
    setShowApiKeyInput(true)
    setSaveApiKey(false)
    setError(null)
  }

  const ensureApiKeySaved = () => {
    if (saveApiKey && apiKey.trim()) {
      localStorage.setItem(LOCAL_STORAGE_API_KEY, apiKey.trim())
      setIsApiKeyFromStorage(true)
      setShowApiKeyInput(false)
    } else if (!saveApiKey) {
      localStorage.removeItem(LOCAL_STORAGE_API_KEY)
      setIsApiKeyFromStorage(false)
    }
  }

  // Endpoint Management
  const handleEndpointChange = (endpointId: string) => {
    const endpoint = [
      { id: "openai", name: "OpenAI (Default)", url: "https://api.openai.com" },
      { id: "avalai", name: "AvalAI", url: "https://api.avalai.ir" },
      { id: "openrouter", name: "OpenRouter", url: "https://openrouter.ai/api" },
      { id: "aws", name: "AWS Bedrock", url: "https://bedrock-runtime.{region}.amazonaws.com" },
      { id: "azure", name: "Azure OpenAI", url: "https://{resource-name}.openai.azure.com" },
      { id: "custom", name: "Custom Endpoint", url: "" },
    ].find((e) => e.id === endpointId) || { id: "openai", name: "OpenAI (Default)", url: "https://api.openai.com" }
    setSelectedEndpoint(endpoint)
    setEndpointStatus("untested")
    setEndpointStatusMessage("")

    // If custom endpoint, don't save yet until the URL is provided
    if (endpoint.id !== "custom") {
      localStorage.setItem(LOCAL_STORAGE_ENDPOINT_KEY, JSON.stringify(endpoint))
    }
  }

  const handleCustomEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEndpointUrl(e.target.value)
    setEndpointStatus("untested")
    setEndpointStatusMessage("")
  }

  const saveCustomEndpoint = () => {
    if (!customEndpointUrl.trim()) {
      setEndpointStatus("error")
      setEndpointStatusMessage("Please enter a valid URL")
      return
    }

    const customEndpoint = {
      id: "custom",
      name: "Custom Endpoint",
      url: customEndpointUrl.trim(),
    }

    setSelectedEndpoint(customEndpoint)
    localStorage.setItem(LOCAL_STORAGE_ENDPOINT_KEY, JSON.stringify(customEndpoint))
    testEndpointConnection(customEndpoint)
  }

  const testEndpointConnection = async (endpoint: ApiEndpoint) => {
    if (!apiKey.trim()) {
      setEndpointStatus("error")
      setEndpointStatusMessage("API key is required to test the connection")
      return
    }

    setIsTestingEndpoint(true)
    setEndpointStatus("untested")
    setEndpointStatusMessage("")

    try {
      const endpointUrl = endpoint.id === "custom" ? customEndpointUrl : endpoint.url
      const normalizedUrl = endpointUrl.endsWith("/") ? endpointUrl.slice(0, -1) : endpointUrl

      // For AWS and Azure, show a message that they need additional configuration
      if (endpoint.id === "aws" || endpoint.id === "azure") {
        setEndpointStatus("error")
        setEndpointStatusMessage(
          `${endpoint.name} requires additional configuration. Please replace the placeholders in the URL.`,
        )
        setIsTestingEndpoint(false)
        return
      }

      // Since we're in a static export, we can't use API routes
      // Instead, we'll do a direct test to the endpoint
      const testUrl = `${normalizedUrl}/v1/models`

      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data && Array.isArray(data.data)) {
          setEndpointStatus("success")
          setEndpointStatusMessage("Connection successful!")
          // Save the endpoint if it's custom
          if (endpoint.id === "custom") {
            const customEndpoint = {
              id: "custom",
              name: "Custom Endpoint",
              url: customEndpointUrl.trim(),
            }
            setSelectedEndpoint(customEndpoint)
            localStorage.setItem(LOCAL_STORAGE_ENDPOINT_KEY, JSON.stringify(customEndpoint))
          }
        } else {
          setEndpointStatus("error")
          setEndpointStatusMessage("Invalid response format from endpoint")
        }
      } else {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}`

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorData.message || errorMessage
        } catch {
          errorMessage = response.statusText || errorText || errorMessage
        }

        setEndpointStatus("error")
        setEndpointStatusMessage(`Connection failed: ${errorMessage}`)
      }
    } catch (err: any) {
      setEndpointStatus("error")
      setEndpointStatusMessage(err.message || "An error occurred while testing the connection")
    } finally {
      setIsTestingEndpoint(false)
    }
  }

  // Get the current endpoint URL
  const getEndpointUrl = () => {
    if (selectedEndpoint.id === "custom") {
      return customEndpointUrl.trim()
    }
    return selectedEndpoint.url
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // File Processing Function
  const processFiles = async (files: File[]) => {
    setCurrentTask("Reading files...")
    setIsLoading(true)
    setError(null)

    try {
      const newFiles: UploadedFile[] = []

      for (const file of files) {
        if (
          file.type === "text/plain" ||
          file.type === "text/markdown" ||
          file.name.endsWith(".txt") ||
          file.name.endsWith(".md")
        ) {
          // Process text file
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
            reader.readAsText(file)
          })

          newFiles.push({
            name: file.name,
            content,
            size: file.size,
            type: file.name.endsWith(".md") ? "markdown" : "text",
          })
        } else {
          throw new Error(`Unsupported file type: ${file.type} (${file.name}). Please upload .txt or .md files only.`)
        }
      }

      if (newFiles.length === 0) {
        throw new Error("No files could be processed successfully.")
      }

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Combine all file contents
      const allContent = [...uploadedFiles, ...newFiles]
        .map((file) => `--- ${file.name} ---\n${file.content}`)
        .join("\n\n")
      setTextInput(allContent)

      setIsLoading(false)
      setCurrentTask("")
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
      setCurrentTask("")
    }
  }

  // File Handling
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      await processFiles(files)
    }
  }

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(dragCounter + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(dragCounter - 1)
    if (dragCounter - 1 === 0) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDragCounter(0)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFiles(files)
    }
  }

  // Clear uploaded files
  const clearFiles = () => {
    setUploadedFiles([])
    setTextInput("")
    setShouldSummarize(false)
  }

  // Remove specific file
  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)

    // Update text input
    const allContent = newFiles.map((file) => `--- ${file.name} ---\n${file.content}`).join("\n\n")
    setTextInput(allContent)
  }

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "markdown":
        return <FileText className="w-4 h-4 text-blue-500" />
      default:
        return <FileText className="w-4 h-4 text-green-500" />
    }
  }

  // Step Navigation
  const nextStep = () => setCurrentStep((prev) => prev + 1)
  const prevStep = () => setCurrentStep((prev) => prev - 1)

  // Validation for Step 1
  const validateStep1 = () => {
    if (!apiKey.trim()) {
      setError("Please configure your OpenAI API key in settings.")
      setSettingsOpen(true)
      return false
    }
    if (!textInput.trim()) {
      setError("Please enter some text to generate a podcast from.")
      return false
    }
    return true
  }

  // Framework handling
  const toggleFrameworkPoint = (pointId: string) => {
    setSelectedFrameworkPoints((prev) => {
      const newSelected = prev.includes(pointId) ? prev.filter((id) => id !== pointId) : [...prev, pointId]

      // Clear the detail for this point if it's being unchecked
      if (prev.includes(pointId)) {
        setFrameworkDetails((prevDetails) => {
          const newDetails = { ...prevDetails }
          delete newDetails[pointId]
          return newDetails
        })
      }

      return newSelected
    })
  }

  const updateFrameworkDetail = (pointId: string, detail: string) => {
    setFrameworkDetails((prev) => ({
      ...prev,
      [pointId]: detail,
    }))
  }

  // Direct API calls for static export
  const callOpenAIAPI = async (endpoint: string, payload: any) => {
    const endpointUrl = getEndpointUrl()
    const normalizedUrl = endpointUrl.endsWith("/") ? endpointUrl.slice(0, -1) : endpointUrl

    const response = await fetch(`${normalizedUrl}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`)
    }

    return response
  }

  // API Calls
  const handleGenerateScript = async () => {
    if (!validateStep1()) return

    ensureApiKeySaved()
    setIsLoading(true)
    setError(null)
    setAudioGenerationProgress(0)

    try {
      let finalTextInput = textInput

      // If multiple files and summarization is requested, summarize first
      if (uploadedFiles.length > 1 && shouldSummarize) {
        setCurrentTask("Summarizing content from multiple files...")

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

        const response = await callOpenAIAPI("/v1/chat/completions", {
          model: scriptModel,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: temperature,
        })

        const data = await response.json()
        if (!data.choices?.[0]?.message?.content) {
          throw new Error("AI returned an empty summary.")
        }

        finalTextInput = data.choices[0].message.content
        setTextInput(finalTextInput) // Update the text input with summarized content
      }

      setCurrentTask("Generating initial script...")

      // Get the system prompt
      const selectedTemplate = SYSTEM_PROMPT_TEMPLATES.find((t) => t.id === systemPromptTemplate)
      const systemPrompt = systemPromptTemplate === "custom" ? customSystemPrompt : selectedTemplate?.prompt || ""

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

      const prompt = `${systemPrompt}

Transform the following text into an engaging, conversational podcast script in ${language === "fa" ? "Persian" : "English"}.
${languageInstruction}
${frameworkInstructions}
The script should include a captivating intro, a well-structured main body explaining key points, and a concise conclusion.
Make sure to incorporate the user's specific requirements for each selected framework point.
Ensure the output is ONLY the script itself, without any surrounding explanations or preambles.

Original Text:
---
${finalTextInput}
---
Podcast Script:`

      const response = await callOpenAIAPI("/v1/chat/completions", {
        model: scriptModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: temperature,
      })

      const data = await response.json()
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("AI returned an empty script.")
      }

      setPodcastScript(data.choices[0].message.content)
      nextStep() // Move to Step 3 (Review)
    } catch (err: any) {
      if (err.message.includes("401") || err.message.includes("Authentication")) {
        setError("Invalid OpenAI API Key. Please check your key in settings.")
        handleClearAndEditApiKey()
        setSettingsOpen(true)
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
      setCurrentTask("")
    }
  }

  const handleRefineScript = async () => {
    if (!apiKey.trim() || !podcastScript || !refinementPrompt.trim()) {
      setError("Missing API key, existing script, or refinement prompt.")
      return
    }
    ensureApiKeySaved()
    setIsLoading(true)
    setError(null)
    setCurrentTask("Refining script...")
    setAudioGenerationProgress(0)

    try {
      // Get the system prompt
      const selectedTemplate = SYSTEM_PROMPT_TEMPLATES.find((t) => t.id === systemPromptTemplate)
      const systemPrompt = systemPromptTemplate === "custom" ? customSystemPrompt : selectedTemplate?.prompt || ""

      const languageInstruction =
        language === "fa"
          ? "The refined podcast script MUST be written entirely in Persian (Farsi)."
          : "The refined podcast script MUST be written entirely in English."

      const prompt = `${systemPrompt}

Refine the following podcast script based on the user's feedback.
${languageInstruction}
Ensure the output is ONLY the refined script itself.

Original Script:
---
${podcastScript}
---
User Feedback for Refinement:
---
${refinementPrompt}
---
Refined Podcast Script:`

      const response = await callOpenAIAPI("/v1/chat/completions", {
        model: scriptModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: temperature,
      })

      const data = await response.json()
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("AI returned an empty refined script.")
      }

      setPodcastScript(data.choices[0].message.content)
      setRefinementPrompt("") // Clear prompt after use
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setCurrentTask("")
    }
  }

  const handleGenerateAudio = async () => {
    if (!apiKey.trim() || !podcastScript) {
      setError("Missing API key or script for audio generation.")
      return
    }
    ensureApiKeySaved()
    setIsLoading(true)
    setError(null)
    setCurrentTask("Synthesizing audio...")
    setAudioDataUrl(null)
    setAudioGenerationProgress(10) // Initial progress

    // Simulate progress for TTS as OpenAI API doesn't stream progress
    const progressInterval = setInterval(() => {
      setAudioGenerationProgress((prev) => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 300)

    try {
      const endpointUrl = getEndpointUrl()
      const normalizedUrl = endpointUrl.endsWith("/") ? endpointUrl.slice(0, -1) : endpointUrl

      const response = await fetch(`${normalizedUrl}/v1/audio/speech`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: ttsModel,
          input: podcastScript,
          voice: ttsVoice,
          response_format: "mp3",
        }),
      })

      clearInterval(progressInterval)
      setAudioGenerationProgress(100)

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
      setAudioDataUrl(audioDataUrl)
    } catch (err: any) {
      clearInterval(progressInterval)
      setAudioGenerationProgress(0)
      setError(err.message)
    } finally {
      setIsLoading(false)
      setCurrentTask("")
    }
  }

  const handleDownloadAudio = useCallback(() => {
    if (!audioDataUrl) return
    const link = document.createElement("a")
    link.href = audioDataUrl
    link.download = `podcast_${new Date().toISOString()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [audioDataUrl])

  const resetAll = () => {
    setCurrentStep(1)
    setTextInput("")
    setUploadedFiles([])
    setShouldSummarize(false)
    setSelectedFrameworkPoints([])
    setFrameworkDetails({})
    setAdditionalStructurePrompt("")
    setPodcastScript(null)
    setRefinementPrompt("")
    setAudioDataUrl(null)
    setError(null)
    setCurrentTask("")
    setIsLoading(false)
    setAudioGenerationProgress(0)
  }

  // Drag and Drop Upload Component
  const DragDropUpload = () => (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        } ${uploadedFiles.length > 0 ? "bg-muted/20" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {uploadedFiles.length > 0 ? (
          // Files uploaded state
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Files className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} uploaded
                </p>
                <p className="text-xs text-muted-foreground">
                  Total size: {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.size, 0))}
                </p>
              </div>
            </div>

            {/* File list */}
            <div className="max-h-32 overflow-y-auto space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-background/50 rounded border border-border"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Summarization option for multiple files */}
            {uploadedFiles.length > 1 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="summarizeContent"
                    checked={shouldSummarize}
                    onCheckedChange={(checked) => setShouldSummarize(Boolean(checked))}
                    className="border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                  />
                  <Label htmlFor="summarizeContent" className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Summarize content before creating script
                  </Label>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6">
                  Recommended for multiple files to create a cohesive podcast script
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFiles}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all files
              </Button>
              <div className="flex-1 h-px bg-border self-center"></div>
              <span className="text-xs text-muted-foreground self-center">OR</span>
              <div className="flex-1 h-px bg-border self-center"></div>
              <Label htmlFor="file-upload-additional">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  asChild
                >
                  <span>
                    <UploadCloud className="w-4 h-4 mr-1" />
                    Add more
                  </span>
                </Button>
              </Label>
            </div>
          </div>
        ) : (
          // Default upload state
          <div className="space-y-4">
            <div className="flex justify-center">
              <UploadCloud
                className={`w-12 h-12 transition-colors duration-200 ${
                  isDragOver ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="space-y-2">
              <p
                className={`text-lg font-medium transition-colors duration-200 ${
                  isDragOver ? "text-primary" : "text-foreground"
                }`}
              >
                {isDragOver ? "Drop your files here" : "Drag & drop your files here"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .txt and .md files only • Multiple files supported
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <div>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.md"
                className="hidden"
                id="file-upload"
                multiple
              />
              <Label htmlFor="file-upload">
                <Button
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  asChild
                >
                  <span>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Browse files
                  </span>
                </Button>
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Hidden input for additional files */}
      <Input
        type="file"
        onChange={handleFileChange}
        accept=".txt,.md"
        className="hidden"
        id="file-upload-additional"
        multiple
      />
    </div>
  )

  // Features Section Component
  const FeaturesSection = () => (
    <section className="mt-12 mb-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Why Choose AutoCast?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Lightning Fast</h3>
          <p className="text-sm text-muted-foreground">
            Generate professional podcast scripts and audio in minutes, not hours.
          </p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Multi-Language</h3>
          <p className="text-sm text-muted-foreground">
            Support for English and Persian with natural-sounding voices for each language.
          </p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
          <p className="text-sm text-muted-foreground">
            Your API keys and content are stored locally. We never see your data.
          </p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Time Saving</h3>
          <p className="text-sm text-muted-foreground">
            Transform hours of writing and recording into a simple 4-step process.
          </p>
        </div>
      </div>
    </section>
  )

  // Render Logic
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Input Text and Language
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="textInput" className="text-foreground">
                Your Text Content
              </Label>
              <RichTextEditor
                value={textInput}
                onChange={setTextInput}
                placeholder="Paste your text here or upload files below to get started with AI podcast generation"
                className="mt-2"
                dir={language === "fa" ? "rtl" : "ltr"}
              />
            </div>

            <DragDropUpload />

            <div>
              <Label htmlFor="language" className="text-foreground">
                Podcast Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  id="language"
                  className="bg-background border-border text-foreground focus:border-primary"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value} className="hover:bg-accent focus:bg-accent">
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={nextStep}
              disabled={!textInput.trim() || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Next: Configure Structure <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )
      case 2: // Configure Structure
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">Podcast Structure Framework</h3>
            <p className="text-sm text-muted-foreground">
              Select points to emphasize in your podcast script and provide specific details for each.
            </p>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {PODCAST_FRAMEWORK.map((point) => (
                <div key={point.id} className="p-4 bg-muted/50 rounded-md border border-border space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={point.id}
                      checked={selectedFrameworkPoints.includes(point.id)}
                      onCheckedChange={() => toggleFrameworkPoint(point.id)}
                      className="mt-1 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <div className="grid gap-1.5 leading-none flex-1">
                      <Label htmlFor={point.id} className="text-sm font-medium text-foreground cursor-pointer">
                        {point.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">{point.description}</p>
                    </div>
                  </div>

                  {/* Show text input when checkbox is checked */}
                  {selectedFrameworkPoints.includes(point.id) && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor={`detail-${point.id}`} className="text-xs text-foreground">
                        Specific details for this aspect:
                      </Label>
                      <Textarea
                        id={`detail-${point.id}`}
                        value={frameworkDetails[point.id] || ""}
                        onChange={(e) => updateFrameworkDetail(point.id, e.target.value)}
                        placeholder={point.placeholder}
                        rows={2}
                        className="bg-background border-border placeholder:text-muted-foreground text-foreground focus:border-primary text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="additionalStructurePrompt" className="text-foreground">
                Additional Structuring Notes (Optional)
              </Label>
              <Textarea
                id="additionalStructurePrompt"
                value={additionalStructurePrompt}
                onChange={(e) => setAdditionalStructurePrompt(e.target.value)}
                placeholder="e.g., 'Emphasize storytelling for the main content', 'Keep the intro under 30 seconds'"
                rows={3}
                className="bg-background border-border placeholder:text-muted-foreground text-foreground focus:border-primary"
              />
            </div>
            <div className="flex justify-between">
              <Button
                onClick={prevStep}
                variant="outline"
                className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={handleGenerateScript}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {currentTask || "Generating..."}
                  </>
                ) : (
                  <>
                    Generate Script <Wand2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )
      case 3: // Review Script & Refine
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">Review Generated Script</h3>
            <RichTextEditor
              value={podcastScript || ""}
              onChange={setPodcastScript}
              placeholder="Your generated script will appear here..."
              className="min-h-[400px]"
              dir={language === "fa" ? "rtl" : "ltr"}
              readOnly={isLoading}
            />
            <div>
              <Label htmlFor="refinementPrompt" className="text-foreground">
                Refinement Prompt (Optional)
              </Label>
              <Textarea
                id="refinementPrompt"
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder="e.g., 'Make it more conversational', 'Add a joke here', 'Explain X in simpler terms'"
                rows={3}
                className="bg-background border-border placeholder:text-muted-foreground text-foreground focus:border-primary"
              />
              <Button
                onClick={handleRefineScript}
                disabled={isLoading || !refinementPrompt.trim()}
                variant="outline"
                className="mt-2 text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 w-full md:w-auto"
              >
                {isLoading && currentTask.includes("Refining") ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refining...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refine Script with Feedback
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
              <h4 className="text-md font-semibold text-primary mb-2 flex items-center">
                <Volume2 className="w-4 h-4 mr-2" /> Text-to-Speech Settings
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Configure how your podcast script will sound when converted to audio. Different models and voices offer
                varying levels of quality and character.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ttsModelStep3" className="text-foreground">
                    TTS Model
                  </Label>
                  <Select value={ttsModel} onValueChange={(value) => setTtsModel(value)}>
                    <SelectTrigger
                      id="ttsModelStep3"
                      className="bg-background border-border text-foreground focus:border-primary"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                      {TTS_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="hover:bg-accent focus:bg-accent">
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    HD model offers higher quality audio with more natural intonation but uses more API credits.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ttsVoiceStep3" className="text-foreground">
                    TTS Voice
                  </Label>
                  <Select value={ttsVoice} onValueChange={(value) => setTtsVoice(value)}>
                    <SelectTrigger
                      id="ttsVoiceStep3"
                      className="bg-background border-border text-foreground focus:border-primary"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground max-h-[300px]">
                      {TTS_VOICES.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id} className="hover:bg-accent focus:bg-accent">
                          {voice.name} ({voice.description})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      Choose a voice that matches your podcast's tone and style.
                    </p>
                    <VoiceSamplePlayer voice={ttsVoice} apiKey={apiKey} endpointUrl={getEndpointUrl()} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                onClick={prevStep}
                variant="outline"
                className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={() => {
                  nextStep()
                  handleGenerateAudio()
                }}
                disabled={isLoading || !podcastScript}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading && currentTask.includes("Synthesizing") ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {currentTask}
                  </>
                ) : (
                  <>
                    Looks Good, Generate Audio <Volume2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )
      case 4: // Generate Audio & Output
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">Podcast Audio</h3>
            {isLoading && currentTask.includes("Synthesizing") && (
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  {currentTask} ({audioGenerationProgress}%)
                </p>
                <Progress value={audioGenerationProgress} className="w-full [&>div]:bg-primary" />
              </div>
            )}
            {audioDataUrl && !isLoading && (
              <div className="space-y-4">
                <audio controls src={audioDataUrl} className="w-full rounded-md">
                  Your browser does not support audio.
                </audio>
                <Button
                  onClick={handleDownloadAudio}
                  variant="outline"
                  className="w-full text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="w-4 h-4 mr-2" /> Download MP3
                </Button>
              </div>
            )}
            {!isLoading && (
              <Button
                onClick={resetAll}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Start Over
              </Button>
            )}
            <div className="flex justify-between">
              <Button
                onClick={prevStep}
                variant="outline"
                className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
                disabled={isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back to Script
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8 flex flex-col items-center text-foreground relative">
      {/* SEO Header Section */}
      <header className="w-full max-w-4xl text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <Image
            src="/Auto Cast-Logo.png"
            alt="AutoCast Logo"
            width={200}
            height={80}
            className="h-16 w-auto"
            priority
          />
        </div>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Transform your written content into professional podcast scripts and high-quality audio using advanced AI
          technology. Support for multiple languages with natural-sounding voices.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-8">
          <span className="bg-muted/50 px-3 py-1 rounded-full">AI Script Generation</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">Text-to-Speech</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">Multi-Language</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">Professional Quality</span>
        </div>
      </header>

      <Card className="w-full max-w-4xl bg-card/70 backdrop-blur-sm border-border text-foreground shadow-2xl">
        <CardHeader>
          <div className="flex justify-center items-center flex-1">
            <Image
              src="/Auto Cast-Icon.png"
              alt="AutoCast Icon"
              width={40}
              height={40}
              className="w-10 h-10"
              priority
            />
          </div>
          <CardTitle className="text-2xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            AutoCast
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Step {currentStep} of 4:{" "}
            {currentStep === 1
              ? "Input & Configuration"
              : currentStep === 2
                ? "Structure Podcast"
                : currentStep === 3
                  ? "Review Script"
                  : "Generate Audio"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Features Section - Only show on step 1 */}
      {currentStep === 1 && <FeaturesSection />}

      {/* Floating Settings Button */}
      <Button
        onClick={() => setSettingsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105"
        size="icon"
        aria-label="Open Settings"
      >
        <Settings className="w-6 h-6" />
      </Button>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyInputChange}
        saveApiKey={saveApiKey}
        onSaveApiKeyChange={setSaveApiKey}
        isApiKeyFromStorage={isApiKeyFromStorage}
        showApiKeyInput={showApiKeyInput}
        onShowApiKeyInputChange={setShowApiKeyInput}
        onClearAndEditApiKey={handleClearAndEditApiKey}
        selectedEndpoint={selectedEndpoint}
        onEndpointChange={handleEndpointChange}
        customEndpointUrl={customEndpointUrl}
        onCustomEndpointChange={handleCustomEndpointChange}
        onSaveCustomEndpoint={saveCustomEndpoint}
        onTestEndpointConnection={testEndpointConnection}
        isTestingEndpoint={isTestingEndpoint}
        endpointStatus={endpointStatus}
        endpointStatusMessage={endpointStatusMessage}
        scriptModel={scriptModel}
        onScriptModelChange={setScriptModel}
        showAdvancedSettings={showAdvancedSettings}
        onShowAdvancedSettingsChange={setShowAdvancedSettings}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        systemPromptTemplate={systemPromptTemplate}
        onSystemPromptTemplateChange={setSystemPromptTemplate}
        customSystemPrompt={customSystemPrompt}
        onCustomSystemPromptChange={setCustomSystemPrompt}
        onSaveSettings={() => {
          ensureApiKeySaved()
          setSettingsOpen(false)
        }}
      />

      <footer className="mt-8 text-center text-muted-foreground text-sm max-w-4xl space-y-4">
        <div className="space-y-2">
          <p className="mb-2">
            <strong>AutoCast</strong> - Powered by Vercel AI and OpenAI. Transform any text into engaging podcasts.
          </p>
          <p className="text-xs">
            Your API keys and content are stored locally in your browser. We prioritize your privacy and data security.
          </p>
        </div>

        {/* Related Tools Section */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">Related Tools</h3>
          <div className="text-left">
            <a
              href="https://subtitile-flow.moaminsharifi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline font-medium"
            >
              Subtitle Flow
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Your go-to, privacy-focused subtitle editor. This browser-based tool lets you upload media and work with
              SRT/VTT files directly in your browser – no backend needed! Enjoy blazing speed, full privacy, and
              optional AI transcription to generate subtitles effortlessly.
            </p>
          </div>
        </div>

        {/* Creator and Links Section */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs">
            Created by{" "}
            <a
              href="https://moaminsharifi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline font-medium"
            >
              Amin Sharifi
            </a>
          </p>
          <p className="text-xs">
            <a
              href="https://github.com/moaminsharifi/auto-cast"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline"
            >
              View Source Code on GitHub
            </a>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
          <span>✨ AI-Powered Script Generation</span>
          <span>🎙️ Professional Voice Synthesis</span>
          <span>🌍 Multi-Language Support</span>
          <span>🔒 Privacy-First Design</span>
        </div>
      </footer>
    </div>
  )
}
