"""
FastAPI Server for AI Test Automation Service

This module provides HTTP endpoints for the AI-powered test automation service.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import sys

# Add the src directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import with try/except to handle missing dependencies gracefully
try:
    from ai_service import AIService
    AI_SERVICE_AVAILABLE = True
except ImportError as e:
    print(f"Warning: AI Service not available due to missing dependencies: {e}")
    AI_SERVICE_AVAILABLE = False
    AIService = None

# Initialize FastAPI app
app = FastAPI(
    title="AI Test Automation Service",
    description="AI-powered test generation and analysis using LLM and RAG",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service only if available
ai_service = None
if AI_SERVICE_AVAILABLE:
    try:
        # Get the project root (two levels up from src)
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        ai_service = AIService(
            codebase_path=project_root,
            db_path="./chroma_db",
            ollama_url="http://localhost:11434",
            ollama_model="mistral"
        )
    except Exception as e:
        print(f"Warning: Failed to initialize AI service: {e}")

# Pydantic models for request/response
class SetupRequest(BaseModel):
    codebase_path: Optional[str] = None

class GenerateTestRequest(BaseModel):
    requirements: str
    context_query: Optional[str] = None

class ModifyTestRequest(BaseModel):
    file_path: str
    modification_request: str

class SearchRequest(BaseModel):
    query: str
    n_results: int = 10

class SaveTestRequest(BaseModel):
    code: str
    test_name: str
    output_dir: str = "tests"

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Test Automation Service",
        "version": "1.0.0",
        "ai_service_available": AI_SERVICE_AVAILABLE
    }

# Setup endpoint
@app.post("/setup")
async def setup_service(request: SetupRequest):
    """Setup the AI service (index codebase, check LLM)."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        if request.codebase_path:
            ai_service.codebase_path = request.codebase_path
        
        result = ai_service.setup()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Generate test endpoint
@app.post("/generate-test")
async def generate_test(request: GenerateTestRequest):
    """Generate a test based on requirements and codebase context."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        result = ai_service.generate_test(
            requirements=request.requirements,
            context_query=request.context_query
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Modify test endpoint
@app.post("/modify-test")
async def modify_test(request: ModifyTestRequest):
    """Modify an existing test file."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        result = ai_service.modify_test(
            file_path=request.file_path,
            modification_request=request.modification_request
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analyze test endpoint
@app.get("/analyze-test/{file_path:path}")
async def analyze_test(file_path: str):
    """Analyze a test file and provide suggestions."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        result = ai_service.analyze_test(file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Search tests endpoint
@app.post("/search-tests")
async def search_tests(request: SearchRequest):
    """Search for relevant tests in the codebase."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        results = ai_service.search_tests(
            query=request.query,
            n_results=request.n_results
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get codebase stats endpoint
@app.get("/codebase-stats")
async def get_codebase_stats():
    """Get statistics about the indexed codebase."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        stats = ai_service.get_codebase_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Validate code endpoint
@app.post("/validate-code")
async def validate_code(code: str):
    """Validate generated code."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        result = ai_service.validate_generated_code(code)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Save test endpoint
@app.post("/save-test")
async def save_test(request: SaveTestRequest):
    """Save generated test to file."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        result = ai_service.save_generated_test(
            code=request.code,
            test_name=request.test_name,
            output_dir=request.output_dir
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LLM health check endpoint
@app.get("/llm-health")
async def llm_health_check():
    """Check LLM service health."""
    if not AI_SERVICE_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Service not available - missing dependencies")
    
    try:
        result = ai_service.llm.health_check()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 