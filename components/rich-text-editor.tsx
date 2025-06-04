"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { Textarea } from "@/components/ui/textarea"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link,
  Eye,
  Edit,
  Type,
  Undo,
  Redo,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  dir?: "ltr" | "rtl"
  readOnly?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className = "",
  dir = "ltr",
  readOnly = false,
}: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Update history when value changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(value)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [value])

  // Handle undo/redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  // Get current selection
  const updateSelection = () => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      })
    }
  }

  // Insert text at cursor position
  const insertText = (before: string, after = "", placeholder = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newValue = value.substring(0, start) + before + textToInsert + after + value.substring(end)

    onChange(newValue)

    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + before.length + textToInsert.length + after.length
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        textareaRef.current.focus()
      }
    }, 0)
  }

  // Insert text at beginning of line
  const insertLinePrefix = (prefix: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const lines = value.split("\n")
    let currentLineStart = 0
    let lineIndex = 0

    // Find which line the cursor is on
    for (let i = 0; i < lines.length; i++) {
      if (currentLineStart + lines[i].length >= start) {
        lineIndex = i
        break
      }
      currentLineStart += lines[i].length + 1 // +1 for newline
    }

    // Toggle prefix if it already exists
    if (lines[lineIndex].startsWith(prefix)) {
      lines[lineIndex] = lines[lineIndex].substring(prefix.length)
    } else {
      lines[lineIndex] = prefix + lines[lineIndex]
    }

    const newValue = lines.join("\n")
    onChange(newValue)

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(start, start)
        textareaRef.current.focus()
      }
    }, 0)
  }

  // Format markdown to HTML for preview
  const formatMarkdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/^\* (.*$)/gim, "<li>$1</li>")
      .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2">$1</a>')
      .replace(/\n/g, "<br>")
  }

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertText("**", "**", "bold text"),
      shortcut: "Ctrl+B",
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertText("*", "*", "italic text"),
      shortcut: "Ctrl+I",
    },
    {
      icon: Underline,
      label: "Underline",
      action: () => insertText("__", "__", "underlined text"),
      shortcut: "Ctrl+U",
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertText("`", "`", "code"),
      shortcut: "Ctrl+`",
    },
  ]

  const headingButtons = [
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertLinePrefix("# "),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertLinePrefix("## "),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertLinePrefix("### "),
    },
  ]

  const listButtons = [
    {
      icon: List,
      label: "Bullet List",
      action: () => insertLinePrefix("* "),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertLinePrefix("1. "),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertLinePrefix("> "),
    },
  ]

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          insertText("**", "**", "bold text")
          break
        case "i":
          e.preventDefault()
          insertText("*", "*", "italic text")
          break
        case "u":
          e.preventDefault()
          insertText("__", "__", "underlined text")
          break
        case "`":
          e.preventDefault()
          insertText("`", "`", "code")
          break
        case "z":
          e.preventDefault()
          if (e.shiftKey) {
            handleRedo()
          } else {
            handleUndo()
          }
          break
        case "y":
          e.preventDefault()
          handleRedo()
          break
      }
    }
  }

  if (readOnly) {
    return (
      <div className={`border border-border rounded-md ${className}`}>
        <div className="p-4 bg-muted/30 border-b border-border">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Read-only mode</span>
          </div>
        </div>
        <div className="p-4">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(value) }}
            dir={dir}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-border rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border-b border-border">
        {/* Undo/Redo */}
        <Button variant="ghost" size="sm" onClick={handleUndo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        {toolbarButtons.map((button) => (
          <Button
            key={button.label}
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={`${button.label} (${button.shortcut})`}
          >
            <button.icon className="w-4 h-4" />
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        {headingButtons.map((button) => (
          <Button key={button.label} variant="ghost" size="sm" onClick={button.action} title={button.label}>
            <button.icon className="w-4 h-4" />
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists and Quote */}
        {listButtons.map((button) => (
          <Button key={button.label} variant="ghost" size="sm" onClick={button.action} title={button.label}>
            <button.icon className="w-4 h-4" />
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Link */}
        <Button variant="ghost" size="sm" onClick={() => insertText("[", "](url)", "link text")} title="Insert Link">
          <Link className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        {/* Preview Toggle */}
        <Toggle pressed={isPreviewMode} onPressedChange={setIsPreviewMode} size="sm" title="Toggle Preview">
          {isPreviewMode ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Toggle>
      </div>

      {/* Editor Content */}
      <div className="relative">
        {isPreviewMode ? (
          <div className="p-4 min-h-[300px]">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(value) }}
              dir={dir}
            />
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onSelect={updateSelection}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="border-0 rounded-none resize-none focus:ring-0 focus:border-0 min-h-[300px] font-mono text-sm"
            dir={dir}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-muted/20 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>{value.length} characters</span>
          <span>{value.split("\n").length} lines</span>
          <span>~{Math.ceil(value.split(" ").length / 200)} min read</span>
        </div>
        <div className="flex items-center space-x-2">
          <Type className="w-3 h-3" />
          <span>Markdown</span>
        </div>
      </div>
    </div>
  )
}
