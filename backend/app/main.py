"""main fastapi application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, sessions
from app.core.config import settings

# created fastapi app
app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
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
