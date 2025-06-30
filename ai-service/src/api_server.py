"""
FastAPI Server for AI Test Automation Service

This module exposes the AI service as an HTTP API for the CLI tool to consume.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from ai_service import AIService

app = FastAPI(
    title="AI Test Automation API",
    description="HTTP API for AI-powered test generation and analysis",
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

# Global AI service instance
ai_service: Optional[AIService] = None


class SetupRequest(BaseModel):
    codebase_path: str = "."
    db_path: str = "./chroma_db"
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "mistral"


class GenerateTestRequest(BaseModel):
    requirements: str
    context_query: Optional[str] = None
    output_dir: str = "tests"


class ModifyTestRequest(BaseModel):
    file_path: str
    modification_request: str


class SearchRequest(BaseModel):
    query: str
    n_results: int = 10


@app.on_event("startup")
async def startup_event():
    """Initialize the AI service on startup."""
    global ai_service
    # Service will be initialized when setup is called
    ai_service = None


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Test Automation API",
        "version": "1.0.0",
        "status": "running"
    }


@app.post("/setup")
async def setup_service(request: SetupRequest):
    """Setup the AI service and index codebase."""
    global ai_service
    
    try:
        ai_service = AIService(
            codebase_path=request.codebase_path,
            db_path=request.db_path,
            ollama_url=request.ollama_url,
            ollama_model=request.ollama_model
        )
        
        result = ai_service.setup()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate")
async def generate_test(request: GenerateTestRequest):
    """Generate a new test."""
    global ai_service
    
    if ai_service is None:
        raise HTTPException(status_code=400, detail="Service not initialized. Call /setup first.")
    
    try:
        result = ai_service.generate_test(
            requirements=request.requirements,
            context_query=request.context_query
        )
        
        if result["success"]:
            # Validate the generated code
            validation = ai_service.validate_generated_code(result["content"])
            result["validation"] = validation
            
            # Save the test if validation passes
            if validation["valid"]:
                save_result = ai_service.save_generated_test(
                    code=result["content"],
                    test_name=request.requirements,
                    output_dir=request.output_dir
                )
                result["saved"] = save_result
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/modify")
async def modify_test(request: ModifyTestRequest):
    """Modify an existing test."""
    global ai_service
    
    if ai_service is None:
        raise HTTPException(status_code=400, detail="Service not initialized. Call /setup first.")
    
    try:
        result = ai_service.modify_test(
            file_path=request.file_path,
            modification_request=request.modification_request
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze_test(file_path: str):
    """Analyze a test file."""
    global ai_service
    
    if ai_service is None:
        raise HTTPException(status_code=400, detail="Service not initialized. Call /setup first.")
    
    try:
        result = ai_service.analyze_test(file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
async def search_tests(request: SearchRequest):
    """Search for tests in codebase."""
    global ai_service
    
    if ai_service is None:
        raise HTTPException(status_code=400, detail="Service not initialized. Call /setup first.")
    
    try:
        results = ai_service.search_tests(
            query=request.query,
            n_results=request.n_results
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
async def get_status():
    """Get service status."""
    global ai_service
    
    if ai_service is None:
        return {
            "status": "not_initialized",
            "message": "Service not initialized. Call /setup first."
        }
    
    try:
        llm_status = ai_service.llm.health_check()
        codebase_stats = ai_service.get_codebase_stats()
        
        return {
            "status": "ready",
            "llm": llm_status,
            "codebase": codebase_stats
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 