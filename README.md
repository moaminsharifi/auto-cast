# 🎙️ Auto Cast

**Transform your text content into engaging AI-powered podcasts with natural voice synthesis**

Auto Cast is a comprehensive, AI-driven platform that revolutionizes podcast creation by automating the entire workflow—from content summarization and script generation to high-quality audio production. Built with modern web technologies and powered by OpenAI's advanced language models.

![Auto Cast Banner](https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80)

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Smart Summarization**: Automatically distill long-form content into concise, podcast-ready summaries
- **Dynamic Script Generation**: Create engaging podcast scripts with customizable styles and formats
- **Iterative Refinement**: Continuously improve scripts with AI-powered editing and enhancement
- **Multi-format Support**: Handle various input types including articles, blog posts, and documents

### 🌍 Multi-Language Support
- **English**: Full support with native language models
- **Persian (Farsi)**: Comprehensive Persian language support for Middle Eastern audiences
- **Extensible**: Architecture ready for additional language support

### 🎤 Advanced Text-to-Speech
- **Multiple Voice Options**: Choose from 6 professional AI voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- **Customizable Audio**: Adjust speech speed, pitch, and tone to match your brand
- **High-Quality Output**: Generate broadcast-ready audio with natural intonation

### 🎨 Modern User Interface
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Step-by-Step Workflow**: Intuitive 4-step process from content input to audio generation
- **Real-time Preview**: Live script editing with rich text formatting
- **Progress Tracking**: Visual progress indicators during generation

### ⚙️ Flexible Configuration
- **Multiple AI Providers**: Support for OpenAI, AvalAI, OpenRouter, AWS Bedrock, and Azure OpenAI
- **Custom Endpoints**: Configure your own AI service endpoints
- **Advanced Settings**: Fine-tune temperature, max tokens, and system prompts
- **Podcast Formats**: Single or dual-host configurations with various styles

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   API Routes     │────│   AI Services   │
│   (Next.js)     │    │   (Next.js API)  │    │   (OpenAI)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ├─ Rich Text Editor     ├─ Content Generation   ├─ GPT Models
         ├─ Voice Preview        ├─ Text-to-Speech       ├─ TTS Engine
         ├─ Settings Modal       ├─ Endpoint Testing     └─ Voice Models
         └─ Theme Management     └─ Audio Processing
```

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.2.4](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components

### AI & Backend
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI integration toolkit
- **[OpenAI API](https://openai.com/)** - Language models and TTS
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI primitives

### Development Tools
- **[React Hook Form](https://react-hook-form.com/)** - Performant form handling
- **[Zod](https://zod.dev/)** - Runtime type validation
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **pnpm** (recommended)
- **OpenAI API Key** - [Get yours here](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/moaminsharifi/auto-cast.git
   cd auto-cast
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Using pnpm (recommended)
   pnpm install
   ```

3. **Start the development server**
   ```bash
   # Using npm
   npm run dev
   
   # Using pnpm
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Configure API Key**: Click the "Settings" button in the top-right corner
2. **Add OpenAI API Key**: Enter your OpenAI API key and optionally save it locally
3. **Test Connection**: Use the "Test Connection" feature to verify your setup
4. **Start Creating**: Begin with the 4-step podcast generation workflow

## 📖 Usage Guide

### Step 1: Content Input
- **Paste Text**: Directly input your content using the rich text editor
- **Upload Files**: Support for `.txt` and `.md` files up to 10MB
- **Language Selection**: Choose between English and Persian

### Step 2: Podcast Configuration
- **Duration**: Set target length (5-30 minutes)
- **Host Format**: Single or dual-host conversations
- **Style**: Conversational, educational, storytelling, or interview
- **Extras**: Optional intro, outro, and background music

### Step 3: Voice Settings
- **Voice Selection**: Choose from 6 professional AI voices
- **Audio Tuning**: Adjust speech speed (0.5x-2.0x) and pitch (0.8x-1.2x)
- **Preview**: Listen to voice samples before generation

### Step 4: Generation & Download
- **Review Settings**: Final confirmation of all parameters
- **Real-time Progress**: Watch script generation in real-time
- **Audio Production**: Automatic conversion to high-quality MP3
- **Download**: Get both script and audio files

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Set default OpenAI API key (users can override in UI)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom API endpoint
CUSTOM_AI_ENDPOINT=https://your-custom-endpoint.com/v1
```

### Advanced Settings

Access advanced configuration through the Settings modal:

- **Model Selection**: Choose from GPT-4, GPT-3.5-turbo, and other available models
- **Temperature**: Control creativity (0.0-1.0)
- **Max Tokens**: Set maximum response length
- **System Prompts**: Customize AI behavior with predefined or custom prompts
- **Custom Endpoints**: Configure alternative AI service providers

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

For static export (GitHub Pages, etc.):
```bash
# Build and export
npm run build

# The 'out' directory contains the static files
```

## 🧪 Development

### Project Structure

```
auto-cast/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate-podcast/  # Main generation endpoint
│   │   ├── test-endpoint/     # Connection testing
│   │   └── voice-sample/      # Voice preview
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main application
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── rich-text-editor.tsx
│   ├── settings-modal.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── voice-sample-player.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── styles/               # Additional styles
```

### Key Components

- **`app/page.tsx`**: Main application with 4-step workflow
- **`components/settings-modal.tsx`**: Configuration interface
- **`components/rich-text-editor.tsx`**: Content input with formatting
- **`app/api/generate-podcast/route.ts`**: Core generation logic
- **`components/voice-sample-player.tsx`**: Voice preview functionality

### Adding New Features

1. **New AI Provider**: Extend the API endpoints configuration
2. **Additional Languages**: Add language options and prompt templates
3. **Voice Options**: Integrate new TTS providers
4. **Export Formats**: Add new audio/video output formats

## 🔒 Privacy & Security

- **Local Storage**: API keys can be stored locally in browser (optional)
- **No Server Storage**: No sensitive data is stored on the server
- **HTTPS Only**: All AI API communications use secure connections
- **Client-Side Processing**: Content processing happens client-side when possible

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Install** dependencies (`pnpm install`)
4. **Make** your changes
5. **Test** your changes (`npm run build`)
6. **Commit** your changes (`git commit -m 'Add amazing feature'`)
7. **Push** to the branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured for Next.js and React
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Use conventional commit messages

## 📊 Roadmap

- [ ] **Video Podcast Generation**: Support for video content with AI avatars
- [ ] **Batch Processing**: Handle multiple documents simultaneously
- [ ] **Advanced Voice Cloning**: Custom voice training capabilities
- [ ] **Podcast Analytics**: Usage statistics and performance metrics
- [ ] **Team Collaboration**: Multi-user workspaces and sharing
- [ ] **API Access**: RESTful API for external integrations
- [ ] **Mobile App**: Native iOS and Android applications

## 🆘 Support

- **Documentation**: Check the [Wiki](https://github.com/moaminsharifi/auto-cast/wiki) for detailed guides
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/moaminsharifi/auto-cast/issues)
- **Discussions**: Join the community in [GitHub Discussions](https://github.com/moaminsharifi/auto-cast/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing advanced language models and TTS capabilities
- **Vercel** for the excellent AI SDK and hosting platform
- **shadcn** for the beautiful UI component library
- **Radix UI** for accessible headless components
- **Next.js Team** for the amazing React framework

---

<div align="center">
  <p>
    Built with ❤️ by <a href="https://moaminsharifi.com">Amin Sharifi</a>
  </p>
  <p>
    <a href="https://github.com/moaminsharifi/auto-cast">⭐ Star this project</a> if you find it useful!
  </p>
</div>
