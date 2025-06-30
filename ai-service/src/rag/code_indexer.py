"""
Code Indexer for RAG (Retrieval-Augmented Generation)

This module handles indexing of code files for context-aware test generation.
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import tree_sitter
from tree_sitter import Language, Parser
import markdown


class CodeIndexer:
    """Indexes code files for RAG-based test generation."""
    
    def __init__(self, db_path: str = "./chroma_db"):
        self.db_path = db_path
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(
            name="codebase",
            metadata={"description": "Indexed codebase for test generation"}
        )
        
        # Initialize sentence transformer for embeddings
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Setup tree-sitter for code parsing
        self._setup_tree_sitter()
        
        # File extensions to index
        self.code_extensions = {'.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.cs'}
        self.doc_extensions = {'.md', '.txt', '.rst'}
        self.config_extensions = {'.json', '.yaml', '.yml', '.toml', '.ini'}
        
        # Directories to exclude
        self.exclude_dirs = {
            'node_modules', 'dist', 'build', '.git', '__pycache__', 
            '.pytest_cache', '.venv', 'venv', 'env', '.env'
        }
    
    def _setup_tree_sitter(self):
        """Setup tree-sitter for code parsing."""
        try:
            # Try to load existing languages
            self.ts_lang = Language('build/languages.so', 'typescript')
            self.js_lang = Language('build/languages.so', 'javascript')
            self.py_lang = Language('build/languages.so', 'python')
        except:
            # Build languages if not available
            Language.build_library(
                'build/languages.so',
                [
                    'vendor/tree-sitter-typescript',
                    'vendor/tree-sitter-javascript', 
                    'vendor/tree-sitter-python'
                ]
            )
            self.ts_lang = Language('build/languages.so', 'typescript')
            self.js_lang = Language('build/languages.so', 'javascript')
            self.py_lang = Language('build/languages.so', 'python')
        
        self.parser = Parser()
    
    def index_codebase(self, root_path: str) -> Dict[str, Any]:
        """Index the entire codebase."""
        root_path = Path(root_path)
        indexed_files = []
        total_chunks = 0
        
        print(f"🔍 Indexing codebase at: {root_path}")
        
        for file_path in root_path.rglob('*'):
            if file_path.is_file() and not self._should_exclude(file_path):
                try:
                    chunks = self._process_file(file_path)
                    if chunks:
                        self._add_to_collection(file_path, chunks)
                        indexed_files.append(str(file_path))
                        total_chunks += len(chunks)
                        print(f"  ✅ Indexed: {file_path.name} ({len(chunks)} chunks)")
                except Exception as e:
                    print(f"  ❌ Error indexing {file_path}: {e}")
        
        print(f"🎯 Indexing complete: {len(indexed_files)} files, {total_chunks} chunks")
        
        return {
            "indexed_files": indexed_files,
            "total_chunks": total_chunks,
            "collection_size": self.collection.count()
        }
    
    def _should_exclude(self, file_path: Path) -> bool:
        """Check if file should be excluded from indexing."""
        # Check if any parent directory is in exclude list
        for parent in file_path.parents:
            if parent.name in self.exclude_dirs:
                return True
        
        # Check file extension
        extension = file_path.suffix.lower()
        return not (
            extension in self.code_extensions or
            extension in self.doc_extensions or
            extension in self.config_extensions
        )
    
    def _process_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """Process a single file and extract chunks."""
        extension = file_path.suffix.lower()
        
        try:
            content = file_path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            return []
        
        if extension in self.code_extensions:
            return self._process_code_file(file_path, content)
        elif extension in self.doc_extensions:
            return self._process_doc_file(file_path, content)
        elif extension in self.config_extensions:
            return self._process_config_file(file_path, content)
        
        return []
    
    def _process_code_file(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """Process code files with syntax-aware chunking."""
        chunks = []
        
        # Set appropriate language for parser
        if file_path.suffix in {'.ts', '.tsx'}:
            self.parser.set_language(self.ts_lang)
        elif file_path.suffix in {'.js', '.jsx'}:
            self.parser.set_language(self.js_lang)
        elif file_path.suffix == '.py':
            self.parser.set_language(self.py_lang)
        
        try:
            tree = self.parser.parse(bytes(content, 'utf8'))
            chunks = self._extract_code_chunks(tree, content, file_path)
        except Exception as e:
            # Fallback to simple chunking if parsing fails
            chunks = self._simple_chunking(content, file_path)
        
        return chunks
    
    def _extract_code_chunks(self, tree, content: str, file_path: Path) -> List[Dict[str, Any]]:
        """Extract meaningful chunks from parsed code."""
        chunks = []
        
        # Extract functions, classes, and important code blocks
        cursor = tree.walk()
        
        while cursor.goto_next_sibling():
            node = cursor.node
            
            if node.type in ['function_declaration', 'class_declaration', 'method_definition']:
                chunk_text = content[node.start_byte:node.end_byte]
                if len(chunk_text.strip()) > 50:  # Minimum meaningful size
                    chunks.append({
                        "content": chunk_text,
                        "type": node.type,
                        "start_line": node.start_point[0] + 1,
                        "end_line": node.end_point[0] + 1,
                        "metadata": {
                            "file_path": str(file_path),
                            "node_type": node.type,
                            "language": file_path.suffix[1:]
                        }
                    })
        
        return chunks
    
    def _simple_chunking(self, content: str, file_path: Path) -> List[Dict[str, Any]]:
        """Simple chunking for files that can't be parsed."""
        chunks = []
        lines = content.split('\n')
        chunk_size = 50  # lines per chunk
        
        for i in range(0, len(lines), chunk_size):
            chunk_lines = lines[i:i + chunk_size]
            chunk_text = '\n'.join(chunk_lines)
            
            if chunk_text.strip():
                chunks.append({
                    "content": chunk_text,
                    "type": "text_chunk",
                    "start_line": i + 1,
                    "end_line": min(i + chunk_size, len(lines)),
                    "metadata": {
                        "file_path": str(file_path),
                        "node_type": "text_chunk",
                        "language": file_path.suffix[1:] if file_path.suffix else "text"
                    }
                })
        
        return chunks
    
    def _process_doc_file(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """Process documentation files."""
        if file_path.suffix == '.md':
            # Convert markdown to plain text
            content = markdown.markdown(content)
        
        return self._simple_chunking(content, file_path)
    
    def _process_config_file(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """Process configuration files."""
        return self._simple_chunking(content, file_path)
    
    def _add_to_collection(self, file_path: Path, chunks: List[Dict[str, Any]]):
        """Add chunks to ChromaDB collection."""
        for i, chunk in enumerate(chunks):
            chunk_id = f"{file_path}_{i}"
            
            # Generate embedding
            embedding = self.embedder.encode(chunk["content"]).tolist()
            
            # Add to collection
            self.collection.add(
                embeddings=[embedding],
                documents=[chunk["content"]],
                metadatas=[chunk["metadata"]],
                ids=[chunk_id]
            )
    
    def search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant code chunks."""
        query_embedding = self.embedder.encode(query).tolist()
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        return [
            {
                "content": doc,
                "metadata": metadata,
                "distance": distance
            }
            for doc, metadata, distance in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            )
        ]
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the indexed collection."""
        return {
            "total_chunks": self.collection.count(),
            "collection_name": self.collection.name,
            "metadata": self.collection.metadata
        } 