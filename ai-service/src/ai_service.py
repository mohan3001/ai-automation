"""
Main AI Service for Test Automation

This module combines RAG (Retrieval-Augmented Generation) with LLM for
intelligent test generation and analysis.
"""

from typing import Dict, Any, List, Optional
from pathlib import Path
import json
import os
import sys

# Add the current directory to the path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import with error handling
try:
    from rag.code_indexer import CodeIndexer
    from llm.ollama_service import OllamaService
    IMPORTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Some imports failed: {e}")
    IMPORTS_AVAILABLE = False
    CodeIndexer = None
    OllamaService = None


class AIService:
    """Main AI service for test automation."""
    
    def __init__(self, 
                 codebase_path: str,
                 db_path: str = "./chroma_db",
                 ollama_url: str = "http://localhost:11434",
                 ollama_model: str = "mistral"):
        
        if not IMPORTS_AVAILABLE:
            raise ImportError("Required modules not available. Check dependencies.")
        
        self.codebase_path = Path(codebase_path)
        self.db_path = db_path
        
        # Initialize components
        try:
            self.indexer = CodeIndexer(db_path)
            self.llm = OllamaService(ollama_url, ollama_model)
        except Exception as e:
            raise RuntimeError(f"Failed to initialize AI service components: {e}")
        
        # Service status
        self._indexed = False
    
    def setup(self) -> Dict[str, Any]:
        """Setup the AI service (index codebase, check LLM)."""
        results = {
            "llm_status": self.llm.health_check(),
            "indexing_status": None,
            "overall_status": "unknown"
        }
        
        # Check LLM status
        if results["llm_status"]["status"] != "healthy":
            results["overall_status"] = "llm_unavailable"
            return results
        
        # Index codebase
        try:
            indexing_result = self.indexer.index_codebase(str(self.codebase_path))
            results["indexing_status"] = indexing_result
            self._indexed = True
            results["overall_status"] = "ready"
        except Exception as e:
            results["indexing_status"] = {"error": str(e)}
            results["overall_status"] = "indexing_failed"
        
        return results
    
    def generate_test(self, requirements: str, context_query: Optional[str] = None) -> Dict[str, Any]:
        """Generate a test based on requirements and codebase context."""
        if not self._indexed:
            return {
                "success": False,
                "error": "Codebase not indexed. Run setup() first."
            }
        
        # Get relevant context from codebase
        if context_query:
            search_query = context_query
        else:
            search_query = requirements
        
        context_chunks = self.indexer.search(search_query, n_results=5)
        context_text = self._format_context(context_chunks)
        
        # Generate test using LLM
        result = self.llm.generate_test(context_text, requirements)
        
        if result["success"]:
            result["context_used"] = context_chunks
            result["context_query"] = search_query
        
        return result
    
    def modify_test(self, file_path: str, modification_request: str) -> Dict[str, Any]:
        """Modify an existing test file."""
        if not self._indexed:
            return {
                "success": False,
                "error": "Codebase not indexed. Run setup() first."
            }
        
        # Read the original file
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_code = f.read()
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to read file {file_path}: {str(e)}"
            }
        
        # Get context about similar tests
        context_chunks = self.indexer.search(f"test file {file_path}", n_results=3)
        context_text = self._format_context(context_chunks)
        
        # Modify the test
        result = self.llm.modify_test(original_code, modification_request)
        
        if result["success"]:
            result["original_file"] = file_path
            result["context_used"] = context_chunks
        
        return result
    
    def analyze_test(self, file_path: str) -> Dict[str, Any]:
        """Analyze a test file and provide suggestions."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to read file {file_path}: {str(e)}"
            }
        
        return self.llm.analyze_code(code)
    
    def search_tests(self, query: str, n_results: int = 10) -> List[Dict[str, Any]]:
        """Search for relevant tests in the codebase."""
        if not self._indexed:
            return []
        
        return self.indexer.search(query, n_results)
    
    def get_codebase_stats(self) -> Dict[str, Any]:
        """Get statistics about the indexed codebase."""
        if not self._indexed:
            return {"error": "Codebase not indexed"}
        
        return self.indexer.get_collection_stats()
    
    def _format_context(self, chunks: List[Dict[str, Any]]) -> str:
        """Format context chunks for LLM prompt."""
        if not chunks:
            return "No relevant context found."
        
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            metadata = chunk.get("metadata", {})
            file_path = metadata.get("file_path", "unknown")
            node_type = metadata.get("node_type", "unknown")
            
            context_parts.append(f"""
--- Context {i} (from {file_path}, type: {node_type}) ---
{chunk["content"]}
""")
        
        return "\n".join(context_parts)
    
    def validate_generated_code(self, code: str) -> Dict[str, Any]:
        """Basic validation of generated code."""
        validation_result = {
            "valid": True,
            "issues": [],
            "warnings": []
        }
        
        # Check for basic TypeScript/Playwright patterns
        if "import" not in code and "require" not in code:
            validation_result["warnings"].append("No imports found - may need Playwright imports")
        
        if "test(" not in code and "it(" not in code:
            validation_result["issues"].append("No test function found")
            validation_result["valid"] = False
        
        if "expect(" not in code and "assert(" not in code:
            validation_result["warnings"].append("No assertions found")
        
        if "page." not in code:
            validation_result["warnings"].append("No page interactions found")
        
        # Check for common syntax issues
        if code.count("{") != code.count("}"):
            validation_result["issues"].append("Mismatched braces")
            validation_result["valid"] = False
        
        if code.count("(") != code.count(")"):
            validation_result["issues"].append("Mismatched parentheses")
            validation_result["valid"] = False
        
        return validation_result
    
    def save_generated_test(self, 
                          code: str, 
                          test_name: str, 
                          output_dir: str = "tests") -> Dict[str, Any]:
        """Save generated test to file."""
        try:
            # Create output directory if it doesn't exist
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Generate filename
            safe_name = "".join(c for c in test_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_name = safe_name.replace(' ', '-').lower()
            filename = f"{safe_name}.spec.ts"
            file_path = output_path / filename
            
            # Write the file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(code)
            
            return {
                "success": True,
                "file_path": str(file_path),
                "filename": filename
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to save test: {str(e)}"
            } 