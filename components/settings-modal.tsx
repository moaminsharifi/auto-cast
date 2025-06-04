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
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

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
}: SettingsModalProps) {
  const handleApiKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onApiKeyChange(e.target.value)
    },
    [onApiKeyChange],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure AutoCast settings.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            {showApiKeyInput ? (
              <div className="flex items-center space-x-2">
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  type="password"
                  className="bg-background border-border text-foreground focus:border-primary"
                />
                <Checkbox
                  id="saveApiKey"
                  checked={saveApiKey}
                  onCheckedChange={onSaveApiKeyChange}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <Label htmlFor="saveApiKey" className="text-sm text-muted-foreground">
                  Save
                </Label>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">API Key Stored</p>
                <Button variant="outline" size="sm" onClick={onClearAndEditApiKey}>
                  Edit
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="endpoint">API Endpoint</Label>
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
              <div className="mt-2 space-y-2">
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
                        ? "bg-green-500/10 text-green-500 border border-green-200"
                        : "bg-red-500/10 text-red-500 border border-red-200"
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
          </div>

          <div>
            <Label htmlFor="scriptModel">Script Model</Label>
            <Select value={scriptModel} onValueChange={onScriptModelChange}>
              <SelectTrigger
                id="scriptModel"
                className="bg-background border-border text-foreground focus:border-primary"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border text-foreground">
                <SelectItem value="gpt-4o-mini" className="hover:bg-accent focus:bg-accent">
                  GPT-4o Mini
                </SelectItem>
                <SelectItem value="gpt-3.5-turbo" className="hover:bg-accent focus:bg-accent">
                  GPT-3.5 Turbo
                </SelectItem>
                <SelectItem value="gpt-4o" className="hover:bg-accent focus:bg-accent">
                  GPT-4o
                </SelectItem>
                <SelectItem value="gpt-4-turbo-preview" className="hover:bg-accent focus:bg-accent">
                  GPT-4 Turbo Preview
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="advancedSettings">Advanced Settings</Label>
              <Checkbox
                id="advancedSettings"
                checked={showAdvancedSettings}
                onCheckedChange={onShowAdvancedSettingsChange}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </div>
            {showAdvancedSettings && (
              <div className="mt-2 space-y-2">
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
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
                </div>
                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={maxTokens}
                    onChange={(e) => onMaxTokensChange(Number.parseInt(e.target.value))}
                    className="bg-background border-border text-foreground focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="systemPromptTemplate">System Prompt Template</Label>
                  <Select value={systemPromptTemplate} onValueChange={onSystemPromptTemplateChange}>
                    <SelectTrigger
                      id="systemPromptTemplate"
                      className="bg-background border-border text-foreground focus:border-primary"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                      <SelectItem value="default" className="hover:bg-accent focus:bg-accent">
                        Default
                      </SelectItem>
                      <SelectItem value="educational" className="hover:bg-accent focus:bg-accent">
                        Educational
                      </SelectItem>
                      <SelectItem value="storytelling" className="hover:bg-accent focus:bg-accent">
                        Storytelling
                      </SelectItem>
                      <SelectItem value="conversational" className="hover:bg-accent focus:bg-accent">
                        Conversational
                      </SelectItem>
                      <SelectItem value="professional" className="hover:bg-accent focus:bg-accent">
                        Professional
                      </SelectItem>
                      <SelectItem value="custom" className="hover:bg-accent focus:bg-accent">
                        Custom
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {systemPromptTemplate === "custom" && (
                  <div>
                    <Label htmlFor="customSystemPrompt">Custom System Prompt</Label>
                    <Textarea
                      id="customSystemPrompt"
                      value={customSystemPrompt}
                      onChange={(e) => onCustomSystemPromptChange(e.target.value)}
                      placeholder="You are a helpful assistant."
                      className="bg-background border-border text-foreground focus:border-primary"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <ThemeToggle />
          <Button type="submit" onClick={onSaveSettings}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
