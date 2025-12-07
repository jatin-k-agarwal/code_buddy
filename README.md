# code_buddy

If you find this project useful, please consider giving it a ⭐! Your support helps the project grow and reach more developer.

[![GitHub stars](https://img.shields.io/github/stars/exodus-tola-mindCoder/code_buddy?style=social)](https://github.com/exodus-tola-mindCoder/code_buddy)

<p align="center">
  <strong>A sophisticated CLI assistant to supercharge your Git workflow, powered by multiple AI providers.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/code_buddy"><img src="https://img.shields.io/npm/v/code_buddy.svg" alt="NPM Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://github.com/exodus-tola-mindCoder/code_buddy/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a href="#"><img src="https://img.shields.io/badge/AI-OpenAI%20%7C%20Gemini%20%7C%20Addis%20AI-blue.svg" alt="AI Providers"></a>
</p>



---

**code_buddy** is an intelligent, open-source command line tool that automates your most repetitive Git tasks. From providing an enhanced `git status` to watching your files, running quality checks, and generating insightful, AI-powered commit messages, code_buddy acts as your personal Git assistant so you can focus on coding.

<p align="center">
<pre>
    ██████╗ ██╗███████╗███████╗██╗   ██╗
    ██╔════╝ ██║██╔════╝██╔════╝╚██╗ ██╔╝
    ██║  ███╗██║███████╗███████╗ ╚████╔╝
    ██║   ██║██║╚════██║╚════██║  ╚██╔╝
    ╚██████╔╝██║███████║███████║   ██║
     ╚═════╝ ╚═╝╚══════╝╚══════╝   ╚═╝

       Your personal Git assistant
</pre>
</p>

## ✨ Key Features

- **Open Source**: Free to use, licensed under MIT, and open to community contributions.
- **Intelligent File Watcher**: Automatically detects file changes in your repository
- **Automated Workflow**: Runs your tests and linter, then stages, commits, and pushes your changes seamlessly
- **SSH Key Setup**: Automatic SSH key generation and GitHub configuration for seamless authentication
- **AI-Powered Commits**: Leverages multiple AI providers (OpenAI, Gemini, Addis AI) to generate meaningful and conventional commit messages from your code diffs
- **Multi-AI Provider Support**: Choose from OpenAI, Google Gemini, or Addis AI for local language support
- **Highly Configurable**: Customize every part of the workflow using a simple `.code_buddyrc.json` file in your project
- **Zero-Config Ready**: Works out of the box with sensible defaults for most projects
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Enhanced Git Commands**: Clean, colorful, and informative outputs for `status`, `info`, and `branch` commands
- **TypeScript Ready**: Built with modern JavaScript (ES modules) for better performance

## 🛠️ Installation

### Global Installation (Recommended)
```bash
npm install -g code_buddy
```

### Using npx (No Installation Required)
```bash
# Run code_buddy without installing
npx code_buddy status
npx code_buddy watch
npx code_buddy info
npx code_buddy ssh
```

## ⚙️ Configuration

### Basic Configuration
Create a `.code_buddyrc.json` file in your project root:

```json
{
  "branch": "main",
  "runTests": true,
  "runLint": true,
  "useAI": false,
  "autoCommit": false,
  "autoPush": false,
  "testCommand": "npm test",
  "lintCommand": "npm run lint",
  "watchIgnore": [
    "*.tmp",
    "build/**",
    "dist/**",
    "node_modules/**",
    ".git/**",
    "*.log"
  ]
}
```

### AI Provider Configuration
code_buddy supports multiple AI providers for generating intelligent commit messages. Configure your preferred provider using environment variables:

#### Environment Variables
Create a `.env` file in your project root:

```bash
# OpenAI (default priority)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Addis AI (local languages support)
ADDIS_AI_API_KEY=your_addis_ai_api_key_here
```

#### Provider Priority
The system automatically detects which AI provider to use based on available API keys in this priority order:
1. **OpenAI** (if `OPENAI_API_KEY` is set)
2. **Google Gemini** (if `GEMINI_API_KEY` is set)  
3. **Addis AI** (if `ADDIS_AI_API_KEY` is set)

#### AI Provider Features
| Provider | Model | Languages | Special Features |
|----------|--------|-----------|------------------|
| **OpenAI** | GPT-3.5-turbo | English | Conventional commit format |
| **Gemini** | gemini-pro | Multiple | Advanced AI generation |
| **Addis AI** | addis-ai | Afaan Oromo, Amharic | Local language support |

### Multi-AI Provider Support Guide

#### Overview
code_buddy  supports multiple AI providers for generating intelligent commit messages, including OpenAI, Gemini, and Addis AI.

#### Supported Providers

1. **OpenAI** - Standard GPT models for general commit messages
2. **Gemini** - Google's Gemini models for advanced AI generation
3. **Addis AI** - Local language support for Afaan Oromo and Amharic

#### Configuration Examples

##### .env file
```bash
# For OpenAI
OPENAI_API_KEY=sk-1234567890abcdef

# For Gemini
GEMINI_API_KEY=your-gemini-key-here

# For Addis AI (local languages)
ADDIS_AI_API_KEY=your-addis-ai-key-here
```

#### Features
- **Multi-language support**: Addis AI supports Afaan Oromo and Amharic
- **Automatic fallback**: Falls back to simple commit messages if no AI keys are available
- **Zero-config ready**: Works without any API keys
- **Cross-platform**: Works on Windows, macOS, and Linux

#### Migration Guide
##### From Single OpenAI to Multi-Provider
1. Add new environment variables as needed
2. No code changes required
3. System automatically detects available providers

##### Backward Compatibility
- Existing OPENAI_API_KEY continues to work
- No breaking changes to existing configurations
- Fallback to simple commit messages when no keys are available

### Configuration Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `branch` | string | "main" | Target branch for pushes |
| `runTests` | boolean | true | Run tests before committing |
| `runLint` | boolean | true | Run linting before committing |
| `useAI` | boolean | false | Use AI for commit messages |
| `autoCommit` | boolean | false | Skip confirmation for commits |
| `autoPush` | boolean | false | Skip confirmation for pushes |
| `testCommand` | string | "npm test" | Command to run tests |
| `lintCommand` | string | "npm run lint" | Command to run linting |
| `watchIgnore` | array | [] | Additional patterns to ignore |

## 📖 Usage

### Basic Commands

```bash
# Show enhanced git status with file changes
code_buddy status

# Show detailed repository information
code_buddy info

# List all branches with current indicator
code_buddy branch

# List remote branches
code_buddy branch --remote

# List all branches (local and remote)
code_buddy branch --all

# Start intelligent file watcher
code_buddy watch

# Show which AI provider is being used
code_buddy watch --verbose

# Generate and setup SSH key for GitHub
code_buddy ssh 

# Show help and all available commands
code_buddy --help

# Using npx (no installation required)
npx code_buddy status
npx code_buddy watch --use-ai
npx code_buddy info
```

### File Watcher Workflow

The file watcher automatically:
1. Monitors file changes in your repository
2. Runs tests and linting (if enabled)
3. Generates commit messages (AI or fallback)
4. Stages, commits, and pushes changes

```bash
$ code_buddy watch
👀 code_buddy - Enhanced File Watcher Started

🚀 code_buddy — automate your GitHub workflows

📁 Watching current directory for changes...
⚙️  Configuration:
   Tests: ✅
   Linting: ✅
   AI Commits: ❌
   Auto Commit: ❌
   Auto Push: ❌
   Branch: main

📝 Modified: src/index.js
✅ All quality checks passed!
💭 AI commit message generated
🚀 Successfully committed and pushed changes!
```

### Advanced Usage

```bash
# Verbose logging during watch
code_buddy watch --verbose

# Custom ignore patterns
code_buddy watch --ignore "*.tmp" "build/**"

# Combined options
code_buddy watch --verbose --ignore "*.log" "dist/**"

# Using npx with all options
npx code_buddy watch --verbose --use-ai --ignore "*.log"
```


## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed information on how to get started, development setup, and contribution guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js/) for CLI
- File watching powered by [Chokidar](https://github.com/paulmillr/chokidar)
- Configuration via [Cosmiconfig](https://github.com/davidtheclark/cosmiconfig)
- AI integration with [OpenAI](https://openai.com)
[AddisAI](http://platform.addisassistant.com)
- Colorful output with [Chalk](https://github.com/chalk/chalk)

## 🚀 Roadmap

We have big plans for code_buddy! Here are some of the features we're looking to add in the future.

### 1. **Advanced Configuration**
- [ ] Custom commit message templates
- [ ] Multi-repository support
- [ ] Custom Git hooks

### 2. **Enhanced AI**
- [ ] Commit message validation
- [ ] User preference learning

### 3. **Platform Integration**
- [ ] Bitbucket pipeline support
- [ ] Azure DevOps integration

### 4. **User Experience**
- [ ] Color themes
- [ ] Progress bars for long-running tasks
- [ ] Detailed logging options

## ✍️ Author

**Exodus Tola**

- **GitHub**: [@exodus-tola-mindCoder](https://github.com/exodus-tola-mindCoder)
- **LinkedIn**: [Exodus Tola](https://www.linkedin.com/in/exodus-tola) 
- **X (Twitter)**: [@Exodus_Tola](https://x.com/Exodus_Tola)
- **Telegram**: [@Exodus_Tola](https://t.me/Exodus_Tola)