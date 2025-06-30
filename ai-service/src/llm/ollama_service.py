"""
Ollama LLM Service for Test Generation

This module provides integration with Ollama for local LLM-based test generation.
"""

import requests
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import time


class OllamaResponse(BaseModel):
    """Response model for Ollama API."""
    model: str
    created_at: str
    response: str
    done: bool
    context: Optional[List[int]] = None
    total_duration: Optional[int] = None
    load_duration: Optional[int] = None
    prompt_eval_count: Optional[int] = None
    prompt_eval_duration: Optional[int] = None
    eval_count: Optional[int] = None
    eval_duration: Optional[int] = None


class OllamaService:
    """Service for interacting with Ollama LLM."""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "mistral"):
        self.base_url = base_url.rstrip('/')
        self.model = model
        self.session = requests.Session()
        self.session.timeout = 60  # 60 seconds timeout
    
    def is_available(self) -> bool:
        """Check if Ollama is running and accessible."""
        try:
            response = self.session.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def get_models(self) -> List[str]:
        """Get list of available models."""
        try:
            response = self.session.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                return [model["name"] for model in data.get("models", [])]
            return []
        except requests.RequestException:
            return []
    
    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate response from Ollama."""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            **kwargs
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/generate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "content": data.get("response", ""),
                    "metadata": {
                        "model": data.get("model"),
                        "total_duration": data.get("total_duration"),
                        "eval_count": data.get("eval_count"),
                        "prompt_eval_count": data.get("prompt_eval_count")
                    }
                }
            else:
                return {
                    "success": False,
                    "content": "",
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except requests.RequestException as e:
            return {
                "success": False,
                "content": "",
                "error": f"Request failed: {str(e)}"
            }
    
    def generate_test(self, context: str, requirements: str) -> Dict[str, Any]:
        """Generate test code based on context and requirements."""
        prompt = self._build_test_generation_prompt(context, requirements)
        return self.generate(prompt)
    
    def analyze_code(self, code: str) -> Dict[str, Any]:
        """Analyze code and provide suggestions."""
        prompt = self._build_code_analysis_prompt(code)
        return self.generate(prompt)
    
    def modify_test(self, original_code: str, modification_request: str) -> Dict[str, Any]:
        """Modify existing test code based on request."""
        prompt = self._build_test_modification_prompt(original_code, modification_request)
        return self.generate(prompt)
    
    def _build_test_generation_prompt(self, context: str, requirements: str) -> str:
        """Build prompt for test generation."""
        return f"""
You are an expert test automation engineer. Generate a Playwright test based on the following context and requirements.

CONTEXT (existing codebase patterns):
{context}

REQUIREMENTS:
{requirements}

Generate a complete Playwright test that:
1. Follows the existing code patterns and conventions
2. Uses proper TypeScript syntax
3. Includes meaningful test descriptions
4. Has proper assertions and error handling
5. Uses Page Object Model if applicable
6. Follows best practices for test automation

Return only the TypeScript test code, no explanations or markdown formatting.
"""
    
    def _build_code_analysis_prompt(self, code: str) -> str:
        """Build prompt for code analysis."""
        return f"""
You are an expert code reviewer. Analyze the following test code and provide suggestions for improvement.

CODE:
{code}

Please provide:
1. Code quality improvements
2. Better selectors or locators
3. Performance optimizations
4. Maintainability suggestions
5. Best practices recommendations

Be specific and actionable. Format your response as a structured list.
"""
    
    def _build_test_modification_prompt(self, original_code: str, modification_request: str) -> str:
        """Build prompt for test modification."""
        return f"""
You are an expert test automation engineer. Modify the following test code based on the request.

ORIGINAL CODE:
{original_code}

MODIFICATION REQUEST:
{modification_request}

Please modify the code to:
1. Address the modification request
2. Maintain existing code structure and patterns
3. Keep all existing functionality
4. Follow the same coding style
5. Ensure the test remains valid and executable

Return only the modified TypeScript code, no explanations.
"""
    
    def health_check(self) -> Dict[str, Any]:
        """Perform a health check on the Ollama service."""
        try:
            # Check if service is available
            if not self.is_available():
                return {
                    "status": "unavailable",
                    "error": "Ollama service is not running or accessible"
                }
            
            # Check if model is available
            models = self.get_models()
            if self.model not in models:
                return {
                    "status": "model_not_found",
                    "error": f"Model '{self.model}' not found. Available models: {models}",
                    "available_models": models
                }
            
            # Test generation
            test_response = self.generate("Hello, this is a test.")
            if not test_response["success"]:
                return {
                    "status": "generation_failed",
                    "error": test_response.get("error", "Unknown error")
                }
            
            return {
                "status": "healthy",
                "model": self.model,
                "base_url": self.base_url,
                "available_models": models
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            } 