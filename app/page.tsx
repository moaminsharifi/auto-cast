"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "@/hooks/useTranslations"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mic, AlertCircle, Settings, Languages } from "lucide-react"

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
  const { t, locale, switchLanguage } = useTranslations()
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
  const [isPlaying, setIsPlaying] = useState(false)

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

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Get the current endpoint URL
  const getEndpointUrl = () => {
    if (selectedEndpoint.id === "custom") {
      return customEndpointUrl.trim()
    }
    return selectedEndpoint.url
  }

  // Reset all state
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
    setIsPlaying(false)
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

          {/* Placeholder content - in a real implementation, this would contain the step-specific UI */}
          <div className="p-8 text-center space-y-4">
            <div className="text-lg font-medium">{t("navigation.step", { step: currentStep.toString() })}</div>
            <div className="text-muted-foreground">
              {t(
                `navigation.steps.${currentStep === 1 ? "input" : currentStep === 2 ? "structure" : currentStep === 3 ? "review" : "audio"}`,
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              This is a placeholder for the main functionality. The complete implementation would include all the
              step-specific UI components here.
            </p>
          </div>
        </CardContent>
      </Card>

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
