"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"
import { SettingsModal } from "@/components/settings-modal"
import { VoiceSamplePlayer } from "@/components/voice-sample-player"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import {
  Upload,
  FileText,
  Mic,
  Play,
  Pause,
  Download,
  Settings,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Clock,
  Users,
  Zap,
  Globe,
  CheckCircle,
  Loader2,
} from "lucide-react"

// Types
interface PodcastSettings {
  duration: string
  hosts: string
  style: string
  includeIntro: boolean
  includeOutro: boolean
  includeMusic: boolean
}

interface VoiceSettings {
  primaryVoice: string
  secondaryVoice: string
  speed: number
  pitch: number
}

interface ApiEndpoint {
  id: string
  name: string
  url: string
}

const API_ENDPOINTS: ApiEndpoint[] = [
  { id: "openai", name: "OpenAI (Default)", url: "https://api.openai.com/v1" },
  { id: "avalai", name: "AvalAI", url: "https://api.avalai.com/v1" },
  { id: "openrouter", name: "OpenRouter", url: "https://openrouter.ai/api/v1" },
  { id: "aws", name: "AWS Bedrock", url: "https://bedrock-runtime.amazonaws.com" },
  { id: "azure", name: "Azure OpenAI", url: "https://your-resource.openai.azure.com" },
  { id: "custom", name: "Custom Endpoint", url: "" },
]

const SYSTEM_PROMPT_TEMPLATES = {
  default:
    "You are a professional podcast script writer. Create engaging, conversational content that flows naturally when spoken aloud.",
  educational:
    "You are an educational content creator. Focus on clear explanations, structured learning, and engaging educational content for podcasts.",
  storytelling:
    "You are a master storyteller. Create compelling narratives with engaging characters, plot development, and immersive storytelling for podcasts.",
  conversational:
    "You are a casual conversation facilitator. Create friendly, relatable content that feels like a natural conversation between friends.",
  professional:
    "You are a business communication expert. Create professional, informative content suitable for corporate or industry-focused podcasts.",
}

export default function PodcastGenerator() {
  // Content state
  const [textContent, setTextContent] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [currentStep, setCurrentStep] = useState(1)

  // Podcast configuration
  const [podcastSettings, setPodcastSettings] = useState<PodcastSettings>({
    duration: "10-15",
    hosts: "single",
    style: "conversational",
    includeIntro: true,
    includeOutro: true,
    includeMusic: false,
  })

  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    primaryVoice: "alloy",
    secondaryVoice: "echo",
    speed: 1.0,
    pitch: 1.0,
  })

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedScript, setGeneratedScript] = useState("")
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [saveApiKey, setSaveApiKey] = useState(false)
  const [isApiKeyFromStorage, setIsApiKeyFromStorage] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(true)
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0])
  const [customEndpointUrl, setCustomEndpointUrl] = useState("")
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false)
  const [endpointStatus, setEndpointStatus] = useState<"untested" | "success" | "error">("untested")
  const [endpointStatusMessage, setEndpointStatusMessage] = useState("")
  const [scriptModel, setScriptModel] = useState("gpt-4o-mini")
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [systemPromptTemplate, setSystemPromptTemplate] = useState("default")
  const [customSystemPrompt, setCustomSystemPrompt] = useState("")

  // Theme state
  const { theme, setTheme } = useTheme()
  const [pendingTheme, setPendingTheme] = useState<string>("")

  // Audio player ref
  const audioRef = useRef<HTMLAudioElement>(null)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load API key
        const storedApiKey = localStorage.getItem("autocast-api-key")
        if (storedApiKey) {
          setApiKey(storedApiKey)
          setIsApiKeyFromStorage(true)
          setShowApiKeyInput(false)
        }

        // Load endpoint settings
        const storedEndpoint = localStorage.getItem("autocast-endpoint")
        if (storedEndpoint) {
          const endpoint = JSON.parse(storedEndpoint)
          setSelectedEndpoint(endpoint)
        }

        const storedCustomUrl = localStorage.getItem("autocast-custom-endpoint-url")
        if (storedCustomUrl) {
          setCustomEndpointUrl(storedCustomUrl)
        }

        // Load model settings
        const storedModel = localStorage.getItem("autocast-script-model")
        if (storedModel) {
          setScriptModel(storedModel)
        }

        // Load advanced settings
        const storedAdvanced = localStorage.getItem("autocast-advanced-settings")
        if (storedAdvanced) {
          const advanced = JSON.parse(storedAdvanced)
          setShowAdvancedSettings(advanced.show || false)
          setTemperature(advanced.temperature || 0.7)
          setMaxTokens(advanced.maxTokens || 2000)
          setSystemPromptTemplate(advanced.systemPromptTemplate || "default")
          setCustomSystemPrompt(advanced.customSystemPrompt || "")
        }

        // Load theme preference
        const storedTheme = localStorage.getItem("autocast-theme")
        if (storedTheme) {
          setPendingTheme(storedTheme)
        } else {
          setPendingTheme(theme || "system")
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [theme])

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setTextContent(content)
      toast({
        title: "File uploaded successfully",
        description: `Loaded ${file.name}`,
      })
    }
    reader.readAsText(file)
  }, [])

  // Settings handlers
  const handleEndpointChange = useCallback((endpointId: string) => {
    const endpoint = API_ENDPOINTS.find((ep) => ep.id === endpointId) || API_ENDPOINTS[0]
    setSelectedEndpoint(endpoint)
    setEndpointStatus("untested")
    setEndpointStatusMessage("")
  }, [])

  const handleSaveCustomEndpoint = useCallback(() => {
    if (customEndpointUrl) {
      const customEndpoint = { ...selectedEndpoint, url: customEndpointUrl }
      setSelectedEndpoint(customEndpoint)
      localStorage.setItem("autocast-custom-endpoint-url", customEndpointUrl)
      toast({
        title: "Custom endpoint saved",
        description: "Your custom endpoint URL has been saved.",
      })
    }
  }, [customEndpointUrl, selectedEndpoint])

  const handleTestEndpointConnection = useCallback(
    async (endpoint: ApiEndpoint) => {
      setIsTestingEndpoint(true)
      setEndpointStatus("untested")

      try {
        const response = await fetch("/api/test-endpoint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: endpoint.url || customEndpointUrl,
            apiKey,
          }),
        })

        const result = await response.json()

        if (result.success) {
          setEndpointStatus("success")
          setEndpointStatusMessage("Connection successful!")
        } else {
          setEndpointStatus("error")
          setEndpointStatusMessage(result.error || "Connection failed")
        }
      } catch (error) {
        setEndpointStatus("error")
        setEndpointStatusMessage("Network error occurred")
      } finally {
        setIsTestingEndpoint(false)
      }
    },
    [apiKey, customEndpointUrl],
  )

  const handleClearAndEditApiKey = useCallback(() => {
    setApiKey("")
    setIsApiKeyFromStorage(false)
    setShowApiKeyInput(true)
    localStorage.removeItem("autocast-api-key")
  }, [])

  const handleSaveSettings = useCallback(() => {
    try {
      // Save API key if requested
      if (saveApiKey && apiKey) {
        localStorage.setItem("autocast-api-key", apiKey)
        setIsApiKeyFromStorage(true)
        setShowApiKeyInput(false)
      } else if (!saveApiKey) {
        localStorage.removeItem("autocast-api-key")
        setIsApiKeyFromStorage(false)
      }

      // Save endpoint settings
      localStorage.setItem("autocast-endpoint", JSON.stringify(selectedEndpoint))

      if (selectedEndpoint.id === "custom" && customEndpointUrl) {
        localStorage.setItem("autocast-custom-endpoint-url", customEndpointUrl)
      }

      // Save model settings
      localStorage.setItem("autocast-script-model", scriptModel)

      // Save advanced settings
      const advancedSettings = {
        show: showAdvancedSettings,
        temperature,
        maxTokens,
        systemPromptTemplate,
        customSystemPrompt,
      }
      localStorage.setItem("autocast-advanced-settings", JSON.stringify(advancedSettings))

      // Apply and save theme
      if (pendingTheme && pendingTheme !== theme) {
        setTheme(pendingTheme)
        localStorage.setItem("autocast-theme", pendingTheme)
      }

      setIsSettingsOpen(false)
      toast({
        title: "Settings saved",
        description: "Your preferences have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your preferences.",
        variant: "destructive",
      })
    }
  }, [
    saveApiKey,
    apiKey,
    selectedEndpoint,
    customEndpointUrl,
    scriptModel,
    showAdvancedSettings,
    temperature,
    maxTokens,
    systemPromptTemplate,
    customSystemPrompt,
    pendingTheme,
    theme,
    setTheme,
  ])

  // Theme change handler for settings modal
  const handleThemeChange = useCallback((newTheme: string) => {
    setPendingTheme(newTheme)
  }, [])

  // Generate podcast handler
  const handleGeneratePodcast = useCallback(async () => {
    if (!textContent.trim()) {
      toast({
        title: "No content provided",
        description: "Please enter some text content to generate a podcast.",
        variant: "destructive",
      })
      return
    }

    if (!apiKey) {
      toast({
        title: "API key required",
        description: "Please configure your OpenAI API key in settings.",
        variant: "destructive",
      })
      setIsSettingsOpen(true)
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      const systemPrompt =
        systemPromptTemplate === "custom"
          ? customSystemPrompt
          : SYSTEM_PROMPT_TEMPLATES[systemPromptTemplate as keyof typeof SYSTEM_PROMPT_TEMPLATES]

      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textContent,
          language: selectedLanguage,
          settings: podcastSettings,
          voiceSettings,
          apiKey,
          endpoint: selectedEndpoint.url || customEndpointUrl,
          model: scriptModel,
          temperature,
          maxTokens,
          systemPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate podcast")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      let script = ""
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === "progress") {
                setGenerationProgress(data.progress)
              } else if (data.type === "script") {
                script += data.content
                setGeneratedScript(script)
              } else if (data.type === "audio") {
                setGeneratedAudio(data.url)
              } else if (data.type === "complete") {
                setGenerationProgress(100)
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      toast({
        title: "Podcast generated successfully",
        description: "Your podcast script and audio are ready!",
      })
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Generation failed",
        description: "There was an error generating your podcast. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [
    textContent,
    selectedLanguage,
    podcastSettings,
    voiceSettings,
    apiKey,
    selectedEndpoint,
    customEndpointUrl,
    scriptModel,
    temperature,
    maxTokens,
    systemPromptTemplate,
    customSystemPrompt,
  ])

  // Audio playback handlers
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !generatedAudio) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, generatedAudio])

  const handleDownloadAudio = useCallback(() => {
    if (!generatedAudio) return

    const link = document.createElement("a")
    link.href = generatedAudio
    link.download = "podcast.mp3"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [generatedAudio])

  // Step navigation
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AutoCast
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">AI-Powered Podcast Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step <= currentStep
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full transition-all ${
                      step < currentStep ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              {currentStep === 1 && "Input Content & Language"}
              {currentStep === 2 && "Configure Podcast Structure"}
              {currentStep === 3 && "Voice & Audio Settings"}
              {currentStep === 4 && "Generate & Download"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {currentStep === 1 && "Add your text content and select the podcast language"}
              {currentStep === 2 && "Set up your podcast format, duration, and style"}
              {currentStep === 3 && "Choose voices and adjust audio settings"}
              {currentStep === 4 && "Generate your podcast and download the results"}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Content Input */}
          {currentStep === 1 && (
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>Content Input</span>
                </CardTitle>
                <CardDescription>
                  Paste your text content or upload a file (.txt, .md) to convert into a podcast
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="paste" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger
                      value="paste"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                    >
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger
                      value="upload"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                    >
                      Upload File
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste" className="space-y-4">
                    <RichTextEditor
                      value={textContent}
                      onChange={setTextContent}
                      placeholder="Paste your article, blog post, or any text content here..."
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                      <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                          Upload your content file
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">Supports .txt and .md files up to 10MB</p>
                        <Input type="file" accept=".txt,.md" onChange={handleFileUpload} className="max-w-xs mx-auto" />
                      </div>
                    </div>
                    {textContent && (
                      <div className="mt-4">
                        <Label>Preview:</Label>
                        <Textarea
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          rows={6}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="language">Podcast Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language" className="bg-white dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fa">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>Persian (فارسی)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {textContent && (
                  <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Content loaded successfully! {textContent.length} characters ready for processing.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Podcast Configuration */}
          {currentStep === 2 && (
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  <span>Podcast Structure</span>
                </CardTitle>
                <CardDescription>Configure how your podcast should be structured and presented</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Target Duration</Label>
                    <Select
                      value={podcastSettings.duration}
                      onValueChange={(value) => setPodcastSettings((prev) => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger id="duration" className="bg-white dark:bg-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-10">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>5-10 minutes</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="10-15">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>10-15 minutes</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="15-20">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>15-20 minutes</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="20-30">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>20-30 minutes</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hosts">Number of Hosts</Label>
                    <Select
                      value={podcastSettings.hosts}
                      onValueChange={(value) => setPodcastSettings((prev) => ({ ...prev, hosts: value }))}
                    >
                      <SelectTrigger id="hosts" className="bg-white dark:bg-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Single Host</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dual">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Two Hosts</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Podcast Style</Label>
                  <Select
                    value={podcastSettings.style}
                    onValueChange={(value) => setPodcastSettings((prev) => ({ ...prev, style: value }))}
                  >
                    <SelectTrigger id="style" className="bg-white dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversational">
                        <div className="flex flex-col items-start">
                          <span>Conversational</span>
                          <span className="text-xs text-slate-500">Casual and friendly discussion</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="educational">
                        <div className="flex flex-col items-start">
                          <span>Educational</span>
                          <span className="text-xs text-slate-500">Structured learning format</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="storytelling">
                        <div className="flex flex-col items-start">
                          <span>Storytelling</span>
                          <span className="text-xs text-slate-500">Narrative-driven presentation</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="interview">
                        <div className="flex flex-col items-start">
                          <span>Interview</span>
                          <span className="text-xs text-slate-500">Q&A format discussion</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Additional Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeIntro"
                        checked={podcastSettings.includeIntro}
                        onChange={(e) => setPodcastSettings((prev) => ({ ...prev, includeIntro: e.target.checked }))}
                        className="rounded border-slate-300 dark:border-slate-600"
                      />
                      <Label htmlFor="includeIntro" className="text-sm">
                        Include Intro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeOutro"
                        checked={podcastSettings.includeOutro}
                        onChange={(e) => setPodcastSettings((prev) => ({ ...prev, includeOutro: e.target.checked }))}
                        className="rounded border-slate-300 dark:border-slate-600"
                      />
                      <Label htmlFor="includeOutro" className="text-sm">
                        Include Outro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeMusic"
                        checked={podcastSettings.includeMusic}
                        onChange={(e) => setPodcastSettings((prev) => ({ ...prev, includeMusic: e.target.checked }))}
                        className="rounded border-slate-300 dark:border-slate-600"
                      />
                      <Label htmlFor="includeMusic" className="text-sm">
                        Background Music
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Voice Settings */}
          {currentStep === 3 && (
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  <span>Voice & Audio Settings</span>
                </CardTitle>
                <CardDescription>Choose voices for your hosts and adjust audio parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryVoice">Primary Voice</Label>
                      <Select
                        value={voiceSettings.primaryVoice}
                        onValueChange={(value) => setVoiceSettings((prev) => ({ ...prev, primaryVoice: value }))}
                      >
                        <SelectTrigger id="primaryVoice" className="bg-white dark:bg-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                          <SelectItem value="echo">Echo (Male)</SelectItem>
                          <SelectItem value="fable">Fable (British Male)</SelectItem>
                          <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                          <SelectItem value="nova">Nova (Female)</SelectItem>
                          <SelectItem value="shimmer">Shimmer (Soft Female)</SelectItem>
                        </SelectContent>
                      </Select>
                      <VoiceSamplePlayer voice={voiceSettings.primaryVoice} />
                    </div>

                    {podcastSettings.hosts === "dual" && (
                      <div className="space-y-2">
                        <Label htmlFor="secondaryVoice">Secondary Voice</Label>
                        <Select
                          value={voiceSettings.secondaryVoice}
                          onValueChange={(value) => setVoiceSettings((prev) => ({ ...prev, secondaryVoice: value }))}
                        >
                          <SelectTrigger id="secondaryVoice" className="bg-white dark:bg-slate-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                            <SelectItem value="echo">Echo (Male)</SelectItem>
                            <SelectItem value="fable">Fable (British Male)</SelectItem>
                            <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                            <SelectItem value="nova">Nova (Female)</SelectItem>
                            <SelectItem value="shimmer">Shimmer (Soft Female)</SelectItem>
                          </SelectContent>
                        </Select>
                        <VoiceSamplePlayer voice={voiceSettings.secondaryVoice} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="speed">Speech Speed: {voiceSettings.speed}x</Label>
                      <input
                        type="range"
                        id="speed"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={voiceSettings.speed}
                        onChange={(e) =>
                          setVoiceSettings((prev) => ({ ...prev, speed: Number.parseFloat(e.target.value) }))
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>0.5x (Slow)</span>
                        <span>1.0x (Normal)</span>
                        <span>2.0x (Fast)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pitch">Pitch Adjustment: {voiceSettings.pitch}x</Label>
                      <input
                        type="range"
                        id="pitch"
                        min="0.8"
                        max="1.2"
                        step="0.1"
                        value={voiceSettings.pitch}
                        onChange={(e) =>
                          setVoiceSettings((prev) => ({ ...prev, pitch: Number.parseFloat(e.target.value) }))
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>0.8x (Lower)</span>
                        <span>1.0x (Normal)</span>
                        <span>1.2x (Higher)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Generation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-900/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span>Generate Podcast</span>
                  </CardTitle>
                  <CardDescription>Review your settings and generate your AI-powered podcast</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Settings Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Content</h4>
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p>Language: {selectedLanguage === "en" ? "English" : "Persian"}</p>
                        <p>Length: {textContent.length} characters</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Structure</h4>
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p>Duration: {podcastSettings.duration} min</p>
                        <p>Hosts: {podcastSettings.hosts === "single" ? "Single" : "Two"}</p>
                        <p>Style: {podcastSettings.style}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Voice</h4>
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p>Primary: {voiceSettings.primaryVoice}</p>
                        {podcastSettings.hosts === "dual" && <p>Secondary: {voiceSettings.secondaryVoice}</p>}
                        <p>Speed: {voiceSettings.speed}x</p>
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="text-center">
                    <Button
                      onClick={handleGeneratePodcast}
                      disabled={isGenerating || !textContent.trim()}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Generate Podcast
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Progress */}
                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Generating your podcast...</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generated Content */}
              {(generatedScript || generatedAudio) && (
                <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-900/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Generated Podcast</span>
                    </CardTitle>
                    <CardDescription>Your podcast has been generated successfully</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {generatedScript && (
                      <div>
                        <Label className="text-base font-medium mb-3 block">Script</Label>
                        <Textarea
                          value={generatedScript}
                          readOnly
                          rows={10}
                          className="bg-slate-50 dark:bg-slate-800/50"
                        />
                      </div>
                    )}

                    {generatedAudio && (
                      <div>
                        <Label className="text-base font-medium mb-3 block">Audio</Label>
                        <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <Button
                            onClick={handlePlayPause}
                            variant="outline"
                            size="sm"
                            className="bg-white dark:bg-slate-700"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <div className="flex-1">
                            <audio
                              ref={audioRef}
                              src={generatedAudio}
                              onEnded={() => setIsPlaying(false)}
                              className="w-full"
                              controls
                            />
                          </div>
                          <Button
                            onClick={handleDownloadAudio}
                            variant="outline"
                            size="sm"
                            className="bg-white dark:bg-slate-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="bg-white/50 dark:bg-slate-800/50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={nextStep}
              disabled={currentStep === 4 || (currentStep === 1 && !textContent.trim())}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AutoCast
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Transform your text content into engaging podcast scripts with AI-powered generation and natural voice
                synthesis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Related Tools</h3>
              <div className="space-y-2">
                <a
                  href="https://subtitile-flow.moaminsharifi.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Subtitle Flow - Privacy-focused subtitle editor
                </a>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Browser-based tool for SRT/VTT files with AI transcription
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Developer</h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  Created by{" "}
                  <a
                    href="https://moaminsharifi.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Amin Sharifi
                  </a>
                </p>
                <a
                  href="https://github.com/moaminsharifi/auto-cast"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; 2024 AutoCast. Open source project by Amin Sharifi.</p>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        saveApiKey={saveApiKey}
        onSaveApiKeyChange={setSaveApiKey}
        isApiKeyFromStorage={isApiKeyFromStorage}
        showApiKeyInput={showApiKeyInput}
        onShowApiKeyInputChange={setShowApiKeyInput}
        onClearAndEditApiKey={handleClearAndEditApiKey}
        selectedEndpoint={selectedEndpoint}
        onEndpointChange={handleEndpointChange}
        customEndpointUrl={customEndpointUrl}
        onCustomEndpointChange={setCustomEndpointUrl}
        onSaveCustomEndpoint={handleSaveCustomEndpoint}
        onTestEndpointConnection={handleTestEndpointConnection}
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
        onSaveSettings={handleSaveSettings}
        pendingTheme={pendingTheme}
        onThemeChange={handleThemeChange}
      />
    </div>
  )
}
