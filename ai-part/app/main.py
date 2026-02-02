import threading
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from scrapers.automator import run_automation

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Car Price Analysis & Scraper API",
    description="API for analyzing car prices and automated scraping",
    version="1.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Manual Scraper Logic ---
# Note: For production, 7-day automated scraping should be handled via Linux CRON Jobs.
# See deployment_guide.md for instructions.

@app.get("/")
async def root():
    return {
        "message": "Welcome to Drivest AI Scraper API",
        "status": "running",
        "scheduler": "Managed via OS Cron (Runs every 7 days)",
        "docs": "/docs",
        "endpoints": {
            "run_scraper": "/run-scraper (POST)",
            "analyze_cars": "/analyze-cars/",
            "compare_cars": "/compare-cars/",
            "ai_suggest": "/ai-suggest/",
            "health": "/health"
        }
    }

@app.post("/run-scraper")
async def trigger_scraper(background_tasks: BackgroundTasks):
    """Manually trigger the scraper automation in the background"""
    background_tasks.add_task(run_automation)
    return {"message": "Scraper started in background"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "openai_key_set": bool(os.getenv("OPENAI_API_KEY")),
        "node_api_url": os.getenv("NODE_API_URL")
    }

# Include routes
from app.routes import router
app.include_router(router)