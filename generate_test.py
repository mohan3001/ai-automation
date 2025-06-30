#!/usr/bin/env python3
"""
Test Generation Script

This script generates tests using the AI service.
"""

import sys
import argparse
from pathlib import Path

# Add the ai-service to Python path
sys.path.insert(0, str(Path(__file__).parent / "ai-service" / "src"))

from ai_service import AIService


def main():
    """Main function for test generation."""
    parser = argparse.ArgumentParser(description="Generate tests using AI")
    parser.add_argument("requirements", help="Test requirements in natural language")
    parser.add_argument("-c", "--context", help="Additional context for generation")
    parser.add_argument("-o", "--output", default="tests", help="Output directory")
    parser.add_argument("--no-approval", action="store_true", help="Skip approval workflow")
    
    args = parser.parse_args()
    
    print("🤖 Generating test with AI...")
    print(f"📝 Requirements: {args.requirements}")
    
    # Initialize AI service
    ai_service = AIService(
        codebase_path=".",
        db_path="./chroma_db",
        ollama_url="http://localhost:11434",
        ollama_model="mistral"
    )
    
    # Generate test
    result = ai_service.generate_test(
        requirements=args.requirements,
        context_query=args.context
    )
    
    if not result["success"]:
        print(f"❌ Failed to generate test: {result.get('error', 'Unknown error')}")
        return 1
    
    # Validate generated code
    validation = ai_service.validate_generated_code(result["content"])
    
    print("\n📄 Generated Test Code:")
    print("=" * 50)
    print(result["content"])
    print("=" * 50)
    
    # Show validation results
    if validation["issues"]:
        print("\n❌ Validation Issues:")
        for issue in validation["issues"]:
            print(f"   - {issue}")
    
    if validation["warnings"]:
        print("\n⚠️  Validation Warnings:")
        for warning in validation["warnings"]:
            print(f"   - {warning}")
    
    if validation["valid"]:
        print("\n✅ Code validation passed!")
        
        # Ask for approval if not skipped
        if not args.no_approval:
            approval = input("\n🤔 Do you want to save this test? (y/N): ").lower().strip()
            if approval not in ['y', 'yes']:
                print("❌ Test generation cancelled.")
                return 0
        
        # Save the test
        save_result = ai_service.save_generated_test(
            code=result["content"],
            test_name=args.requirements,
            output_dir=args.output
        )
        
        if save_result["success"]:
            print(f"✅ Test saved to: {save_result['file_path']}")
        else:
            print(f"❌ Failed to save test: {save_result.get('error', 'Unknown error')}")
            return 1
    else:
        print("\n❌ Code validation failed. Please review the issues above.")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main()) 