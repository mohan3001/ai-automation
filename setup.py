#!/usr/bin/env python3
"""
Setup script for AI Test Automation Framework

This script initializes the AI service and indexes the codebase.
"""

import sys
import os
from pathlib import Path

# Add the ai-service to Python path
sys.path.insert(0, str(Path(__file__).parent / "ai-service" / "src"))

from ai_service import AIService


def main():
    """Main setup function."""
    print("🤖 Setting up AI Test Automation Framework...")
    
    # Get codebase path (default to current directory)
    codebase_path = Path.cwd()
    
    # Initialize AI service
    ai_service = AIService(
        codebase_path=str(codebase_path),
        db_path="./chroma_db",
        ollama_url="http://localhost:11434",
        ollama_model="mistral"
    )
    
    print(f"📁 Codebase path: {codebase_path}")
    print("🔍 Setting up AI service...")
    
    # Setup the service
    result = ai_service.setup()
    
    # Display results
    print("\n📊 Setup Results:")
    print("=" * 50)
    
    # LLM Status
    llm_status = result.get("llm_status", {})
    if llm_status.get("status") == "healthy":
        print("✅ LLM Service: Healthy")
        print(f"   Model: {llm_status.get('model', 'unknown')}")
        print(f"   Available models: {', '.join(llm_status.get('available_models', []))}")
    else:
        print("❌ LLM Service: Unavailable")
        print(f"   Error: {llm_status.get('error', 'Unknown error')}")
    
    # Indexing Status
    indexing_status = result.get("indexing_status")
    if indexing_status and "error" not in indexing_status:
        print("✅ Codebase Indexing: Complete")
        print(f"   Files indexed: {indexing_status.get('indexed_files', 0)}")
        print(f"   Total chunks: {indexing_status.get('total_chunks', 0)}")
    else:
        print("❌ Codebase Indexing: Failed")
        if indexing_status:
            print(f"   Error: {indexing_status.get('error', 'Unknown error')}")
    
    # Overall Status
    overall_status = result.get("overall_status")
    if overall_status == "ready":
        print("\n🎉 Setup completed successfully!")
        print("You can now use the AI service for test generation.")
    else:
        print(f"\n⚠️  Setup completed with issues: {overall_status}")
        print("Please check the errors above and try again.")
    
    return 0 if overall_status == "ready" else 1


if __name__ == "__main__":
    sys.exit(main()) 