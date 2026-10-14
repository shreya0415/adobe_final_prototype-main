


# main.py
from fastapi import FastAPI, Request
# ✅ 1. Import StaticFiles
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# --- Import all your route modules ---
from routes.persona_intelligence import router as persona_router
from routes import extract
from routes import insights
from routes import podcast

# --- Basic Logging Configuration ---
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


# --- Create the FastAPI App Instance ---
app = FastAPI(title="PDF Parser + LLM Proxy")


# --- EXCEPTION HANDLER ---
@app.exception_handler(UnicodeDecodeError)
async def unicode_decode_error_handler(request: Request, exc: UnicodeDecodeError):
    """
    Handles errors when the request contains invalid character encoding.
    """
    log.error(f"UnicodeDecodeError on URL: {request.url}")
    log.error(f"-> Details: {exc}")
    log.error(f"-> Client Host: {request.client.host}")
    
    return JSONResponse(
        status_code=400,
        content={
            "detail": (
                f"Invalid character encoding detected. "
                f"This is likely due to a filename or form field with non-UTF-8 characters. "
                f"Error details: {exc.reason} at position {exc.start}."
            )
        }
    )


# --- MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API ROUTERS ---
# All of your API endpoints should be included here, before the static file mount.
app.include_router(persona_router, prefix="/api")
app.include_router(extract.router, prefix="/api/pdf")
app.include_router(insights.router, prefix="/api")
app.include_router(podcast.router, prefix="/api")


# --- HEALTH CHECK ENDPOINT ---
@app.get("/health", tags=["Health"])
async def health_check():
    """Check if the API is running."""
    return {"status": "ok"}


# ✅ 2. Mount the static files directory for the frontend
# This line MUST be placed at the end, after all other routes.
# It tells FastAPI to serve the built React app from the 'static' directory.
app.mount("/", StaticFiles(directory="static", html=True), name="static")
