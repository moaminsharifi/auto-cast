# GitHub Copilot Instructions for Auto Cast

This document provides comprehensive guidelines for GitHub Copilot to effectively assist with the Auto Cast project development. These instructions help maintain code quality, consistency, and align with the project's architecture and conventions.

## 🏗️ Project Overview

Auto Cast is a Next.js-based AI-powered podcast generation platform that converts text content into professional audio podcasts using OpenAI's language models and text-to-speech capabilities.

### Core Technologies
- **Frontend**: Next.js 15.2.4 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **AI Integration**: Vercel AI SDK with OpenAI API
- **Deployment**: Static export compatible, Vercel-optimized

## 📁 Project Structure & Architecture

```
auto-cast/
├── app/                    # Next.js App Router (RSC + Client Components)
│   ├── api/               # Server-side API routes
│   │   ├── generate-podcast/  # Main AI generation endpoint
│   │   ├── test-endpoint/     # Connection testing utility
│   │   └── voice-sample/      # TTS voice preview
│   ├── globals.css        # Global styles & Tailwind imports
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx          # Main application (client component)
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components (generated)
│   ├── rich-text-editor.tsx    # Content input with formatting
│   ├── settings-modal.tsx      # Configuration interface
│   ├── theme-provider.tsx      # Dark/light mode context
│   ├── theme-toggle.tsx        # Theme switcher button
│   └── voice-sample-player.tsx # Voice preview component
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## 🎯 Development Guidelines

### Code Style & Conventions

#### TypeScript Standards
- **Strict Mode**: Always use strict TypeScript configurations
- **Type Safety**: Prefer explicit types over `any`, use proper interfaces
- **Component Props**: Define comprehensive prop interfaces with JSDoc comments
- **API Types**: Create shared types for API request/response structures

```typescript
// ✅ Good: Explicit interface with documentation
interface PodcastSettings {
  /** Target duration in minutes (e.g., "10-15") */
  duration: string
  /** Number of hosts: "single" or "dual" */
  hosts: "single" | "dual"
  /** Podcast style affects script generation */
  style: "conversational" | "educational" | "storytelling" | "interview"
  /** Whether to include intro segment */
  includeIntro: boolean
  /** Whether to include outro segment */
  includeOutro: boolean
  /** Whether to add background music */
  includeMusic: boolean
}

// ❌ Avoid: Generic object types
const settings: any = { ... }
```

#### React Component Patterns

1. **Client Components**: Use `"use client"` for interactive components
2. **Server Components**: Prefer server components for static content
3. **Component Organization**: One component per file, export as default
4. **Props Destructuring**: Destructure props in function signature

```typescript
// ✅ Good: Client component with proper typing
"use client"

import type React from "react"
import { useState, useCallback } from "react"

interface VoicePlayerProps {
  /** Voice identifier for TTS */
  voice: string
  /** Optional sample text to preview */
  sampleText?: string
  /** Callback when voice is selected */
  onVoiceSelect?: (voice: string) => void
}

export default function VoicePlayer({ 
  voice, 
  sampleText = "Hello, this is a sample voice.", 
  onVoiceSelect 
}: VoicePlayerProps) {
  // Component implementation
}
```

#### API Route Standards

- **Error Handling**: Always return proper HTTP status codes
- **Input Validation**: Validate request bodies with Zod or similar
- **Response Format**: Consistent JSON response structure
- **Streaming**: Use streaming for long-running AI operations

```typescript
// ✅ Good: Proper API route structure
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Input validation
    if (!body.apiKey || !body.content) {
      return Response.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      )
    }

    // Process request
    const result = await processRequest(body)
    
    return Response.json({ 
      success: true, 
      data: result 
    })
  } catch (error) {
    console.error("API Error:", error)
    return Response.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
```

### Styling Guidelines

#### Tailwind CSS Best Practices
- **Utility Classes**: Prefer Tailwind utilities over custom CSS
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Dark Mode**: Support both light and dark themes
- **Component Variants**: Use `class-variance-authority` for component variants

```typescript
// ✅ Good: Responsive, theme-aware styling
<div className="
  min-h-screen 
  bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
  dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950
  md:p-8 p-4
">
```

#### Component Styling Patterns
- **Glass Morphism**: Use backdrop-blur and transparency for modern UI
- **Consistent Spacing**: Follow 4px grid system (space-4, p-4, etc.)
- **Color Palette**: Stick to slate/blue/indigo color scheme
- **Animations**: Subtle transitions for better UX

### State Management

#### Local State Patterns
- **useState**: For component-local state
- **useCallback**: For event handlers and functions passed as props
- **useEffect**: For side effects and data fetching
- **Local Storage**: For user preferences and settings persistence

```typescript
// ✅ Good: State management pattern
const [settings, setSettings] = useState<PodcastSettings>({
  duration: "10-15",
  hosts: "single",
  style: "conversational",
  includeIntro: true,
  includeOutro: true,
  includeMusic: false,
})

const updateSetting = useCallback(<K extends keyof PodcastSettings>(
  key: K, 
  value: PodcastSettings[K]
) => {
  setSettings(prev => ({ ...prev, [key]: value }))
}, [])

// Persist to localStorage
useEffect(() => {
  localStorage.setItem("podcast-settings", JSON.stringify(settings))
}, [settings])
```

## 🤖 AI Integration Patterns

### OpenAI API Usage
- **Streaming Responses**: Use streaming for real-time script generation
- **Error Handling**: Graceful degradation for API failures
- **Rate Limiting**: Implement client-side rate limiting
- **Model Selection**: Support multiple AI models and providers

```typescript
// ✅ Good: Streaming AI response pattern
const generateScript = async (content: string) => {
  const response = await fetch("/api/generate-podcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      settings,
      apiKey,
      model: "gpt-4o-mini"
    })
  })

  if (!response.ok) {
    throw new Error("Failed to generate script")
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    // Process streaming data
  }
}
```

### TTS Integration
- **Voice Options**: Support multiple voice models
- **Audio Quality**: High-quality MP3 output
- **Preview Functionality**: Voice samples for user selection
- **Error Recovery**: Fallback options for TTS failures

## 🧪 Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for UI components
- **API Testing**: Jest for API route logic
- **Type Testing**: TypeScript compiler for type safety
- **Integration Testing**: End-to-end workflow testing

### Manual Testing Checklist
- [ ] All 4 steps of podcast generation workflow
- [ ] Settings modal functionality
- [ ] Theme switching (light/dark)
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Error handling for invalid API keys
- [ ] File upload and text input
- [ ] Audio playback and download

## 🚀 Performance Considerations

### Optimization Strategies
- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: Next.js Image component with proper sizing
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching**: Appropriate cache headers for static assets

```typescript
// ✅ Good: Dynamic import for large components
const AdvancedSettings = dynamic(() => import("./advanced-settings"), {
  loading: () => <Skeleton className="h-40 w-full" />,
  ssr: false
})
```

### Memory Management
- **Event Listeners**: Clean up with useEffect return functions
- **Audio Elements**: Proper disposal of audio resources
- **API Requests**: Cancel pending requests on component unmount

## 🔒 Security Best Practices

### API Key Management
- **Client-Side Storage**: Optional local storage with user consent
- **No Server Storage**: Never store API keys on the server
- **Environment Variables**: Support for default keys in development
- **Validation**: Proper API key format validation

### Content Security
- **Input Sanitization**: Clean user inputs before processing
- **XSS Prevention**: Escape HTML content in rich text editor
- **CORS Configuration**: Proper CORS settings for API routes
- **Rate Limiting**: Prevent abuse of AI generation endpoints

## 📱 Responsive Design Patterns

### Breakpoint Strategy
- **Mobile First**: Design for mobile, enhance for larger screens
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid Layouts**: Use CSS Grid and Flexbox appropriately
- **Touch Targets**: Minimum 44px for interactive elements

### Component Adaptations
```typescript
// ✅ Good: Responsive component pattern
<div className="
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
  gap-4 md:gap-6 lg:gap-8
  p-4 md:p-6 lg:p-8
">
```

## 🎨 UI/UX Guidelines

### Design System
- **Color Palette**: Consistent use of slate, blue, and indigo
- **Typography**: Inter font with proper hierarchy
- **Iconography**: Lucide React icons consistently
- **Spacing**: 4px grid system throughout

### Accessibility Standards
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Visible focus indicators

### Animation Guidelines
- **Subtle Transitions**: 150-300ms duration for micro-interactions
- **Loading States**: Skeleton screens and progress indicators
- **Hover Effects**: Gentle scale and color transitions
- **Reduced Motion**: Respect user's motion preferences

## 🔄 Common Patterns & Solutions

### Form Handling
```typescript
// ✅ Good: Form submission pattern
const handleSubmit = useCallback(async (data: FormData) => {
  setIsLoading(true)
  setError(null)
  
  try {
    await submitForm(data)
    toast({
      title: "Success",
      description: "Form submitted successfully"
    })
  } catch (error) {
    setError(error.message)
    toast({
      title: "Error",
      description: "Failed to submit form",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}, [])
```

### Error Boundaries
- **Graceful Degradation**: Show meaningful error messages
- **Retry Mechanisms**: Allow users to retry failed operations
- **Logging**: Proper error logging for debugging
- **User Feedback**: Clear communication about what went wrong

### Loading States
- **Progressive Enhancement**: Show content as it loads
- **Skeleton Screens**: For predictable content layouts
- **Progress Indicators**: For long-running operations
- **Optimistic Updates**: Update UI immediately for better UX

## 🚢 Deployment & Build

### Static Export Configuration
- **Next.js Export**: Configured for static site generation
- **Asset Optimization**: Proper image and font optimization
- **Environment Variables**: Build-time vs runtime variables
- **CDN Compatibility**: Works with GitHub Pages, Vercel, etc.

### Build Optimization
```bash
# Build commands for different environments
npm run build          # Production build
npm run build:analyze  # Bundle analysis
npm run export         # Static export
```

## 📚 Documentation Standards

### Code Documentation
- **JSDoc Comments**: For all public functions and components
- **Inline Comments**: For complex business logic
- **Type Definitions**: Comprehensive TypeScript interfaces
- **README Updates**: Keep documentation current with features

### API Documentation
- **Endpoint Documentation**: Clear API route descriptions
- **Request/Response Examples**: Sample payloads
- **Error Codes**: Documented error responses
- **Rate Limits**: Usage limitations and guidelines

## 🔧 Development Workflow

### Git Conventions
- **Commit Messages**: Use conventional commits format
- **Branch Naming**: feature/, bugfix/, docs/, etc.
- **Pull Requests**: Comprehensive descriptions and testing notes
- **Code Reviews**: Focus on architecture, security, and performance

### IDE Configuration
- **VS Code Extensions**: ESLint, Prettier, TypeScript, Tailwind IntelliSense
- **Auto-formatting**: Prettier on save
- **Type Checking**: Real-time TypeScript validation
- **Debugging**: Proper debugger configurations

## 🎯 Feature Development Guidelines

When adding new features:

1. **Architecture First**: Plan component structure and data flow
2. **Type Definitions**: Create interfaces before implementation
3. **Error Handling**: Implement comprehensive error boundaries
4. **Accessibility**: Include ARIA labels and keyboard navigation
5. **Responsive Design**: Test on multiple screen sizes
6. **Performance**: Consider bundle size and loading impact
7. **Documentation**: Update relevant documentation files

## ⚡ Quick Reference

### Common Commands
```bash
# Development
npm run dev           # Start development server
npm run build         # Production build
npm run lint          # ESLint checking
npm run type-check    # TypeScript validation

# Component Generation
npx shadcn-ui@latest add button  # Add new UI component
```

### Key Directories
- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and configurations
- `/public` - Static assets (images, icons, etc.)

### Essential Files
- `app/page.tsx` - Main application interface
- `app/layout.tsx` - Root layout and providers
- `components/settings-modal.tsx` - Configuration interface
- `app/api/generate-podcast/route.ts` - Core AI generation logic

---

These guidelines help maintain consistency and quality across the Auto Cast codebase. When in doubt, refer to existing implementations and follow established patterns.