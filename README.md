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

2. **Setup Python Virtual Environment**
```bash
# Navigate to AI service directory
cd ai-service

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # You should see (venv) in prompt

# Verify pip is available
pip --version

# Install Python dependencies
pip install -r requirements.txt

# Deactivate virtual environment when done
deactivate
```

3. **Install Node.js Dependencies**
```bash
# Install Playwright framework
cd ../playwright-framework
npm install

# Install CLI tool
cd ../cli-tool
npm install
```

4. **Setup Ollama**
```bash
# Install Ollama from https://ollama.ai/
ollama pull mistral
```

5. **Initialize the Framework**
```bash
cd ..
npm run setup
```

## 🔧 Troubleshooting

### Common Issues

#### **"pip command not found" Error**
```bash
# Make sure you're in the virtual environment
cd ai-service
source venv/bin/activate

# You should see (venv) in your prompt
# Then install requirements
pip install -r requirements.txt
```

#### **"requirements.txt not found" Error**
```bash
# Make sure you're in the correct directory
cd ai-service
ls -la  # Should show requirements.txt

# If not found, check your current directory
pwd
```

#### **Ollama Connection Issues**
```bash
# Check if Ollama is running
ollama list

# Start Ollama if not running
ollama serve

# Test connection
curl http://localhost:11434/api/tags
```

#### **AI Service Won't Start**
```bash
# Make sure virtual environment is activated
cd ai-service
source venv/bin/activate

# Check if port 8000 is available
lsof -i :8000

# Start with different port if needed
uvicorn api_server:app --reload --host 0.0.0.0 --port 8001
```

#### **CLI Tool Not Found**
```bash
# Build the CLI tool
cd cli-tool
npm run build

# Use the built version
./dist/index.js --help
```

## 📖 Usage

### Starting the Services

1. **Activate Python Virtual Environment**
```bash
cd ai-service
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows
```

2. **Start Ollama (LLM Service)**
```bash
# Start Ollama service (if not already running)
ollama serve

# In another terminal, verify it's running
ollama list
```

3. **Start AI Service**
```bash
# Navigate to AI service source directory
cd src

# Start the FastAPI server
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

4. **Setup Framework (in new terminal)**
```bash
# Navigate to project root
cd ../../

# Activate virtual environment
cd ai-service
source venv/bin/activate

# Run setup
python setup.py
```

5. **Use CLI Tool**
```bash
# Build CLI tool (if not already built)
cd ../cli-tool
npm run build

# Use the CLI
./dist/index.js --help
./dist/index.js setup
./dist/index.js generate "test login functionality"
```

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

ai-test search "" 