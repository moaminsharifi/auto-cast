"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTheme } from "@/components/theme-provider"
import {
  Loader2,
  Mic,
  AlertCircle,
  KeyRound,
  Edit3,
  Trash2,
  ChevronRight,
  Settings,
  Monitor,
  Sun,
  Moon,
  FileText,
  Languages,
  Server,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import FeaturesSection from "@/components/features-section" // Import FeaturesSection component

const SCRIPT_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano"]
const TTS_VOICES = [
  { id: "alloy", name: "Alloy" },
  { id: "echo", name: "Echo" },
  { id: "fable", name: "Fable" },
  { id: "onyx", name: "Onyx" },
  { id: "nova", name: "Nova" },
  { id: "shimmer", name: "Shimmer" },
]
const TTS_MODELS = [
  { id: "tts-1", name: "standard" },
  { id: "tts-1-hd", name: "hd" },
]
const LOCAL_STORAGE_API_KEY = "openaiApiKey_autocast_v2"
const LOCAL_STORAGE_LOCALE_KEY = "autocast_locale"
const LOCAL_STORAGE_ENDPOINT_KEY = "openaiEndpoint_autocast_v1"

// Pre-configured OpenAI-compatible endpoints
const API_ENDPOINTS = [
  { id: "openai", name: "OpenAI (Default)", url: "https://api.openai.com" },
  { id: "avalai", name: "AvalAI", url: "https://api.avalonai.org" },
  { id: "openrouter", name: "OpenRouter", url: "https://openrouter.ai/api" },
  { id: "aws", name: "AWS Bedrock", url: "https://bedrock-runtime.{region}.amazonaws.com" },
  { id: "azure", name: "Azure OpenAI", url: "https://{resource-name}.openai.azure.com" },
  { id: "custom", name: "Custom Endpoint", url: "" },
]

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
      "Establish a realistic publishing schedule that you can maintain. Regularly review analytics to understand what content resonates with your audience.",
  },
]

const SYSTEM_PROMPT_TEMPLATES = ["default", "educational", "storytelling", "conversational", "professional", "custom"]

type FrameworkPoint = string

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

export default function PodcastGeneratorClientPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const isRTL = locale === "fa" || locale === "ar"

  const [currentStep, setCurrentStep] = useState(1)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // API Key State
  const [apiKey, setApiKey] = useState("")
  const [saveApiKey, setSaveApiKey] = useState(false)
  const [isApiKeyFromStorage, setIsApiKeyFromStorage] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(true)

  // API Endpoint State
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0])
  const [customEndpointUrl, setCustomEndpointUrl] = useState("")
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false)
  const [endpointStatus, setEndpointStatus] = useState<"untested" | "success" | "error">("untested")
  const [endpointStatusMessage, setEndpointStatusMessage] = useState("")

  // Step 1 State
  const [textInput, setTextInput] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [shouldSummarize, setShouldSummarize] = useState(false)
  const [scriptModel, setScriptModel] = useState(SCRIPT_MODELS[0])
  const [language, setLanguage] = useState("en")

  // Drag and Drop State
  const [isDragOver, setIsDragOver] = useState(0)
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
    { value: "ar", label: "Arabic (العربية)" },
  ]

  // Language switching
  const switchLanguage = (newLocale: string) => {
    localStorage.setItem(LOCAL_STORAGE_LOCALE_KEY, newLocale)
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

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
        // Fallback to default endpoint
        setSelectedEndpoint(API_ENDPOINTS[0])
      }
    }
  }, [])

  const handleApiKeyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value)
    if (isApiKeyFromStorage && showApiKeyInput) setIsApiKeyFromStorage(false)
  }

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

  // API Endpoint Management
  const handleEndpointChange = (endpointId: string) => {
    const endpoint = API_ENDPOINTS.find((e) => e.id === endpointId) || API_ENDPOINTS[0]
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

      // Test the connection by making a simple models list request
      const testUrl = `${normalizedUrl}/v1/models`

      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
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
        setEndpointStatusMessage(data.error?.message || `Failed to connect: ${response.status} ${response.statusText}`)
      }
    } catch (err: any) {
      setEndpointStatus("error")
      setEndpointStatusMessage(err.message || "An error occurred while testing the connection")
    } finally {
      setIsTestingEndpoint(false)
    }
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
    setCurrentTask(t("common.readingFiles"))
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
            reader.onerror = () => reject(new Error(t("errors.readError", { name: file.name })))
            reader.readAsText(file)
          })

          newFiles.push({
            name: file.name,
            content,
            size: file.size,
            type: file.name.endsWith(".md") ? "markdown" : "text",
          })
        } else {
          throw new Error(t("errors.unsupportedFile", { type: file.type, name: file.name }))
        }
      }

      if (newFiles.length === 0) {
        throw new Error(t("errors.noFiles"))
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
      setIsDragOver(1)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(dragCounter - 1)
    if (dragCounter - 1 === 0) {
      setIsDragOver(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(0)
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
      setError(t("errors.apiKeyRequired"))
      setSettingsOpen(true)
      return false
    }
    if (!textInput.trim()) {
      setError(t("errors.textRequired"))
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

  // Get the current endpoint URL
  const getEndpointUrl = () => {
    if (selectedEndpoint.id === "custom") {
      return customEndpointUrl.trim()
    }
    return selectedEndpoint.url
  }

  // API Calls
  const callOpenAITextAPI = async (
    prompt: string,
    model: string,
    temp: number,
    max_tokens: number,
    api_key: string,
    endpoint_url: string,
    system_prompt?: string,
  ) => {
    const normalizedUrl = endpoint_url.endsWith("/") ? endpoint_url.slice(0, -1) : endpoint_url
    const chatCompletionsUrl = `${normalizedUrl}/v1/chat/completions`

    const messages = []
    if (system_prompt) {
      messages.push({ role: "system", content: system_prompt })
    }
    messages.push({ role: "user", content: prompt })

    const response = await fetch(chatCompletionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${api_key}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temp,
        max_tokens: max_tokens,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ""
  }

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
        setCurrentTask(t("common.summarizing"))

        const languageInstruction =
          language === "fa"
            ? "The summary MUST be written entirely in Persian (Farsi)."
            : language === "ar"
              ? "The summary MUST be written entirely in Arabic."
              : "The summary MUST be written entirely in English."

        const summarizePrompt = `You are an expert content summarizer. Your task is to create a comprehensive yet concise summary of the following multiple documents/texts that will be used to generate a podcast script.

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

        const summary = await callOpenAITextAPI(
          summarizePrompt,
          scriptModel,
          temperature,
          maxTokens,
          apiKey,
          getEndpointUrl(),
        )
        if (!summary) throw new Error("AI returned an empty summary.")
        finalTextInput = summary
        setTextInput(finalTextInput) // Update the text input with summarized content
      }

      setCurrentTask(t("common.generatingScript"))

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
          : language === "ar"
            ? "The podcast script MUST be written entirely in Arabic."
            : "The podcast script MUST be written entirely in English."

      // Get the system prompt
      const systemPromptKey = `systemPrompts.${systemPromptTemplate}.prompt` as any
      const systemPrompt = systemPromptTemplate === "custom" ? customSystemPrompt : t(systemPromptKey)

      const scriptPrompt = `Transform the following text into an engaging, conversational podcast script in ${language === "fa" ? "Persian" : language === "ar" ? "Arabic" : "English"}.
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

      const generatedScript = await callOpenAITextAPI(
        scriptPrompt,
        scriptModel,
        temperature,
        maxTokens,
        apiKey,
        getEndpointUrl(),
        systemPrompt,
      )
      if (!generatedScript) throw new Error("AI returned an empty script.")
      setPodcastScript(generatedScript)
      nextStep() // Move to Step 3 (Review)
    } catch (err: any) {
      setError(err.message)
      if (err.message.toLowerCase().includes("authentication error") || err.message.includes("401")) {
        handleClearAndEditApiKey()
        setSettingsOpen(true)
      }
    } finally {
      setIsLoading(false)
      setCurrentTask("")
    }
  }

  const handleRefineScript = async () => {
    if (!apiKey.trim() || !podcastScript || !refinementPrompt.trim()) {
      setError(t("errors.missingFields"))
      return
    }
    ensureApiKeySaved()
    setIsLoading(true)
    setError(null)
    setCurrentTask(t("common.refining"))
    setAudioGenerationProgress(0)

    try {
      const languageInstruction =
        language === "fa"
          ? "The refined podcast script MUST be written entirely in Persian (Farsi)."
          : language === "ar"
            ? "The refined podcast script MUST be written entirely in Arabic."
            : "The refined podcast script MUST be written entirely in English."

      // Get the system prompt
      const systemPromptKey = `systemPrompts.${systemPromptTemplate}.prompt` as any
      const systemPrompt = systemPromptTemplate === "custom" ? customSystemPrompt : t(systemPromptKey)

      const refinePrompt = `Refine the following podcast script based on the user's feedback.
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

      const refinedScript = await callOpenAITextAPI(
        refinePrompt,
        scriptModel,
        temperature,
        maxTokens,
        apiKey,
        getEndpointUrl(),
        systemPrompt,
      )
      if (!refinedScript) throw new Error("AI returned an empty refined script.")
      setPodcastScript(refinedScript)
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
      setError(t("errors.audioGeneration"))
      return
    }
    ensureApiKeySaved()
    setIsLoading(true)
    setError(null)
    setCurrentTask(t("common.synthesizing"))
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
      const ttsEndpointUrl = getEndpointUrl()
      const normalizedTtsUrl = ttsEndpointUrl.endsWith("/") ? ttsEndpointUrl.slice(0, -1) : ttsEndpointUrl
      const speechUrl = `${normalizedTtsUrl}/v1/audio/speech`

      const response = await fetch(speechUrl, {
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
          `TTS API Error: ${errorData.error?.message || response.statusText} (Status: ${response.status})`,
        )
      }
      const audioBlob = await response.blob()
      const audioDataUrl = URL.createObjectURL(audioBlob)
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
    URL.revokeObjectURL(audioDataUrl) // Clean up the object URL
  }, [audioDataUrl])

  const resetAll = () => {
    setCurrentStep(1)
    setTextInput("")
    setUploadedFiles([])
    setShouldSummarize(false)
    // Keep model/language selections
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

  // Settings Modal Component
  const SettingsModal = () => {
    const { theme, setTheme } = useTheme()

    return (
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-background border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              {t("settings.title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">{t("settings.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Language Section */}
            <div className="space-y-3">
              <Label className="text-foreground flex items-center">
                <Languages className="w-4 h-4 mr-2 text-primary" /> {t("settings.language.title")}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={locale === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchLanguage("en")}
                  className={`flex items-center justify-center ${
                    locale === "en"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-accent"
                  }`}
                >
                  {t("settings.language.english")}
                </Button>
                <Button
                  variant={locale === "fa" ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchLanguage("fa")}
                  className={`flex items-center justify-center ${
                    locale === "fa"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-accent"
                  }`}
                >
                  {t("settings.language.persian")}
                </Button>
                <Button
                  variant={locale === "ar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchLanguage("ar")}
                  className={`flex items-center justify-center ${
                    locale === "ar"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-accent"
                  }`}
                >
                  {t("settings.language.arabic")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.language.description")}</p>
            </div>

            {/* Theme Section */}
            <div className="space-y-3">
              <Label className="text-foreground flex items-center">
                <Monitor className="w-4 h-4 mr-2 text-primary" /> {t("settings.theme.title")}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center ${
                    theme === "light"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-accent"
                  }`}
                >
                  <Sun className="w-4 h-4 mr-1" />
                  {t("settings.theme.light")}
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-accent"
                  }`}
                >
                  <Moon className="w-4 h-4 mr-1" />
                  {t("settings.theme.dark")}
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className={`flex items-center justify-center ${
                    theme === "system"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-accent"
                  }`}
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  {t("settings.theme.auto")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.theme.description")}</p>
            </div>

            {/* API Key Section */}
            <div className="space-y-3">
              <Label htmlFor="settingsApiKey" className="text-foreground flex items-center">
                <KeyRound className="w-4 h-4 mr-2 text-primary" /> {t("settings.apiKey.title")}
              </Label>
              {showApiKeyInput || !isApiKeyFromStorage ? (
                <>
                  <Input
                    id="settingsApiKey"
                    type="password"
                    value={apiKey}
                    onChange={handleApiKeyInputChange}
                    placeholder={t("settings.apiKey.placeholder")}
                    className="bg-background border-border placeholder:text-muted-foreground text-foreground focus:border-primary"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="settingsSaveApiKey"
                      checked={saveApiKey}
                      onCheckedChange={(checked) => setSaveApiKey(Boolean(checked))}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor="settingsSaveApiKey" className="text-sm text-muted-foreground font-medium">
                      {t("settings.apiKey.save")}
                    </Label>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-muted/50 rounded-md border border-border space-y-2">
                  <p className="text-sm text-green-600 dark:text-green-400">{t("settings.apiKey.saved")}</p>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKeyInput(true)}
                      className="text-primary border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <Edit3 className="w-3 h-3 mr-1.5" /> {t("settings.apiKey.edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleClearAndEditApiKey}
                      className="text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3 mr-1.5" /> {t("settings.apiKey.clear")}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* API Endpoint Section */}
            <div className="space-y-3">
              <Label htmlFor="settingsApiEndpoint" className="text-foreground flex items-center">
                <Server className="w-4 h-4 mr-2 text-primary" /> API Endpoint
              </Label>
              <Select value={selectedEndpoint.id} onValueChange={handleEndpointChange}>
                <SelectTrigger
                  id="settingsApiEndpoint"
                  className="bg-background border-border text-foreground focus:border-primary"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  {API_ENDPOINTS.map((endpoint) => (
                    <SelectItem key={endpoint.id} value={endpoint.id} className="hover:bg-accent focus:bg-accent">
                      {endpoint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedEndpoint.id === "custom" && (
                <div className="space-y-2">
                  <Input
                    id="customEndpointUrl"
                    type="text"
                    value={customEndpointUrl}
                    onChange={handleCustomEndpointChange}
                    placeholder="Enter custom endpoint URL (e.g., https://api.example.com)"
                    className="bg-background border-border placeholder:text-muted-foreground text-foreground focus:border-primary"
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={saveCustomEndpoint}
                      disabled={isTestingEndpoint || !customEndpointUrl.trim()}
                      className="text-primary border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      Save Custom URL
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => testEndpointConnection(selectedEndpoint)}
                      disabled={isTestingEndpoint || !customEndpointUrl.trim()}
                      className="text-primary border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      {isTestingEndpoint ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Testing...
                        </>
                      ) : (
                        <>
                          <Server className="w-3 h-3 mr-1.5" /> Test Connection
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {selectedEndpoint.id !== "custom" && (
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">{selectedEndpoint.url}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => testEndpointConnection(selectedEndpoint)}
                    disabled={isTestingEndpoint}
                    className="text-primary border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    {isTestingEndpoint ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Testing...
                      </>
                    ) : (
                      <>
                        <Server className="w-3 h-3 mr-1.5" /> Test Connection
                      </>
                    )}
                  </Button>
                </div>
              )}

              {endpointStatus !== "untested" && (
                <div
                  className={`p-2 rounded-md ${
                    endpointStatus === "success"
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {endpointStatus === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <p
                      className={`text-sm ${
                        endpointStatus === "success"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {endpointStatusMessage}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Select an OpenAI-compatible API endpoint or enter a custom URL.
              </p>
            </div>

            {/* Script Model Section */}
            <div className="space-y-3">
              <Label htmlFor="settingsScriptModel" className="text-foreground">
                {t("settings.model.title")}
              </Label>
              <Select value={scriptModel} onValueChange={setScriptModel}>
                <SelectTrigger
                  id="settingsScriptModel"
                  className="bg-background border-border text-foreground focus:border-primary"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  {SCRIPT_MODELS.map((m) => (
                    <SelectItem key={m} value={m} className="hover:bg-accent focus:bg-accent">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t("settings.model.description")}</p>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-primary" /> {t("settings.advanced.title")}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-primary hover:bg-primary/10"
                >
                  {showAdvancedSettings ? t("settings.advanced.hide") : t("settings.advanced.show")}
                  <ChevronRight
                    className={`w-4 h-4 ml-1 transition-transform ${showAdvancedSettings ? "rotate-90" : ""}`}
                  />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.advanced.description")}</p>
            </div>

            {/* Advanced Settings Content */}
            {showAdvancedSettings && (
              <div className="space-y-6 p-4 bg-muted/30 rounded-lg border border-border">
                {/* System Prompt Template */}
                <div className="space-y-3">
                  <Label htmlFor="systemPromptTemplate" className="text-foreground">
                    {t("settings.advanced.systemPrompt.title")}
                  </Label>
                  <Select value={systemPromptTemplate} onValueChange={setSystemPromptTemplate}>
                    <SelectTrigger
                      id="systemPromptTemplate"
                      className="bg-background border-border text-foreground focus:border-primary"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground max-h-[200px]">
                      {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                        <SelectItem key={template} value={template} className="hover:bg-accent focus:bg-accent">
                          <div className="flex flex-col">
                            <span className="font-medium">{t(`systemPrompts.${template}.name`)}</span>
                            <span className="text-xs text-muted-foreground">
                              {t(`systemPrompts.${template}.description`)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t(`systemPrompts.${systemPromptTemplate}.description`)}
                  </p>
                </div>

                {/* Custom System Prompt */}
                {systemPromptTemplate === "custom" && (
                  <div className="space-y-3">
                    <Label htmlFor="customSystemPrompt" className="text-foreground">
                      {t("settings.advanced.systemPrompt.custom")}
                    </Label>
                    <Textarea
                      id="customSystemPrompt"
                      value={customSystemPrompt}
                      onChange={(e) => setCustomSystemPrompt(e.target.value)}
                      placeholder={t("settings.advanced.systemPrompt.customPlaceholder")}
                      rows={4}
                      className="bg-background border-border placeholder:text-muted-foreground text-foreground focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("settings.advanced.systemPrompt.customDescription")}
                    </p>
                  </div>
                )}

                {/* Temperature Control */}
                <div className="space-y-3">
                  <Label htmlFor="temperature" className="text-foreground">
                    {t("settings.advanced.temperature.title")}: {temperature}
                  </Label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("settings.advanced.temperature.conservative")}</span>
                      <span>{t("settings.advanced.temperature.balanced")}</span>
                      <span>{t("settings.advanced.temperature.creative")}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("settings.advanced.temperature.description")}</p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-3">
                  <Label htmlFor="maxTokens" className="text-foreground">
                    {t("settings.advanced.maxTokens.title")}
                  </Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="4000"
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="bg-background border-border text-foreground focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">{t("settings.advanced.maxTokens.description")}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => {
                  ensureApiKeySaved()
                  setSettingsOpen(false)
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {t("settings.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Render Step Content Component
  const renderStepContent = () => {
    // Implementation of renderStepContent function
    return <div>Step Content</div>
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 lg:p-8 flex flex-col items-center text-foreground relative ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* SEO Header Section */}
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-4">
          {t("app.name")}
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">{t("app.tagline")}</p>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-8">
          <span className="bg-muted/50 px-3 py-1 rounded-full">{t("common.tags.aiScript")}</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">{t("common.tags.voiceSynthesis")}</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">{t("common.tags.multiLanguage")}</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">{t("common.tags.privacy")}</span>
        </div>
      </header>

      <Card className="w-full max-w-4xl bg-card/70 backdrop-blur-sm border-border text-foreground shadow-2xl">
        <CardHeader>
          <div className="flex justify-center items-center flex-1">
            <Mic className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            {t("app.name")}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t(
              `navigation.steps.${currentStep === 1 ? "input" : currentStep === 2 ? "structure" : currentStep === 3 ? "review" : "audio"}`,
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("common.error")}</AlertTitle>
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
        className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105`}
        size="icon"
        aria-label="Open Settings"
      >
        <Settings className="w-6 h-6" />
      </Button>

      {/* Settings Modal */}
      <SettingsModal />

      <footer className="mt-8 text-center text-muted-foreground text-sm max-w-4xl">
        <p className="mb-2">
          <strong>{t("app.name")}</strong> - {t("app.poweredBy")}
        </p>
        <p className="text-xs">{t("app.privacyNote")}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
          <span>✨ {t("common.tags.aiScript")}</span>
          <span>🎙️ {t("common.tags.voiceSynthesis")}</span>
          <span>🌍 {t("common.tags.multiLanguage")}</span>
          <span>🔒 {t("common.tags.privacy")}</span>
        </div>
      </footer>
    </div>
  )
}
