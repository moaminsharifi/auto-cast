"use client"

import type React from "react"

import { useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, AlertCircle, Sun, Moon, Monitor } from "lucide-react"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: string
  onApiKeyChange: (apiKey: string) => void
  saveApiKey: boolean
  onSaveApiKeyChange: (saveApiKey: boolean) => void
  isApiKeyFromStorage: boolean
  showApiKeyInput: boolean
  onShowApiKeyInputChange: (showApiKeyInput: boolean) => void
  onClearAndEditApiKey: () => void
  selectedEndpoint: any // TODO: Type this properly
  onEndpointChange: (endpointId: string) => void
  customEndpointUrl: string
  onCustomEndpointChange: (url: string) => void
  onSaveCustomEndpoint: () => void
  onTestEndpointConnection: (endpoint: any) => void
  isTestingEndpoint: boolean
  endpointStatus: "untested" | "success" | "error"
  endpointStatusMessage: string
  scriptModel: string
  onScriptModelChange: (model: string) => void
  showAdvancedSettings: boolean
  onShowAdvancedSettingsChange: (showAdvancedSettings: boolean) => void
  temperature: number
  onTemperatureChange: (temperature: number) => void
  maxTokens: number
  onMaxTokensChange: (maxTokens: number) => void
  systemPromptTemplate: string
  onSystemPromptTemplateChange: (template: string) => void
  customSystemPrompt: string
  onCustomSystemPromptChange: (prompt: string) => void
  onSaveSettings: () => void
  pendingTheme: string
  onThemeChange: (theme: string) => void
}

export function SettingsModal({
  open,
  onOpenChange,
  apiKey,
  onApiKeyChange,
  saveApiKey,
  onSaveApiKeyChange,
  isApiKeyFromStorage,
  showApiKeyInput,
  onShowApiKeyInputChange,
  onClearAndEditApiKey,
  selectedEndpoint,
  onEndpointChange,
  customEndpointUrl,
  onCustomEndpointChange,
  onSaveCustomEndpoint,
  onTestEndpointConnection,
  isTestingEndpoint,
  endpointStatus,
  endpointStatusMessage,
  scriptModel,
  onScriptModelChange,
  showAdvancedSettings,
  onShowAdvancedSettingsChange,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  systemPromptTemplate,
  onSystemPromptTemplateChange,
  customSystemPrompt,
  onCustomSystemPromptChange,
  onSaveSettings,
  pendingTheme,
  onThemeChange,
}: SettingsModalProps) {
  const handleApiKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onApiKeyChange(e.target.value)
    },
    [onApiKeyChange],
  )

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      case "system":
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      case "system":
        return "System"
      default:
        return "System"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure AutoCast settings and preferences.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label htmlFor="theme" className="text-sm font-medium">
              Theme
            </Label>
            <Select value={pendingTheme || "system"} onValueChange={onThemeChange}>
              <SelectTrigger id="theme" className="bg-background border-border text-foreground focus:border-primary">
                {/* Removed getThemeIcon here, SelectValue will render the icon from the selected item */}
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border text-foreground">
                <SelectItem value="light" className="hover:bg-accent focus:bg-accent">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark" className="hover:bg-accent focus:bg-accent">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system" className="hover:bg-accent focus:bg-accent">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred theme. System will match your device's theme.
            </p>
          </div>

          {/* API Key Section */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              OpenAI API Key
            </Label>
            {showApiKeyInput ? (
              <div className="space-y-2">
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  type="password"
                  placeholder="sk-..."
                  className="bg-background border-border text-foreground focus:border-primary"
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveApiKey"
                    checked={saveApiKey}
                    onCheckedChange={onSaveApiKeyChange}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor="saveApiKey" className="text-sm text-muted-foreground">
                    Save API key locally in browser
                  </Label>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-foreground">API Key Stored</span>
                </div>
                <Button variant="outline" size="sm" onClick={onClearAndEditApiKey}>
                  Edit
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          {/* API Endpoint Section */}
          <div className="space-y-2">
            <Label htmlFor="endpoint" className="text-sm font-medium">
              API Endpoint
            </Label>
            <Select value={selectedEndpoint.id} onValueChange={onEndpointChange}>
              <SelectTrigger id="endpoint" className="bg-background border-border text-foreground focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border text-foreground">
                <SelectItem value="openai" className="hover:bg-accent focus:bg-accent">
                  OpenAI (Default)
                </SelectItem>
                <SelectItem value="avalai" className="hover:bg-accent focus:bg-accent">
                  AvalAI
                </SelectItem>
                <SelectItem value="openrouter" className="hover:bg-accent focus:bg-accent">
                  OpenRouter
                </SelectItem>
                <SelectItem value="aws" className="hover:bg-accent focus:bg-accent">
                  AWS Bedrock
                </SelectItem>
                <SelectItem value="azure" className="hover:bg-accent focus:bg-accent">
                  Azure OpenAI
                </SelectItem>
                <SelectItem value="custom" className="hover:bg-accent focus:bg-accent">
                  Custom Endpoint
                </SelectItem>
              </SelectContent>
            </Select>
            {selectedEndpoint.id === "custom" && (
              <div className="mt-3 space-y-3">
                <Input
                  type="url"
                  placeholder="https://your-custom-endpoint.com/v1"
                  value={customEndpointUrl}
                  onChange={(e) => onCustomEndpointChange(e.target.value)}
                  className="bg-background border-border text-foreground focus:border-primary"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={onSaveCustomEndpoint} disabled={isTestingEndpoint}>
                    Save URL
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onTestEndpointConnection(selectedEndpoint)}
                    disabled={isTestingEndpoint}
                  >
                    {isTestingEndpoint ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                </div>
                {endpointStatus !== "untested" && (
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-md text-sm ${
                      endpointStatus === "success"
                        ? "bg-green-500/10 text-green-500 border border-green-200 dark:border-green-800"
                        : "bg-red-500/10 text-red-500 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    {endpointStatus === "success" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{endpointStatusMessage}</span>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Choose your preferred AI service provider or use a custom endpoint.
            </p>
          </div>

          {/* Script Model Section */}
          <div className="space-y-2">
            <Label htmlFor="scriptModel" className="text-sm font-medium">
              Script Generation Model
            </Label>
            <Select value={scriptModel} onValueChange={onScriptModelChange}>
              <SelectTrigger
                id="scriptModel"
                className="bg-background border-border text-foreground focus:border-primary"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border text-foreground">
                <SelectItem value="gpt-4o-mini" className="hover:bg-accent focus:bg-accent">
                  <div className="flex flex-col items-start">
                    <span>GPT-4o Mini</span>
                    <span className="text-xs text-muted-foreground">Fast and cost-effective</span>
                  </div>
                </SelectItem>
                <SelectItem value="gpt-3.5-turbo" className="hover:bg-accent focus:bg-accent">
                  <div className="flex flex-col items-start">
                    <span>GPT-3.5 Turbo</span>
                    <span className="text-xs text-muted-foreground">Balanced performance</span>
                  </div>
                </SelectItem>
                <SelectItem value="gpt-4o" className="hover:bg-accent focus:bg-accent">
                  <div className="flex flex-col items-start">
                    <span>GPT-4o</span>
                    <span className="text-xs text-muted-foreground">High quality output</span>
                  </div>
                </SelectItem>
                <SelectItem value="gpt-4-turbo-preview" className="hover:bg-accent focus:bg-accent">
                  <div className="flex flex-col items-start">
                    <span>GPT-4 Turbo Preview</span>
                    <span className="text-xs text-muted-foreground">Latest capabilities</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the AI model for generating podcast scripts. Higher-tier models provide better quality but cost
              more.
            </p>
          </div>

          {/* Advanced Settings Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="advancedSettings" className="text-sm font-medium">
                Advanced Settings
              </Label>
              <Checkbox
                id="advancedSettings"
                checked={showAdvancedSettings}
                onCheckedChange={onShowAdvancedSettingsChange}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </div>
            {showAdvancedSettings && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-sm font-medium">
                    Temperature ({temperature})
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={temperature}
                    onChange={(e) => onTemperatureChange(Number.parseFloat(e.target.value))}
                    className="bg-background border-border text-foreground focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness. Lower values (0.1-0.3) for focused content, higher (0.7-0.9) for creative
                    content.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens" className="text-sm font-medium">
                    Max Tokens
                  </Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={maxTokens}
                    onChange={(e) => onMaxTokensChange(Number.parseInt(e.target.value))}
                    className="bg-background border-border text-foreground focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum length of generated content. Higher values allow longer scripts but cost more.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemPromptTemplate" className="text-sm font-medium">
                    System Prompt Template
                  </Label>
                  <Select value={systemPromptTemplate} onValueChange={onSystemPromptTemplateChange}>
                    <SelectTrigger
                      id="systemPromptTemplate"
                      className="bg-background border-border text-foreground focus:border-primary"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                      <SelectItem value="default" className="hover:bg-accent focus:bg-accent">
                        <div className="flex flex-col items-start">
                          <span>Default</span>
                          <span className="text-xs text-muted-foreground">Balanced approach</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="educational" className="hover:bg-accent focus:bg-accent">
                        <div className="flex flex-col items-start">
                          <span>Educational</span>
                          <span className="text-xs text-muted-foreground">Clear explanations</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="storytelling" className="hover:bg-accent focus:bg-accent">
                        <div className="flex flex-col items-start">
                          <span>Storytelling</span>
                          <span className="text-xs text-muted-foreground">Narrative-driven</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="conversational" className="hover:bg-accent focus:bg-accent">
                        <div className="flex flex-col items-start">
                          <span>Conversational</span>
                          <span className="text-xs text-muted-foreground">Casual and friendly</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="professional" className="hover:bg-accent focus:bg-accent">
                        <div className="flex flex-col items-start">
                          <span>Professional</span>
                          <span className="text-xs text-muted-foreground">Business-focused</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom" className="hover:bg-accent focus:bg-accent">
                        <div className="flex flex-col items-start">
                          <span>Custom</span>
                          <span className="text-xs text-muted-foreground">Define your own</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the style and approach for your podcast scripts.
                  </p>
                </div>
                {systemPromptTemplate === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="customSystemPrompt" className="text-sm font-medium">
                      Custom System Prompt
                    </Label>
                    <Textarea
                      id="customSystemPrompt"
                      value={customSystemPrompt}
                      onChange={(e) => onCustomSystemPromptChange(e.target.value)}
                      placeholder="You are a helpful assistant that creates engaging podcast scripts..."
                      rows={4}
                      className="bg-background border-border text-foreground focus:border-primary resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Define how the AI should behave when generating your podcast scripts.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">Settings are saved automatically</div>
          <Button type="submit" onClick={onSaveSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
