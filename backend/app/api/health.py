"""health check endpoints."""

from datetime import datetime

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """health check endpoint to verify backend is running."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "culturelens-backend",
        "version": "0.1.0",
    }


@router.get("/health/ready")
async def readiness_check():
    """readiness check for deployment health checks."""
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
    }
