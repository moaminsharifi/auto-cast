# Contributing to Auto Cast

First off, thank you for considering contributing to Auto Cast! It's people like you that make Auto Cast such a great tool for the podcast creation community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [moaminsharifi@gmail.com](mailto:moaminsharifi@gmail.com).

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **pnpm** (we recommend pnpm)
- **Git** for version control
- **OpenAI API Key** for testing AI features

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/auto-cast.git
   cd auto-cast
   ```

3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/moaminsharifi/auto-cast.git
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

5. **Create environment file** (optional):
   ```bash
   cp .env.example .env.local
   # Add your OpenAI API key for testing
   ```

6. **Start the development server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

7. **Open the application** at [http://localhost:3000](http://localhost:3000)

## 🛠️ Making Changes

### Creating a Branch

Always create a new branch for your changes:

```bash
# Update your fork with latest changes
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b bugfix/issue-description
# or for documentation
git checkout -b docs/documentation-update
```

### Development Workflow

1. **Make your changes** in small, logical commits
2. **Test your changes** thoroughly:
   ```bash
   # Type checking
   npm run type-check
   
   # Linting
   npm run lint
   
   # Build test
   npm run build
   ```

3. **Test the application manually**:
   - Try all 4 steps of the podcast generation workflow
   - Test with different settings and configurations
   - Verify responsive design on different screen sizes
   - Test both light and dark themes

4. **Write or update tests** if applicable
5. **Update documentation** if you've made changes to APIs or user interface

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Examples
feat: add support for custom voice cloning
fix: resolve audio playback issue on Safari
docs: update installation instructions
style: improve button hover animations
refactor: extract AI provider logic to separate module
test: add unit tests for voice selection component
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: UI/styling changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🔍 Pull Request Process

### Before Submitting

1. **Ensure your code builds successfully**:
   ```bash
   npm run build
   ```

2. **Run linting and fix any issues**:
   ```bash
   npm run lint
   npm run lint -- --fix
   ```

3. **Update documentation** if you've changed functionality

4. **Add or update tests** for new features

5. **Test your changes** in multiple browsers if possible

### Submitting the Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - **Clear title** describing the change
   - **Detailed description** of what was changed and why
   - **Screenshots** if the change affects the UI
   - **Testing instructions** for reviewers
   - **Reference to related issues** (e.g., "Fixes #123")

3. **Respond to feedback** promptly and make requested changes

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🎨 Style Guidelines

### Code Style

We use **ESLint** and **Prettier** for code formatting. Please ensure your code passes linting:

```bash
npm run lint
```

### TypeScript Guidelines

- **Use strict TypeScript** - avoid `any` types
- **Define interfaces** for component props and API responses
- **Use proper typing** for event handlers and callbacks
- **Document complex types** with JSDoc comments

```typescript
// ✅ Good
interface VoiceSettings {
  /** Primary voice for single-host or first speaker */
  primaryVoice: string
  /** Secondary voice for dual-host conversations */
  secondaryVoice?: string
  /** Speech rate multiplier (0.5-2.0) */
  speed: number
  /** Pitch adjustment multiplier (0.8-1.2) */
  pitch: number
}

// ❌ Avoid
const settings: any = { ... }
```

### React Component Guidelines

- **Use functional components** with hooks
- **Prefer composition** over inheritance
- **Use meaningful prop names** and provide defaults
- **Add proper JSDoc comments** for component props

```typescript
// ✅ Good
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outline'
  /** Whether button is in loading state */
  isLoading?: boolean
  /** Click event handler */
  onClick?: () => void
}

export default function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  onClick 
}: ButtonProps) {
  // Component implementation
}
```

### CSS and Styling

- **Use Tailwind CSS** classes primarily
- **Follow mobile-first** responsive design
- **Support dark mode** with appropriate classes
- **Use consistent spacing** following the 4px grid system

```jsx
// ✅ Good
<div className="
  p-4 md:p-6 lg:p-8
  bg-white dark:bg-slate-900
  rounded-lg shadow-sm
  transition-colors duration-200
">
```

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Try the latest version** to see if the bug is already fixed
3. **Test in multiple browsers** if it's a UI issue

### Bug Report Template

When reporting bugs, please include:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser [e.g. chrome, safari, firefox]
 - Version [e.g. 22]
 - Node.js version [e.g. 18.17.0]

**Additional context**
Add any other context about the problem here.
```

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing issues** to see if someone has already suggested it
2. **Open a new issue** with the "enhancement" label
3. **Describe the feature** in detail
4. **Explain the use case** and why it would be valuable
5. **Consider implementation complexity** and provide ideas if possible

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### High Priority
- **Bug fixes** - Check the issues labeled "bug"
- **Performance improvements** - Optimize bundle size and loading times
- **Accessibility** - Improve screen reader support and keyboard navigation
- **Mobile experience** - Enhance responsive design and touch interactions

### Medium Priority
- **New AI providers** - Add support for additional AI services
- **Language support** - Add new language options
- **Voice options** - Integrate new TTS providers
- **Export formats** - Support for additional audio formats

### Documentation
- **Code examples** - Add more usage examples
- **Tutorials** - Step-by-step guides for common tasks
- **API documentation** - Improve API route documentation
- **Troubleshooting guides** - Common issues and solutions

## 🏗️ Architecture Guidelines

### Project Structure

```
auto-cast/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main application
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── *.tsx          # Custom components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── public/            # Static assets
```

### Component Organization

- **One component per file** with default export
- **Co-locate related files** (component + test + styles)
- **Use barrel exports** for component groups
- **Separate UI components** from business logic

### State Management

- **Local state** for component-specific data
- **Local storage** for user preferences
- **URL state** for shareable application state
- **Context** sparingly for truly global state

## 🧪 Testing

### Manual Testing

Before submitting changes, please test:

- [ ] **Podcast generation workflow** - All 4 steps complete successfully
- [ ] **Settings functionality** - API configuration and preferences
- [ ] **Responsive design** - Mobile, tablet, and desktop layouts
- [ ] **Theme switching** - Light and dark modes
- [ ] **Error handling** - Invalid inputs and network errors
- [ ] **Audio playback** - Voice samples and generated podcasts
- [ ] **File upload** - Text and markdown file handling

### Automated Testing

We encourage adding tests for:
- **Component behavior** - User interactions and state changes
- **API routes** - Request/response handling
- **Utility functions** - Pure function logic
- **Error scenarios** - Edge cases and error conditions

## 📞 Community

### Getting Help

- **GitHub Discussions** - General questions and community chat
- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Real-time community chat (coming soon)

### Ways to Connect

- **Follow the project** on GitHub to stay updated
- **Star the repository** to show your support
- **Share your projects** built with Auto Cast
- **Write blog posts** about your experience

## 🏷️ Labels and Issue Management

We use these labels to organize issues:

- `bug` - Something isn't working correctly
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `good first issue` - Great for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Urgent issues
- `priority: low` - Nice to have features

## 📝 Release Process

1. **Feature freeze** - No new features, only bug fixes
2. **Testing** - Comprehensive manual and automated testing
3. **Documentation update** - Ensure all docs are current
4. **Version bump** - Follow semantic versioning
5. **Release notes** - Detailed changelog
6. **Deployment** - Release to production

## 🙏 Recognition

Contributors are recognized in:
- **README.md** - Contributors section
- **Release notes** - Feature acknowledgments
- **GitHub** - Contributor badges and statistics

---

Thank you for contributing to Auto Cast! Your efforts help make podcast creation more accessible to everyone. 🎙️