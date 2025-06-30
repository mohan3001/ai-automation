# AI-Powered Test Automation Framework

A comprehensive test automation framework that combines Playwright with local LLM (Ollama) and RAG (ChromaDB) for intelligent test generation and management.

## 🏗️ Architecture

```
ai-test-automation/
├── playwright-framework/     # Playwright test framework (TypeScript)
├── ai-service/              # Python LLM + RAG service
├── cli-tool/                # Node.js CLI orchestrator
├── shared/                  # Shared types and utilities
└── docs/                    # Documentation
```

## 🎯 Features

### For QA Engineers/Automation Engineers
- **Intelligent Test Generation**: Generate tests using natural language
- **Code Context Awareness**: LLM understands your existing codebase patterns
- **Test Modification**: Modify existing tests with AI assistance
- **Approval Workflow**: Review and approve generated code before commit
- **Full Codebase Access**: RAG indexes entire codebase for context

### For Functional Testers/Business Analysts
- **Test Execution**: Run existing tests with simple commands
- **Results Analysis**: Get insights from test execution
- **Test Discovery**: Find relevant tests for specific features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Ollama (for local LLM)
- Git

### Installation

1. **Clone and Setup**
```bash
git clone <your-repo>
cd ai-test-automation
```

2. **Install Dependencies**
```bash
# Install Playwright framework
cd playwright-framework
npm install

# Install AI service
cd ../ai-service
pip install -r requirements.txt

# Install CLI tool
cd ../cli-tool
npm install
```

3. **Setup Ollama**
```bash
# Install Ollama from https://ollama.ai/
ollama pull mistral
```

4. **Initialize the Framework**
```bash
cd ..
npm run setup
```

## 📖 Usage

### For QA Engineers

```bash
# Generate a new test
ai-test generate "test login functionality with invalid credentials"

# Modify existing test
ai-test modify "tests/login.spec.ts" "add timeout handling"

# Review and approve generated code
ai-test review

# Run all tests
ai-test run
```

### For Functional Testers

```bash
# Run specific test
ai-test run --test "login"

# Get test results
ai-test results

# Find tests for feature
ai-test find "checkout process"
```

## 🔧 Configuration

The framework supports multiple configuration levels:

- **Global**: Framework-wide settings
- **Project**: Per-project configurations
- **User**: Role-based permissions and preferences

## 🤖 AI Integration

### RAG (Retrieval-Augmented Generation)
- Indexes entire codebase for context
- Understands existing patterns and conventions
- Generates code that follows your standards

### Local LLM (Ollama)
- Privacy-first approach
- No external API dependencies
- Customizable models

### Code Generation Workflow
1. User provides natural language request
2. RAG retrieves relevant code context
3. LLM generates code following existing patterns
4. QA Engineer reviews and approves
5. Code is committed to Git

## 📁 Project Structure

### Playwright Framework
- Page Object Model implementation
- Test utilities and helpers
- Configuration management
- Reporting and analytics

### AI Service
- LangChain integration
- ChromaDB vector storage
- Ollama LLM provider
- Code analysis and generation

### CLI Tool
- Command orchestration
- Git integration
- User role management
- Workflow automation

## 🔒 Security & Permissions

### Role-Based Access
- **QA Engineers**: Full access to code generation and modification
- **Functional Testers**: Read-only access to tests and results
- **Business Analysts**: Test execution and results viewing

### Code Safety
- All generated code requires manual approval
- Follows existing code patterns and conventions
- No automatic commits without review

## 🛠️ Development

### Adding New Features
1. Create feature branch
2. Implement in appropriate module
3. Add tests
4. Update documentation
5. Submit for review

### Contributing
- Follow TypeScript/JavaScript standards
- Use conventional commits
- Include tests for new features
- Update documentation

## 📚 Documentation

- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [API Reference](docs/api-reference.md)
- [Configuration](docs/configuration.md)

## 🤝 Support

- Create issues for bugs or feature requests
- Join discussions for questions
- Contribute to the project

## 📄 License

MIT License - see LICENSE file for details 