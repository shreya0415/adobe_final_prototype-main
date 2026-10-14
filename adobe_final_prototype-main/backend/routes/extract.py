from fastapi import APIRouter, File, UploadFile, HTTPException
from utils.heading_utils import extract_headings_and_text as parse_pdf_to_outline
import tempfile
import shutil
from pathlib import Path
import os

router = APIRouter()

@router.post("/extract-headings")
async def extract_headings(pdf: UploadFile = File(...)):
    print("okay")
    if not pdf.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(pdf.file, tmp)
            tmp_path = Path(tmp.name)

        # Pass both file path and original filename
        result = parse_pdf_to_outline(tmp_path, pdf.filename)
        print("res here:", result)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Ensure temporary file is deleted
        if tmp_path and tmp_path.exists():
            os.remove(tmp_path)
