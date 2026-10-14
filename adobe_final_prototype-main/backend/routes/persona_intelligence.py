# routes/persona_intelligence.py
from __future__ import annotations
import asyncio
import unicodedata
from typing import List

import fitz  # PyMuPDF
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, validator

# Assuming your semantic analysis function is in a utils directory
# If it's located elsewhere, you may need to adjust this import path.
from utils.semantic_utils import analyze_documents


# --- ROUTER DEFINITION ---
# The prefix is handled in main.py, so we only define tags here.
router = APIRouter(tags=["Persona Analysis"])


# --- HELPER FUNCTIONS ---

def _sanitize_unicode(text: str) -> str:
    """Clean and normalize Unicode text to prevent encoding issues."""
    if not isinstance(text, str):
        text = str(text)
    
    text = unicodedata.normalize('NFC', text)
    
    replacements = {
        '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
        '\u2013': '-', '\u2014': '-', '\u2026': '...', '\u00A0': ' ',
        '\u2022': '•', '\u00AD': '',
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    text = ''.join(
        char for char in text
        if unicodedata.category(char) not in ['Cc', 'Cf'] or char in '\n\r\t '
    )
    
    try:
        text.encode('utf-8')
        return text
    except UnicodeEncodeError:
        return text.encode('utf-8', errors='replace').decode('utf-8')


def _validate_pdf_file(pdf_bytes: bytes, filename: str) -> None:
    """Validate that the file is a proper PDF."""
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail=f"File {filename} is empty.")
    if not pdf_bytes.startswith(b'%PDF'):
        raise HTTPException(status_code=400, detail=f"File {filename} is not a valid PDF.")
    if len(pdf_bytes) < 100:
        raise HTTPException(status_code=400, detail=f"File {filename} appears to be corrupted.")


async def _read_pdf(upload: UploadFile) -> str:
    """Extract text from an uploaded PDF using PyMuPDF with robust Unicode handling."""
    filename = upload.filename or "unknown_file"
    
    try:
        pdf_bytes = await upload.read()
        _validate_pdf_file(pdf_bytes, filename)
        
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        text_parts = []
        successful_pages = 0
        
        try:
            for page_num, page in enumerate(doc):
                try:
                    page_text = page.get_text("text")
                    if page_text and page_text.strip():
                        clean_text = _sanitize_unicode(page_text.strip())
                        if len(clean_text) > 10:
                            text_parts.append(clean_text)
                            successful_pages += 1
                except Exception as page_error:
                    print(f"Warning: Error processing page {page_num + 1} of {filename}: {page_error}")
        finally:
            doc.close()
            
        if not text_parts:
            raise HTTPException(status_code=400, detail=f"No readable text found in {filename}.")
            
        final_text = "\n\n".join(text_parts).strip()
        
        if len(final_text) < 50:
            raise HTTPException(status_code=400, detail=f"Very little text was extracted from {filename}.")
            
        print(f"Successfully extracted {len(final_text)} characters from {successful_pages} pages of {filename}")
        return final_text

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error processing {filename}: {_sanitize_unicode(str(e))}")


# --- PYDANTIC MODELS ---

class PersonaResponse(BaseModel):
    persona: str
    task: str
    documents: List[dict]
    summary: str
    
    @validator('persona', 'task', 'summary', pre=True)
    def sanitize_strings(cls, v):
        return _sanitize_unicode(str(v)) if v is not None else ""
    
    @validator('documents', pre=True, each_item=True)
    def sanitize_documents(cls, v):
        if isinstance(v, dict):
            return {k: _sanitize_unicode(val) if isinstance(val, str) else val for k, val in v.items()}
        return v


# --- API ENDPOINT ---

@router.post("/persona-intelligence", response_model=PersonaResponse)
async def persona_intelligence(
    persona: str = Form(...),
    task: str = Form(...),
    files: List[UploadFile] = File(...),
):
    """
    Uploads PDF documents, a persona, and a task to receive a structured analysis,
    including per-document highlights and a final synthesis.
    """
    if not files:
        raise HTTPException(status_code=422, detail="No files were provided.")

    sanitized_persona = _sanitize_unicode(persona)
    sanitized_task = _sanitize_unicode(task)

    tasks = [_read_pdf(f) for f in files]
    extracted_texts = await asyncio.gather(*tasks, return_exceptions=True)

    docs = []
    for i, result in enumerate(extracted_texts):
        file = files[i]
        filename = _sanitize_unicode(file.filename or "document")
        
        if isinstance(result, Exception):
            if isinstance(result, HTTPException):
                raise result
            else:
                raise HTTPException(status_code=500, detail=f"Error processing {filename}: {_sanitize_unicode(str(result))}")
        elif result and result.strip():
            docs.append({"name": filename, "text": result})

    if not docs:
        raise HTTPException(status_code=400, detail="Could not extract usable text from any of the provided files.")

    try:
        analysis_result = analyze_documents(docs, persona=sanitized_persona, task=sanitized_task)
        return PersonaResponse(**analysis_result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during the document analysis phase: {_sanitize_unicode(str(e))}"
        )
