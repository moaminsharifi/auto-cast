"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useTheme } from "@/components/theme-provider"
import {
  Loader2,
  Mic,
  AlertCircle,
  Wand2,
  Volume2,
  Download,
  KeyRound,
  Edit3,
  Trash2,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Settings,
  Monitor,
  Sun,
  Moon,
  X,
  Files,
  FileText,
  Zap,
  Globe,
  Shield,
  Clock,
} from "lucide-react"
import { VoiceSamplePlayer } from "@/components/voice-sample-player"

const SCRIPT_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano"]
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

export default function PodcastGeneratorPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // API Key State
  const [apiKey, setApiKey] = useState("")
  const [saveApiKey, setSaveApiKey] = useState(false)
  const [isApiKeyFromStorage, setIsApiKeyFromStorage] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(true)

  // Step 1 State
  const [textInput, setTextInput] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [shouldSummarize, setShouldSummarize] = useState(false)
  const [scriptModel, setScriptModel] = useState(SCRIPT_MODELS[0])
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

        const summarizeResponse = await fetch("/api/generate-podcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: "summarizeContent",
            apiKey,
            textInput,
            scriptModel,
            language,
            temperature,
            maxTokens,
          }),
        })

        const summarizeData = await summarizeResponse.json()
        if (!summarizeResponse.ok) {
          throw new Error(summarizeData.error || "Content summarization failed")
        }

        finalTextInput = summarizeData.summary
        setTextInput(finalTextInput) // Update the text input with summarized content
      }

      setCurrentTask("Generating initial script...")

      // Get the system prompt
      const selectedTemplate = SYSTEM_PROMPT_TEMPLATES.find((t) => t.id === systemPromptTemplate)
      const systemPrompt = systemPromptTemplate === "custom" ? customSystemPrompt : selectedTemplate?.prompt || ""

      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "generateScript",
          apiKey,
          textInput: finalTextInput,
          scriptModel,
          language,
          selectedFrameworkPoints,
          frameworkDetails,
          additionalStructurePrompt,
          systemPrompt,
          temperature,
          maxTokens,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid OpenAI API Key. Please check your key in settings.")
          handleClearAndEditApiKey()
          setSettingsOpen(true)
        } else {
          throw new Error(data.error || "Script generation failed")
        }
        return
      }
      setPodcastScript(data.script)
      nextStep() // Move to Step 3 (Review)
    } catch (err: any) {
      setError(err.message)
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

      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "refineScript",
          apiKey,
          existingScript: podcastScript,
          refinementPrompt,
          scriptModel,
          language,
          systemPrompt,
          temperature,
          maxTokens,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Script refinement failed")
      setPodcastScript(data.script)
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
      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "generateAudio",
          apiKey,
          script: podcastScript,
          ttsModel: ttsModel,
          ttsVoice: ttsVoice,
        }),
      })
      clearInterval(progressInterval)
      setAudioGenerationProgress(100)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Audio generation failed")
      setAudioDataUrl(data.audioDataUrl)
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
              Settings
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure your preferences, API key, and script generation model.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Theme Section */}
            <div className="space-y-3">
              <Label className="text-foreground flex items-center">
                <Monitor className="w-4 h-4 mr-2 text-primary" /> Theme Preference
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
                  Light
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
                  Dark
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
                  Auto
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose your preferred theme. Auto follows your system preference.
              </p>
            </div>

            {/* API Key Section */}
            <div className="space-y-3">
              <Label htmlFor="settingsApiKey" className="text-foreground flex items-center">
                <KeyRound className="w-4 h-4 mr-2 text-primary" /> OpenAI API Key
              </Label>
              {showApiKeyInput || !isApiKeyFromStorage ? (
                <>
                  <Input
                    id="settingsApiKey"
                    type="password"
                    value={apiKey}
                    onChange={handleApiKeyInputChange}
                    placeholder="Enter your OpenAI API Key"
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
                      Save API Key in browser
                    </Label>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-muted/50 rounded-md border border-border space-y-2">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    API Key is saved and loaded from browser storage.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKeyInput(true)}
                      className="text-primary border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <Edit3 className="w-3 h-3 mr-1.5" /> Edit Key
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleClearAndEditApiKey}
                      className="text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3 mr-1.5" /> Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Script Model Section */}
            <div className="space-y-3">
              <Label htmlFor="settingsScriptModel" className="text-foreground">
                Script Generation Model
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
              <p className="text-xs text-muted-foreground">
                Choose the OpenAI model for generating podcast scripts. More advanced models may produce better results.
              </p>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-primary" /> Advanced Options
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-primary hover:bg-primary/10"
                >
                  {showAdvancedSettings ? "Hide" : "Show"}
                  <ChevronRight
                    className={`w-4 h-4 ml-1 transition-transform ${showAdvancedSettings ? "rotate-90" : ""}`}
                  />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Configure advanced AI parameters and system prompts for fine-tuned control.
              </p>
            </div>

            {/* Advanced Settings Content */}
            {showAdvancedSettings && (
              <div className="space-y-6 p-4 bg-muted/30 rounded-lg border border-border">
                {/* System Prompt Template */}
                <div className="space-y-3">
                  <Label htmlFor="systemPromptTemplate" className="text-foreground">
                    System Prompt Template
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
                        <SelectItem key={template.id} value={template.id} className="hover:bg-accent focus:bg-accent">
                          <div className="flex flex-col">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-xs text-muted-foreground">{template.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {SYSTEM_PROMPT_TEMPLATES.find((t) => t.id === systemPromptTemplate)?.description}
                  </p>
                </div>

                {/* Custom System Prompt */}
                {systemPromptTemplate === "custom" && (
                  <div className="space-y-3">
                    <Label htmlFor="customSystemPrompt" className="text-foreground">
                      Custom System Prompt
                    </Label>
                    <Textarea
                      id="customSystemPrompt"
                      value={customSystemPrompt}
                      onChange={(e) => setCustomSystemPrompt(e.target.value)}
                      placeholder="Enter your custom system prompt here..."
                      rows={4}
                      className="bg-background border-border placeholder:text-muted-foreground text-foreground focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Define how the AI should behave and what style it should use for generating podcast scripts.
                    </p>
                  </div>
                )}

                {/* Temperature Control */}
                <div className="space-y-3">
                  <Label htmlFor="temperature" className="text-foreground">
                    Temperature: {temperature}
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
                      <span>Conservative (0)</span>
                      <span>Balanced (1)</span>
                      <span>Creative (2)</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Controls randomness: lower values for more focused output, higher values for more creative output.
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-3">
                  <Label htmlFor="maxTokens" className="text-foreground">
                    Max Tokens
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
                  <p className="text-xs text-muted-foreground">
                    Maximum number of tokens for script generation (100-4000). Higher values allow longer scripts.
                  </p>
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
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
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
                    <VoiceSamplePlayer voice={ttsVoice} apiKey={apiKey} />
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
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-4">
          AutoCast
        </h1>
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
            <Mic className="w-10 h-10 text-primary" />
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
      <SettingsModal />

      <footer className="mt-8 text-center text-muted-foreground text-sm max-w-4xl">
        <p className="mb-2">
          <strong>AutoCast</strong> - Powered by Vercel AI and OpenAI. Transform any text into engaging podcasts.
        </p>
        <p className="text-xs">
          Your API keys and content are stored locally in your browser. We prioritize your privacy and data security.
        </p>
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
