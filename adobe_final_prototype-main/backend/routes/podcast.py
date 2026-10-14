from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import subprocess
from fastapi.responses import FileResponse
from services.generate_audio import generate_audio
router = APIRouter()

class PodcastRequest(BaseModel):
    text: str
    voice: str = "alloy"  # default voice

@router.post("/podcast")
async def create_podcast(request: PodcastRequest):
    try:
        output_file = "podcast_output.mp3"

        # Call the generate_audio.py script
        # Pass text and voice as arguments if script supports it
        generate_audio(request.text, request.voice, output_file)


        
        return FileResponse(output_file, media_type="audio/mpeg", filename=output_file)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
