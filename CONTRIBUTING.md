
## 🏗️ Project Structure

```
code_buddy/
├── bin/
│   └── code_buddy.js               # CLI entry point
├── src/
│   ├── index.js               # Main CLI commands and program setup
│   ├── git-operations.js      # Git command wrappers and utilities
│   ├── config.js              # Configuration management with cosmiconfig
│   ├── commit-message.js      # AI-powered and fallback commit message generation
│   ├── ssh-handler.js         # SSH key generation and GitHub configuration
│   ├── watcher.js             # File watching with chokidar
│   ├── test-runner.js         # Test and lint execution with proper error handling
│   ├── user-interaction.js    # CLI prompts and confirmations
│   └── ui.js                  # UI utilities and ASCII art
├── tests/
│   ├── unit/
│   │   └── git-operations.test.js
│   ├── integration/
│   │   └── cli.test.js
│   ├── config/
│   │   └── config.test.js
│   └── error-handling/
│       └── error.test.js
├── .code_buddyrc.example.json      # Configuration template
├── .env.example               # Environment variables template
├── package.json               # NPM package configuration
├── package-lock.json          # Dependency lock file
├── LICENSE                    # MIT License
└── README.md                  # This documentation
```

## 🔧 Development

### Prerequisites
- Node.js v16+
- Git
- NPM

### Development Setup
```bash
git clone https://github.com/exodus-tola-mindCoder/code_buddy.git
cd code_buddy
npm install
npm link  # For global CLI access during development
```
/// Git Repository Detection - The isGitRepository() function has specific checks that might fail in edge cases

### Available Scripts
```bash
npm start          # Run CLI directly
npm test           # Run test suite
npm run lint       # Lint source code
npm run lint:fix   # Fix linting issues
npm run format     # Format code with prettier
```

### Adding New Commands
1. Open `src/index.js`
2. Add new command in `createCommand()` function
3. Implement handler function
4. Add tests in appropriate test directory
5. Update documentation

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- tests/unit/

# Run AI provider tests
npm test -- tests/unit/ai-providers.test.js
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run tests** (`npm test`)
6. **Lint your code** (`npm run lint`)
7. **Format your code** (`npm run format`)
8. **Submit a pull request**

### Contribution Guidelines
- Follow conventional commit messages
- Add tests for new features
- Update documentation
- Ensure all CI checks pass

## 🐛 Troubleshooting

### Common Issues

**Command not found after npm install -g**
```bash
# Check if global bin is in PATH
npm config get prefix
# Add to PATH if needed
```

**Permission errors on macOS/Linux**
```bash
sudo npm install -g code_buddy
```

**Windows issues**
```bash
# Run as administrator or use Windows Terminal
npm install -g code_buddy
```

### Debug Mode
```bash
DEBUG=code_buddy code_buddy status
DEBUG=code_buddy code_buddy watch --verbose --use-ai
```

### AI Provider Issues
```bash
# Check which provider is being used
code_buddy watch --verbose

# Verify environment variables
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY
echo $ADDIS_AI_API_KEY

# Test AI provider detection
node -e "import('./src/commit-message.js').then(m => console.log(m.getAvailableProviders()))"
```

### Multi-AI Provider Troubleshooting

#### Common Issues
1. **No AI messages generated**: Check if any API keys are configured
2. **Provider not detected**: Verify environment variable names
3. **Language issues**: Ensure Addis AI key is set for local languages

#### Debug Mode
```bash
DEBUG=code_buddy code_buddy watch --verbose
```