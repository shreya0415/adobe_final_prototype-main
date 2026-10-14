from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.pdf_handler import handle_pdf_upload

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        result = await handle_pdf_upload(file)
        return JSONResponse(content={
            "success": True,
            "data": result
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
