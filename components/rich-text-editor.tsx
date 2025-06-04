"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minRows?: number
  maxRows?: number
  className?: string
  readOnly?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  minRows = 5,
  maxRows = 20,
  className = "",
  readOnly = false,
}: RichTextEditorProps) {
  const [rows, setRows] = useState(minRows)

  // Adjust rows based on content
  useEffect(() => {
    if (!value) {
      setRows(minRows)
      return
    }

    const lineCount = (value.match(/\n/g) || []).length + 1
    const newRows = Math.min(Math.max(lineCount, minRows), maxRows)
    setRows(newRows)
  }, [value, minRows, maxRows])

  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`resize-none font-mono text-sm ${className}`}
      readOnly={readOnly}
    />
  )
}
