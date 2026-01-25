"""main fastapi application."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, sessions
from app.core.config import settings

# configure logging with emojis
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """application lifespan events."""
    # startup
    logger.info("🚀 Starting CultureLens backend...")
    logger.info(f"📦 Version: {settings.version}")
    logger.info(f"🔗 CORS Origins: {', '.join(settings.allowed_origins)}")
    logger.info("✅ Backend ready!\n")
    yield
    # shutdown
    logger.info("\n👋 Shutting down CultureLens backend...")


# created fastapi app
app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# added cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# included routers
app.include_router(health.router, tags=["health"])
app.include_router(sessions.router, prefix=settings.api_v1_prefix, tags=["sessions"])


@app.get("/")
async def root():
    """root endpoint."""
    return {
        "message": "culturelens backend api",
        "version": settings.version,
        "docs": "/docs",
    }
