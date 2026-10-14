
import numpy as np
import json
from uuid import uuid4
from pathlib import Path
from typing import List, Dict

# Assuming these are your service and utility locations
from services.llm_client import get_embeddings
from services.heading_extraction import extract_sections_from_pdf_bytes
# --- Configuration ---
# Define the path for the persistent JSON data store
DATA_DIR = Path("data")
SECTIONS_JSON_PATH = DATA_DIR / "sections.json"

# In-memory stores for fast searching
VECTOR_STORE = []
METADATA_STORE = []

# --- Data Persistence Functions ---

def save_sections_to_json(all_data: List[Dict]) -> None:
    """Saves the complete list of sections to the JSON file."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(SECTIONS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

def load_sections_from_json() -> List[Dict]:
    """Loads all sections from the JSON file."""
    if not SECTIONS_JSON_PATH.exists() or SECTIONS_JSON_PATH.stat().st_size == 0:
        return []
    try:
        with open(SECTIONS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def rebuild_in_memory_store_from_json() -> None:
    """Clears and rebuilds the in-memory vector store from the JSON file."""
    global VECTOR_STORE, METADATA_STORE
    
    all_data = load_sections_from_json()
    
    VECTOR_STORE.clear()
    METADATA_STORE.clear()
    
    for item in all_data:
        # Ensure embedding is a numpy array for consistency
        VECTOR_STORE.append(np.array(item['embedding'], dtype="float32"))
        # Store all other data as metadata
        metadata = {k: v for k, v in item.items() if k != 'embedding'}
        METADATA_STORE.append(metadata)
    
    print(f"✅ In-memory store rebuilt. Total sections: {len(VECTOR_STORE)}")

# --- Core PDF Processing Logic ---

async def process_and_index_pdf(pdf_bytes: bytes, original_filename: str) -> Dict:
    """
    Processes a PDF from bytes, generates embeddings, and saves to the persistent store.
    """
    print(f"Processing PDF: {original_filename}")
    
    # 1. Extract structured sections (heading, content, page) from the PDF bytes.
    sections = extract_sections_from_pdf_bytes(pdf_bytes)
    if not sections:
        return {"status": "No content sections found in PDF."}

    # 2. Filter out any sections that have no actual text content.
    valid_sections = [sec for sec in sections if sec.get("content", "").strip()]
    if not valid_sections:
        return {"status": "No valid text sections found to index."}
    
    print(f"Extracted {len(valid_sections)} valid sections. Generating embeddings...")

    # 3. Generate embeddings for the content of each valid section.
    texts_to_embed = [sec.get("content", "") for sec in valid_sections]
    embeddings = get_embeddings(texts_to_embed)
    
    if not embeddings or len(embeddings) != len(valid_sections):
        raise Exception("Failed to generate embeddings for all sections.")

    print("Embeddings created. Updating data store...")

    # 4. Update the persistent JSON store.
    # First, load all existing data.
    all_data = load_sections_from_json()
    # Then, remove any old entries from the same PDF to prevent duplicates.
    all_data = [d for d in all_data if d.get("pdf_name") != original_filename]

    # Add the new, processed sections to the data list.
    for section, embedding in zip(valid_sections, embeddings):
        record = {
            "id": str(uuid4()),
            "pdf_name": original_filename,
            "heading": section.get("heading", ""),
            "content": section.get("content", ""),
            "page": section.get("page", 0),
            "embedding": embedding # Storing as a list, will be converted to numpy array on load
        }
        all_data.append(record)
    
    # 5. Save the updated data back to the JSON file.
    save_sections_to_json(all_data)
    # Finally, refresh the in-memory store with the latest data.
    rebuild_in_memory_store_from_json()
    
    return {
        "status": "success",
        "filename": original_filename,
        "sections_indexed": len(valid_sections),
    }

# --- Public API Function ---

async def handle_pdf_upload(file):
    """
    Main entry point for handling a PDF file upload. It reads the file,
    triggers the processing and indexing, and returns the result.
    """
    try:
        pdf_bytes = await file.read()
        original_filename = file.filename
        
        result = await process_and_index_pdf(pdf_bytes, original_filename)
        return result

    except Exception as e:
        print(f"❌ Error handling upload for {file.filename}: {str(e)}")
        # Re-raise or return a structured error response
        raise e

# --- Search Functionality ---

def search_similar_sections(query_embedding: np.ndarray, top_k: int = 5, exclude_pdf: str = None) -> List[Dict]:
    """
    Performs a semantic search against the in-memory vector store.
    """
    if not VECTOR_STORE:
        print("Warning: In-memory store is empty. Search may yield no results.")
        return []

    from sklearn.metrics.pairwise import cosine_similarity
    
    query_embedding = np.array(query_embedding).reshape(1, -1)
    similarities = cosine_similarity(query_embedding, np.array(VECTOR_STORE)).flatten()

    results = []
    for i, score in enumerate(similarities):
        # Optional: exclude results from a specific PDF
        if exclude_pdf and METADATA_STORE[i].get("pdf_name") == exclude_pdf:
            continue
        
        result = METADATA_STORE[i].copy()
        result['score'] = float(score)
        results.append(result)

    # Sort results by similarity score and return the top K
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]

# --- Initial Load ---
# Load all existing data from the JSON file into the in-memory store when the application starts.
rebuild_in_memory_store_from_json()
